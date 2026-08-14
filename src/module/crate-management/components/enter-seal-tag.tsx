"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
					<label htmlFor="seal-tag-number" className="text-sm font-medium text-gray-700">
						Seal Tag Number*
					</label>
					<Input
						id="seal-tag-number"
						type="text"
						value={sealTagNumber}
						onChange={(e) => setSealTagNumber(e.target.value)}
						placeholder="Type here"
						className="h-auto rounded-xl px-4 py-3 text-sm"
						autoComplete="off"
					/>
				</div>
			</div>

			<div className="px-4 pb-8 pt-4">
				<Button
					type="button"
					variant="filled"
					onClick={() => onSubmit(sealTagNumber.trim())}
					disabled={!sealTagNumber.trim()}
					loading={isSubmitting}
					loadingText="Submitting..."
					className="h-auto w-full rounded-2xl py-4 text-sm"
				>
					Submit
				</Button>
			</div>
		</div>
	);
}
