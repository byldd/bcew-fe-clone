"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import type { AxiosError } from "axios";
import { useHandleFileUpload } from "@/hooks/useFile";
import { openErrorToast, openSuccessToast } from "@/components/toast";
import { useCreateSubContractorMissingItemRequest } from "../hooks/useSubContractorPullList";
import { missingItemFormSchema, MissingItemFormValues } from "../hooks/missing-item-form";
import { buildMissingItemRequestFields } from "../utils/missing-item-payload";
import { MissingItemFields } from "./missing-item-fields";

export function SubContractorMissingItemModalContent({
	jobDailyRecordId,
	onClose,
}: {
	jobDailyRecordId: string;
	onClose: () => void;
}) {
	const { mutateAsync: createRequest, isPending } = useCreateSubContractorMissingItemRequest();
	const { getFilesToUpload, getSignedUrls, handleFileUpload } = useHandleFileUpload();

	const {
		control,
		handleSubmit,
		formState: { errors },
	} = useForm<MissingItemFormValues>({
		resolver: zodResolver(missingItemFormSchema),
		defaultValues: {
			description: "",
			quantity: undefined,
			images: [],
		},
	});

	const onSubmit = async (data: MissingItemFormValues) => {
		try {
			const submittedImages = data.images ?? [];
			const filesToUpload = getFilesToUpload(submittedImages);

			const publicUrlByKeyFile = new Map<string, string>();
			if (filesToUpload.length) {
				const signedUrls = await getSignedUrls(filesToUpload);
				await handleFileUpload({ signedUrls, filesToUpload });

				for (const { keyFile, url } of signedUrls) {
					try {
						const parsed = new URL(url);
						publicUrlByKeyFile.set(keyFile, `${parsed.origin}${parsed.pathname}`);
					} catch {
						publicUrlByKeyFile.set(keyFile, url);
					}
				}
			}

			await createRequest({
				jobDailyRecordId,
				...buildMissingItemRequestFields(data, publicUrlByKeyFile),
			});

			openSuccessToast("Request sent to foreman");
			onClose();
		} catch (error) {
			openErrorToast({
				error: error as Error | AxiosError<{ message: string }>,
				message: "Failed to send request. Please try again.",
			});
		}
	};

	return (
		<form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
			<MissingItemFields control={control} errors={errors} disabled={isPending} />

			<Button type="submit" variant="filled" className="mt-5 h-10 w-full" loading={isPending} disabled={isPending}>
				Send to Foreman
			</Button>
		</form>
	);
}
