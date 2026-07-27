// Browsers leave File.type empty for formats they don't natively decode
// (notably HEIC/HEIF from iPhones), which breaks the presigned-url request that
// requires a fileType. Fall back to a MIME type derived from the extension.
const EXTENSION_MIME_TYPES: Record<string, string> = {
	heic: "image/heic",
	heif: "image/heif",
	jpg: "image/jpeg",
	jpeg: "image/jpeg",
	png: "image/png",
	pdf: "application/pdf",
	doc: "application/msword",
	docx: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
};

const APPLICATION_OCTET_STREAM = "application/octet-stream";

export const getMimeTypeFromFileName = (fileName: string): string => {
	const extension = fileName.split(".").pop()?.toLowerCase() ?? "";
	return EXTENSION_MIME_TYPES[extension] ?? APPLICATION_OCTET_STREAM;
};

export const getFileMimeType = (file?: File): string => {
	if (file?.type) return file.type;
	return file ? getMimeTypeFromFileName(file.name) : "";
};
