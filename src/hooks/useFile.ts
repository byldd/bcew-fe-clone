import { apiClient } from "@/lib/api";
import { IApiResponse } from "@/types";
import { IFileUploadable, IGetPresignedUrlPayload, IGetPresignedUrlResponse } from "@/types/file-upload";
import { getFileMimeType } from "@/lib/utils/file";
import { useMutation } from "@tanstack/react-query";

export const useGetFilesSignedUrls = () => {
	return useMutation({
		mutationKey: ["get-files-signed-urls"],
		mutationFn: async (payload: IGetPresignedUrlPayload[]) => {
			const { data } = await apiClient.post<IApiResponse<IGetPresignedUrlResponse[]>>("/aws/presigned-urls", {
				files: payload,
			});
			return data.data;
		},
	});
};

export const useUploadToS3 = () => {
	return useMutation({
		mutationKey: ["upload-to-s3"],
		mutationFn: async ({ file, url }: { file: File; url: string }) => {
			const response = await fetch(url, {
				method: "PUT",
				headers: {
					"Content-Type": getFileMimeType(file),
				},
				body: file,
			});
			if (!response.ok) {
				throw new Error("Failed to upload to S3");
			}
		},
	});
};

export const useHandleFileUpload = () => {
	const { mutateAsync: getFilesSignedUrls } = useGetFilesSignedUrls();
	const { mutateAsync: uploadToS3 } = useUploadToS3();

	const getSignedUrls = async (files: IFileUploadable[]) => {
		const filesPayload = files.map((file) => ({
			keyFile: file.keyFile,
			fileType: getFileMimeType(file.file),
		}));
		if (filesPayload.length === 0) {
			return [];
		}
		const signedUrls = await getFilesSignedUrls(filesPayload);
		return signedUrls;
	};

	/**
	 * In form we have unique key-file name generated for each file at the time of input onChange,
	 *  so we match it with signed url response and upload the file to s3
	 */
	const handleFileUpload = async ({
		signedUrls,
		filesToUpload,
	}: {
		signedUrls: IGetPresignedUrlResponse[];
		filesToUpload: IFileUploadable[];
	}) => {
		const uploadPromises = signedUrls.map((signedUrl) => {
			const file = filesToUpload.find((file) => file.keyFile === signedUrl.keyFile);
			if (file && file.file) {
				return uploadToS3({ file: file.file, url: signedUrl.url });
			}
		});
		await Promise.all(uploadPromises);
		return signedUrls;
	};

	/**
	 * In form data there are files, that newly uploaded or already uploaded come from db, this function responsible to return only newly uploaded files,
	 * which can be filtered by checking if file is not null
	 */
	const getFilesToUpload = (files: IFileUploadable[]) => {
		return files.filter((file) => file.file);
	};

	return { handleFileUpload, getSignedUrls, getFilesToUpload };
};
