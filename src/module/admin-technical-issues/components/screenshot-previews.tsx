import ImageModal from "@/components/shared/image-upload/image-modal";
import { useModal } from "@/hooks/useModal";

import Image from "next/image";

export const ScreenshotPreview = ({ images }: { images: { id: string; url: string }[] }) => {
	const { openModal, Modal, closeModal } = useModal();

	if (!images || images.length === 0) return null;

	const extra = images.length - 1;

	const openGallery = () => {
		const firstImage = images[0];
		if (images.length === 1 && firstImage) {
			openModal({
				modalTitle: <span className="pr-12">Screenshot</span>,
				showDefaultClose: true,
				variant: "medium",
				modalView: <ImageModal imageUrl={firstImage.url} onClose={closeModal} />,
			});
		}
		openModal({
			modalTitle: <span className="pr-12">Screenshots</span>,
			showDefaultClose: true,
			variant: "medium",
			modalView: <GalleryModal images={images} />,
		});
	};

	return (
		<>
			<div className="flex items-center justify-center gap-1">
				{images && images[0] && (
					<div
						className="relative h-7 w-7 shrink-0 cursor-pointer overflow-hidden rounded-[8px] border border-gray-200"
						onClick={openGallery}
					>
						<Image src={images[0].url} alt="screenshot" fill className="object-cover" />
					</div>
				)}

				<span
					onClick={extra > 0 ? openGallery : undefined}
					className={`min-w-[14px] text-[10px] font-medium text-brand-dark ${
						extra > 0 ? "cursor-pointer underline" : "invisible"
					}`}
				>
					+{extra > 0 ? extra : 0}
				</span>
			</div>

			<Modal />
		</>
	);
};

const GalleryModal = ({ images }: { images: { id: string; url: string }[] }) => {
	const { openModal, closeModal, Modal } = useModal();
	return (
		<div className="flex flex-wrap justify-center gap-3">
			<Modal />
			{images.map((img) => (
				<div
					key={img.id}
					className="h-24 w-24 cursor-pointer items-center overflow-hidden rounded-md border"
					onClick={() =>
						openModal({
							modalTitle: "Preview Image",
							modalView: <ImageModal imageUrl={img.url} onClose={closeModal} />,
							variant: "big",
						})
					}
				>
					<Image src={img.url} alt="screenshot" width={96} height={96} className="h-full w-full object-cover" />
				</div>
			))}
		</div>
	);
};
