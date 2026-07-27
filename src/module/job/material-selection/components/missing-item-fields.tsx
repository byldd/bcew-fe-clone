"use client";

import { Control, Controller, FieldErrors } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import FormError from "@/components/ui/form-error";
import ImageUpload from "@/components/shared/image-upload/image-upload";
import { MAX_DESCRIPTION_LENGTH } from "../utils/consttants";
import { MissingItemFormValues } from "../hooks/missing-item-form";

const labelClassName = "text-sm font-medium text-brand-dark50";

export function MissingItemFields({
	control,
	errors,
	disabled,
}: {
	control: Control<MissingItemFormValues>;
	errors: FieldErrors<MissingItemFormValues>;
	disabled?: boolean;
}) {
	return (
		<div className="space-y-4">
			<div className="space-y-1">
				<Label className={labelClassName}>Describe the item*</Label>
				<Controller
					control={control}
					name="description"
					render={({ field }) => (
						<div className="px-1">
							<Textarea
								{...field}
								value={field.value ?? ""}
								placeholder="Where found, size, material, markings"
								maxLength={MAX_DESCRIPTION_LENGTH}
								className="min-h-[90px] rounded-[12px] text-sm text-brand-dark"
							/>
						</div>
					)}
				/>
				<FormError error={errors.description?.message} />
			</div>

			<div className="space-y-1">
				<Label className={labelClassName}>Quantity*</Label>
				<Controller
					control={control}
					name="quantity"
					render={({ field }) => (
						<Input
							{...field}
							value={field.value ?? ""}
							type="number"
							min={1}
							inputMode="numeric"
							placeholder="e.g. 1"
						/>
					)}
				/>
				<FormError error={errors.quantity?.message} />
			</div>

			<div>
				<Controller
					control={control}
					name="images"
					render={({ field }) => (
						<ImageUpload
							label="Add Image"
							value={field.value ?? []}
							onChange={(value) => field.onChange(value)}
							disabled={disabled}
							labelClassName="text-xs font-semibold text-brand-dark50"
						/>
					)}
				/>
				<FormError error={errors.images?.message} />
			</div>
		</div>
	);
}
