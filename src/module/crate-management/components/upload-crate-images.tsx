"use client";

import { useRef, useState } from "react";
import { Camera } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { FormLabelRequired } from "@/components/ui/formLabelrequired";
import PhotoGrid from "./photo-grid";
import ScreenHeader from "./screen-header";

interface UploadCrateImagesProps {
	crateId: string;
	sealIntact: boolean;
	isSubmitting?: boolean;
	onBack: () => void;
	onSubmit: (payload: { photos: File[]; note: string }) => void;
}

export default function UploadCrateImages({
	crateId,
	sealIntact,
	isSubmitting = false,
	onBack,
	onSubmit,
}: UploadCrateImagesProps) {
	const fileInputRef = useRef<HTMLInputElement>(null);
	const [photos, setPhotos] = useState<File[]>([]);
	const [note, setNote] = useState("");

	const handleFilesSelected = (event: React.ChangeEvent<HTMLInputElement>) => {
		const files = Array.from(event.target.files ?? []);
		event.target.value = "";
		if (files.length === 0) return;
		setPhotos((prev) => [...prev, ...files]);
	};

	const removePhoto = (index: number) => {
		setPhotos((prev) => prev.filter((_, i) => i !== index));
	};

	return (
		<div className="flex min-h-screen flex-col bg-brand-bgLightgrey">
			<ScreenHeader title="Upload Crate Images" onBack={onBack} />

			<div className="flex flex-1 flex-col px-4">
				<p className="text-sm font-medium text-brand-dark50">Crate ID {crateId}</p>

				<Button
					type="button"
					onClick={() => fileInputRef.current?.click()}
					className="mt-3 flex flex-col items-center justify-center gap-2 rounded-2xl border border-dashed border-gray-300 bg-white py-10 text-gray-400 transition-colors active:bg-gray-50"
				>
					<Camera className="h-6 w-6" />
					<span className="text-sm">Tap to add photo</span>
				</Button>
				<Input
					ref={fileInputRef}
					type="file"
					accept="image/*"
					multiple
					className="hidden"
					onChange={handleFilesSelected}
				/>

				<div className="mt-4 space-y-1">
					<div className="flex items-center justify-between">
						<p className="text-sm font-medium text-brand-dark50">Added Photos</p>
						<p className="text-xs text-gray-400">{photos.length} photos added</p>
					</div>

					{photos.length > 0 && (
						<div className="mt-[-2]">
							<PhotoGrid photos={photos} onRemove={removePhoto} />
						</div>
					)}
				</div>

				<div className="mt-4 space-y-1">
					<FormLabelRequired label="Note (optional)" htmlFor="crate-note" />

					<Textarea
						id="crate-note"
						value={note}
						onChange={(e) => setNote(e.target.value)}
						placeholder="Add details"
						className="min-h-[80px] rounded-xl bg-white text-sm"
					/>
				</div>

				{!sealIntact && (
					<p className="mt-4 rounded-xl bg-red-50 px-3 py-2 text-xs text-red-600">
						You&apos;ve marked the Security Seal is Broken or Missing.
					</p>
				)}
			</div>

			<div className="px-4 py-4">
				<Button
					type="button"
					variant="filled"
					onClick={() => onSubmit({ photos, note })}
					loading={isSubmitting}
					loadingText="Submitting..."
					className="h-10 w-full"
				>
					{sealIntact ? "Submit" : "Continue"}
				</Button>
			</div>
		</div>
	);
}
