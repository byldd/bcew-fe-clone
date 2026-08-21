"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FormLabelRequired } from "@/components/ui/formLabelrequired";
import ScreenHeader from "./screen-header";

interface EnterSealTagProps {
	isSubmitting?: boolean;
	onBack: () => void;
	onSubmit: (sealTagNumber: string) => void;
}

export default function EnterSealTag({ isSubmitting = false, onBack, onSubmit }: EnterSealTagProps) {
	const [sealTagNumber, setSealTagNumber] = useState("");

	return (
		<div className="flex min-h-screen flex-col bg-brand-bgLightgrey">
			<ScreenHeader title="Enter Seal Tag" onBack={onBack} />

			<div className="flex flex-1 flex-col px-4">
				<p className="text-sm text-gray-500">Please make sure you seal the crate properly.</p>

				<div className="mt-4 flex flex-col gap-1.5">
					<FormLabelRequired label="Seal Tag Number" required htmlFor="seal-tag-number" />
					<Input
						id="seal-tag-number"
						type="text"
						value={sealTagNumber}
						onChange={(e) => setSealTagNumber(e.target.value)}
						placeholder="Type here"
						className="h-10"
						autoComplete="off"
					/>
				</div>
			</div>

			<div className="px-4 py-4">
				<Button
					type="button"
					variant="filled"
					onClick={() => onSubmit(sealTagNumber.trim())}
					disabled={!sealTagNumber.trim()}
					loading={isSubmitting}
					loadingText="Submitting..."
					className="h-10 w-full"
				>
					Submit
				</Button>
			</div>
		</div>
	);
}
