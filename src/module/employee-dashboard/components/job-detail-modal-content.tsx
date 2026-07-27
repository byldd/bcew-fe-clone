"use client";

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Plus, X } from "lucide-react";
import { TextareaField } from "@/components/ui/textareaField";
import Image from "next/image";
import { JobDetailModalContentProps } from "@/module/employee-dashboard/types";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useTypedTranslations } from "@/i18n/useTypedTranslations";
import { NAMESPACE } from "@/i18n/type";

export function JobDetailModalContent({
	job,
	homeReady,
	setHomeReady,
	homeClean,
	setHomeClean,
	note,
	setNote,
	images,
	shouldShowImageUpload,
	showNotReadyConfirm,
	setShowNotReadyConfirm,
	onCancel,
	onUpdate,
	onFinalSubmit,
	fileInputRef,
	handleImageAdd,
	handleDeleteImage,
}: JobDetailModalContentProps) {
	const isRoughJob = job.jobStatusLabel.toLowerCase() === "rough";
	const tTimelogs = useTypedTranslations(NAMESPACE.TIME_LOGS);
	const tEmployee = useTypedTranslations(NAMESPACE.EMPLOYEE);

	if (showNotReadyConfirm) {
		return (
			<div className="space-y-4">
				<p className="text-sm text-gray-600">
					{tEmployee.jobUpdatedTo} <span className="font-semibold">{tEmployee.statusNotReady}</span>{" "}
					{tEmployee.flaggedAccordingly}
				</p>
				<Button variant="ghost" onClick={() => setShowNotReadyConfirm(false)} className="w-full">
					{tEmployee.back}
				</Button>
				<Button variant="filled" onClick={onFinalSubmit} className="w-full">
					{tEmployee.submit}
				</Button>
			</div>
		);
	}

	return (
		<div className="flex-col space-y-4 overflow-y-auto px-1">
			{/* Home Ready Question */}
			<div className="space-y-3">
				<Label className="text-sm font-medium text-brand-dark60">{tEmployee.isHomeReadyToStart}</Label>
				<RadioGroup value={homeReady} onValueChange={setHomeReady} className="flex flex-row space-x-24">
					<div className="flex items-center space-x-2">
						<RadioGroupItem value="Yes" id="ready-yes" className="custom-radio" />
						<Label htmlFor="ready-yes">{tEmployee.yes}</Label>
					</div>
					<div className="flex items-center space-x-2">
						<RadioGroupItem value="No" id="ready-no" className="custom-radio" />
						<Label htmlFor="ready-no">{tEmployee.no}</Label>
					</div>
				</RadioGroup>
			</div>

			{/* Home Clean Question (Rough only) */}
			{isRoughJob && (
				<div className="space-y-3">
					<Label className="text-sm font-medium text-brand-dark60">{tEmployee.isHomeClean}</Label>
					<RadioGroup value={homeClean} onValueChange={setHomeClean} className="flex flex-row space-x-24">
						<div className="flex items-center space-x-2">
							<RadioGroupItem value="Yes" id="clean-yes" className="custom-radio" />
							<Label htmlFor="clean-yes">{tEmployee.yes}</Label>
						</div>
						<div className="flex items-center space-x-2">
							<RadioGroupItem value="No" id="clean-no" className="custom-radio" />
							<Label htmlFor="clean-no">{tEmployee.no}</Label>
						</div>
					</RadioGroup>
				</div>
			)}

			{/* Add Note */}
			<div className="space-y-2">
				<TextareaField
					id="note"
					placeholder={tEmployee.typeHere}
					label={tEmployee.addNote}
					value={note}
					onChange={(e) => setNote(e.target.value)}
				/>
			</div>

			{/* Image Upload Section */}
			{shouldShowImageUpload && (
				<div className="space-y-3">
					<Label className="text-sm font-medium text-brand-dark60">{tEmployee.addImages} (evidence mandatory)</Label>
					<div className="flex flex-wrap gap-2">
						{Array.from({ length: 5 }).map((_, idx) => {
							if (images[idx]) {
								return (
									<div
										key={idx}
										className="flex h-12 w-12 items-center justify-center overflow-hidden rounded-lg bg-brand-bgLightgrey"
									>
										<Image
											src={URL.createObjectURL(images[idx])}
											alt={`uploaded-${idx}`}
											className="h-full w-full object-cover"
											width={48}
											height={48}
										/>
										<TooltipProvider>
											<Tooltip>
												<TooltipTrigger asChild>
													<button
														type="button"
														className="absolute right-1 top-1 flex h-4 w-4 items-center justify-center rounded-full bg-black/60 hover:bg-black/80"
														onClick={() => handleDeleteImage(idx)}
													>
														<X className="h-3 w-3 text-white" />
													</button>
												</TooltipTrigger>
												<TooltipContent>{tEmployee.removeImage}</TooltipContent>
											</Tooltip>
										</TooltipProvider>
									</div>
								);
							}

							if (idx === images.length) {
								return (
									<div key={idx}>
										<Button
											variant="ghost"
											type="button"
											onClick={() => fileInputRef.current?.click()}
											className="flex h-12 w-12 items-center justify-center rounded-lg bg-brand-bgLightgrey transition-colors hover:border-gray-400"
										>
											<Plus className="h-6 w-6 text-gray-400" />
										</Button>
										<input
											ref={fileInputRef}
											type="file"
											accept="image/*"
											className="hidden"
											onChange={handleImageAdd}
										/>
									</div>
								);
							}

							return (
								<div
									key={idx}
									className="flex h-12 w-12 items-center justify-center rounded-lg border border-dashed border-gray-300 bg-brand-bgLightgrey"
								/>
							);
						})}
					</div>
					<p className="text-sm text-gray-600">
						{images.length} {tTimelogs.imagesAdded}
					</p>
				</div>
			)}

			{/* Action Buttons */}
			<div className="flex flex-col space-y-3">
				<Button onClick={onCancel} variant="ghost" className="w-full">
					{tEmployee.cancel}
				</Button>
				<Button
					variant="filled"
					onClick={onUpdate}
					className="w-full"
					disabled={!homeReady || (isRoughJob && !homeClean)}
				>
					{tEmployee.update}
				</Button>
			</div>
		</div>
	);
}
