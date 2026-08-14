import { Button } from "@/components/ui/button";
import { ALLOWED_DOCUMENT_FILE_TYPES } from "@/utils/constants";
import { FileText, Plus, X } from "lucide-react";
import Image from "next/image";
import React, { useRef } from "react";
import { fileNameFromKeyFile, isImageFile, PreviewFile, useFilePreview } from "@/hooks/useFilePreview";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useTypedTranslations } from "@/i18n/useTypedTranslations";
import { NAMESPACE } from "@/i18n/type";

type UploadedFile = PreviewFile;

const SUPPORTED_EXTENSIONS_LABEL = "JPG, JPEG, PNG, HEIC, PDF, DOC";

// Same upload/delete/preview behavior as ImageUpload, but accepts PDFs/DOCs
// alongside images (with a file-icon preview for non-image files) — kept as a
// separate component so ImageUpload's existing consumers stay untouched.
const DocumentUpload = ({
	value = [],
	onChange,
	disabled,
	canDelete = true,
}: {
	value: UploadedFile[];
	onChange: (value: UploadedFile[]) => void;
	disabled?: boolean;
	canDelete?: boolean;
}) => {
	const fileInputRef = useRef<HTMLInputElement>(null);
	const { Modal, openPreview } = useFilePreview();
	const tEmployee = useTypedTranslations(NAMESPACE.EMPLOYEE);

	const handleFileAdd = (e: React.ChangeEvent<HTMLInputElement>) => {
		const files = e.target.files;

		if (files && files.length > 0) {
			const updatedFiles = [
				...value,
				...Array.from(files).map((file) => ({
					keyFile: `${file.name}-${Date.now()}`,
					file,
					url: URL.createObjectURL(file),
				})),
			];
			onChange(updatedFiles);
		}
	};

	const handleDeleteFile = (keyFile: string) => {
		onChange(value.filter((file) => file.keyFile !== keyFile));
	};

	return (
		<div className="space-y-2">
			<div className="flex flex-wrap gap-2">
				{value?.map((image, idx) => {
					if (!image.url) {
						return (
							<div
								key={idx}
								className="flex h-24 w-24 items-center justify-center rounded-[16px] border border-dashed border-brand-border bg-brand-bgLightgrey"
							/>
						);
					}

					return (
						<div
							key={idx}
							className="relative flex h-20 w-20 items-center justify-center overflow-hidden rounded-[16px] border border-dashed border-brand-border bg-brand-bgLightgrey"
						>
							{isImageFile(image) ? (
								<Image
									src={image.url}
									alt={`uploaded-${idx}`}
									className="h-full w-full cursor-pointer object-cover"
									width={94}
									height={94}
									onClick={() => openPreview(image)}
								/>
							) : (
								<button
									type="button"
									onClick={() => openPreview(image)}
									className="flex h-full w-full flex-col items-center justify-center gap-1 p-1"
								>
									<FileText className="h-6 w-6 text-brand-grey" />
									<span className="w-full truncate px-1 text-center text-[10px] text-brand-grey">
										{fileNameFromKeyFile(image.keyFile)}
									</span>
								</button>
							)}

							{canDelete && !disabled && (
								<TooltipProvider>
									<Tooltip>
										<TooltipTrigger asChild>
											<button
												type="button"
												className="absolute right-1 top-1 flex h-6 w-6 items-center justify-center rounded-full bg-black/60 hover:bg-black/80"
												onClick={() => handleDeleteFile(image.keyFile)}
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
							accept={ALLOWED_DOCUMENT_FILE_TYPES.join(",")}
							className="hidden"
							onChange={handleFileAdd}
							multiple
						/>
					</div>
				)}
			</div>

			<p className="text-xs text-gray-500">{SUPPORTED_EXTENSIONS_LABEL}</p>

			<p className="text-xs text-gray-600">
				{value?.length ?? 0} document{(value?.length ?? 0) === 1 ? "" : "s"} uploaded
			</p>
		</div>
	);
};

export default DocumentUpload;
