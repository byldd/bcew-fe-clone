import Image from "next/image";
import ImageModal from "@/components/shared/image-upload/image-modal";
import { useModal } from "@/hooks/useModal";
import { ICratePhoto } from "../types";

type Props = {
	photos: ICratePhoto[];
	note: string | null;
};

export const CratePhotosPreview = ({ photos, note }: Props) => {
	const { openModal, Modal } = useModal();

	if (!photos.length && !note) {
		return <div className="flex w-full items-center justify-center text-brand-dark50">--</div>;
	}

	const extra = photos.length - 1;

	const openGallery = () => {
		openModal({
			modalTitle: <span className="pr-12">Crate Image</span>,
			showDefaultClose: true,
			variant: "inherit",
			modalView: <CratePreviewModal photos={photos} />,
		});
	};

	return (
		<>
			<div className="flex w-full items-center justify-center gap-1">
				{photos[0] && (
					<div
						className="relative h-7 w-7 shrink-0 cursor-pointer overflow-hidden rounded-[8px] border border-gray-200"
						onClick={openGallery}
					>
						<Image src={photos[0].url} alt="crate" fill className="object-cover" />
					</div>
				)}

				{note && !photos.length && (
					<span onClick={openGallery} className="cursor-pointer text-xs font-medium text-brand-dark underline">
						View Note
					</span>
				)}

				{!!photos.length && (
					<span
						onClick={extra > 0 ? openGallery : undefined}
						className={`min-w-[14px] text-[10px] font-medium text-brand-dark ${
							extra > 0 ? "cursor-pointer underline" : "invisible"
						}`}
					>
						+{extra > 0 ? extra : 0}
					</span>
				)}
			</div>

			<Modal />
		</>
	);
};

const CratePreviewModal = ({ photos }: { photos: ICratePhoto[] }) => {
	const { openModal, closeModal, Modal } = useModal();

	return (
		<div className="space-y-4 py-4">
			<Modal />

			{!!photos.length && (
				<div className="flex flex-wrap justify-start gap-3">
					{photos.map((photo) => (
						<div
							key={photo.id}
							className="h-24 w-24 cursor-pointer items-center overflow-hidden rounded-md border"
							onClick={() =>
								openModal({
									modalTitle: "Preview Image",
									modalView: <ImageModal imageUrl={photo.url} onClose={closeModal} />,
									variant: "big",
								})
							}
						>
							<Image src={photo.url} alt="crate" width={96} height={96} className="h-full w-full object-cover" />
						</div>
					))}
				</div>
			)}
		</div>
	);
};
