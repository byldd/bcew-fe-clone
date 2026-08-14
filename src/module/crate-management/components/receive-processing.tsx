"use client";

import { useEffect, useState } from "react";
import { Check, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils/utils";

const PROCESSING_STEPS = ["QR URL decoded", "Crate ID extracted", "Syncing to server", "Notifying admin"] as const;

interface ReceiveProcessingProps {
	isComplete: boolean;
}

export default function ReceiveProcessing({ isComplete }: ReceiveProcessingProps) {
	const [completedCount, setCompletedCount] = useState(2);

	useEffect(() => {
		if (isComplete) {
			setCompletedCount(PROCESSING_STEPS.length);
			return;
		}

		if (completedCount >= PROCESSING_STEPS.length - 1) return;

		const timer = setTimeout(() => setCompletedCount((count) => count + 1), 500);
		return () => clearTimeout(timer);
	}, [completedCount, isComplete]);

	return (
		<div className="flex min-h-screen flex-col items-center justify-center bg-brand-bgLightgrey px-6">
			<p className="text-sm font-semibold text-gray-900">Logging crate receipt...</p>
			<p className="mt-1 text-xs text-gray-400">Syncing with servers</p>

			<div className="mt-8 w-full max-w-xs space-y-3">
				{PROCESSING_STEPS.map((step, index) => {
					const isDone = index < completedCount;
					const isCurrent = index === completedCount;
					return (
						<div key={step} className="flex items-center gap-3 rounded-2xl border border-gray-100 bg-white px-3 py-2">
							<div
								className={cn(
									"flex h-5 w-5 items-center justify-center rounded-full",
									isDone ? "bg-green-500" : "border border-gray-300"
								)}
							>
								{isDone && <Check className="h-3 w-3 text-white" />}
								{isCurrent && !isDone && <Loader2 className="h-3 w-3 animate-spin text-gray-400" />}
							</div>
							<span className={cn("text-sm", isDone ? "text-gray-900" : "text-gray-400")}>{step}</span>
						</div>
					);
				})}
			</div>
		</div>
	);
}
