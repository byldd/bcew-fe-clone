import { Button } from "@/components/ui/button";

interface SealIntactPromptProps {
	onSelect: (sealIntact: boolean) => void;
}

export default function SealIntactPrompt({ onSelect }: SealIntactPromptProps) {
	return (
		<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-6">
			<div className="w-full max-w-xs rounded-2xl bg-white p-5 shadow-xl">
				<p className="text-center text-base font-semibold text-gray-900">Was the security seal intact?</p>

				<div className="mt-4 flex gap-3">
					<Button
						type="button"
						variant="outline"
						onClick={() => onSelect(false)}
						className="h-auto flex-1 rounded-xl border-gray-200 py-3 text-sm"
					>
						No
					</Button>
					<Button
						type="button"
						variant="filled"
						onClick={() => onSelect(true)}
						className="h-auto flex-1 rounded-xl py-3 text-sm"
					>
						Yes
					</Button>
				</div>
			</div>
		</div>
	);
}
