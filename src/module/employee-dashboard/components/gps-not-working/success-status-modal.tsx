"use client";

import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";

interface SuccessStatusModalProps {
	message: string;
	onClose: () => void;
}

export function SuccessStatusModal({ message, onClose }: SuccessStatusModalProps) {
	return (
		<div className="flex flex-col items-center space-y-5 text-center">
			{/* Check Circle */}
			<div className="flex h-16 w-16 items-center justify-center rounded-full border-4 border-brand-greenAccent">
				<Check className="h-8 w-8 text-brand-greenAccent" strokeWidth={3} />
			</div>

			{/* Message */}
			<p className="text-sm font-medium text-brand-dark60">{message}</p>

			{/* Button */}
			<Button variant="filled" className="w-full" onClick={onClose}>
				Okay
			</Button>
		</div>
	);
}
