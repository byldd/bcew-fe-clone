import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { ALLOWED_IMAGE_FILE_TYPES } from "@/utils/constants";
import { Plus, X } from "lucide-react";
import Image from "next/image";
import React, { useRef } from "react";
import ImageModal from "./image-modal";
import { useModal } from "@/hooks/useModal";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils/utils";
import { useTypedTranslations } from "@/i18n/useTypedTranslations";
import { NAMESPACE } from "@/i18n/type";

const ImageUpload = ({
	value = [],
	onChange,
	label,
	disabled,
	labelClassName,
	canDelete = true,
}: {
	value: { keyFile: string; file?: File; url: string }[];
	onChange: (value: { keyFile: string; file?: File; url: string }[]) => void;
	label?: string;
	disabled?: boolean;
	labelClassName?: string;
	canDelete?: boolean;
}) => {
	const fileInputRef = useRef<HTMLInputElement>(null);
	const { Modal, closeModal, openModal } = useModal();

	const tTimelogs = useTypedTranslations(NAMESPACE.TIME_LOGS);

	const tEmployee = useTypedTranslations(NAMESPACE.EMPLOYEE);

	const tAdmin = useTypedTranslations(NAMESPACE.ADMIN);

	const handleImageAdd = (e: React.ChangeEvent<HTMLInputElement>) => {
		const files = e.target.files;

		if (files && files.length > 0) {
			const updatedImages = [
				...value,
				...Array.from(files).map((file) => ({
					/**
					 * IMPORTANT: unique key-file name for each file, so we can match it with its corresponding signed url, and upload the file to s3
					 *  we are fetching all files signed urls at once that's why we need to generate unique key-file name for each file on FE
					 */
					keyFile: `${file.name}-${Date.now()}`,
					file,
					url: URL.createObjectURL(file),
				})),
			];
			onChange(updatedImages);
		}
	};

	const handleImageClick = (imageUrl: string) => {
		openModal({
			modalTitle: tAdmin.previewImage,
			modalView: <ImageModal imageUrl={imageUrl} onClose={closeModal} />,
			variant: "big",
		});
	};

	const handleDeleteImage = (keyFile: string) => {
		const updatedImages = value.filter((img) => img.keyFile !== keyFile);
		onChange(updatedImages);
	};

	return (
		<div className="space-y-2">
			<Label className={cn("text-sm font-medium text-brand-dark60", labelClassName)}>{label}</Label>
			<div className="flex flex-wrap gap-2">
				{value?.map((image, idx) => {
					if (image.url) {
						return (
							<div
								key={idx}
								className="relative flex h-20 w-20 items-center justify-center overflow-hidden rounded-[16px] border border-dashed border-brand-border bg-brand-bgLightgrey"
							>
								<Image
									src={image.url}
									alt={`uploaded-${idx}`}
									className="h-full w-full cursor-pointer object-cover"
									width={94}
									height={94}
									onClick={() => handleImageClick(image.url)}
								/>

								{canDelete && !disabled && (
									<TooltipProvider>
										<Tooltip>
											<TooltipTrigger asChild>
												<button
													type="button"
													className="absolute right-1 top-1 flex h-6 w-6 items-center justify-center rounded-full bg-black/60 hover:bg-black/80"
													onClick={() => handleDeleteImage(image.keyFile)}
												>
													<X className="h-4 w-4 text-white" />
												</button>
											</TooltipTrigger>
											<TooltipContent>{tEmployee.removeImage}</TooltipContent>
										</Tooltip>
									</TooltipProvider>
								)}

								<Modal />
							</div>
						);
					}

					return (
						<div
							key={idx}
							className="flex h-24 w-24 items-center justify-center rounded-[16px] border border-dashed border-brand-border bg-brand-bgLightgrey"
						/>
					);
				})}

				{!disabled && (
					<div>
						<Button
							disabled={disabled}
							variant="ghost"
							type="button"
							onClick={() => fileInputRef.current?.click()}
							className="flex h-20 w-20 items-center justify-center rounded-[16px] border border-dashed border-brand-border bg-brand-bgLightgrey transition-colors hover:border-gray-400"
						>
							<Plus className="!h-6 !w-6 text-gray-400" />
						</Button>
						<input
							ref={fileInputRef}
							type="file"
							accept={ALLOWED_IMAGE_FILE_TYPES.join(",")}
							className="hidden"
							onChange={handleImageAdd}
							multiple
						/>
					</div>
				)}
			</div>
			<p className="text-xs text-gray-600">
				{value?.length} {tTimelogs.imagesAdded}
			</p>
		</div>
	);
};

export default ImageUpload;
