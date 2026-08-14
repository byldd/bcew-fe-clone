"use client";

import ImageModal from "@/components/shared/image-upload/image-modal";
import PdfModal from "@/components/shared/document-upload/pdf-modal";
import { useModal } from "@/hooks/useModal";
import { NAMESPACE } from "@/i18n/type";
import { useTypedTranslations } from "@/i18n/useTypedTranslations";
import { PDF_MIME_TYPE } from "@/utils/constants";

export type PreviewFile = { keyFile: string; file?: File; url: string };

export const fileNameFromKeyFile = (keyFile: string): string => keyFile.replace(/-\d+$/, "");

export const isImageFile = (file: PreviewFile): boolean => {
	if (file.file) return file.file.type.startsWith("image/");
	return /\.(jpe?g|png|heic|heif)$/i.test(fileNameFromKeyFile(file.keyFile));
};

export const isPdfFile = (file: PreviewFile): boolean => {
	if (file.file) return file.file.type === PDF_MIME_TYPE;
	return /\.pdf$/i.test(fileNameFromKeyFile(file.keyFile));
};

// Shared preview behaviour: images open in the zoom/rotate ImageModal, PDFs in the
// iframe PdfModal, and anything else falls back to a new browser tab.
export const useFilePreview = () => {
	const { Modal, closeModal, openModal } = useModal();
	const tAdmin = useTypedTranslations(NAMESPACE.ADMIN);

	const openPreview = (file: PreviewFile) => {
		if (isImageFile(file)) {
			openModal({
				modalTitle: tAdmin.previewImage,
				modalView: <ImageModal imageUrl={file.url} onClose={closeModal} />,
				variant: "big",
			});
			return;
		}

		if (isPdfFile(file)) {
			const fileName = fileNameFromKeyFile(file.keyFile);
			openModal({
				modalTitle: fileName,
				modalView: <PdfModal fileUrl={file.url} fileName={fileName} />,
				variant: "big",
			});
			return;
		}

		window.open(file.url, "_blank", "noopener,noreferrer");
	};

	return { Modal, openPreview };
};
