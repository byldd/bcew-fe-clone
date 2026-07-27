export interface IGetPresignedUrlPayload {
	fileType: string;
	keyFile: string;
}

export interface IGetPresignedUrlResponse {
	url: string;
	keyFile: string;
}

export interface IFileUploadable {
	keyFile: string;
	file?: File;
	url: string;
}
