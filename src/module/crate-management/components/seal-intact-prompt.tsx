import { Button } from "@/components/ui/button";

interface SealIntactPromptProps {
	onSelect: (sealIntact: boolean) => void;
}

export default function SealIntactPrompt({ onSelect }: SealIntactPromptProps) {
	return (
		<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-6">
			<div className="w-full max-w-xs rounded-[8px] bg-white p-5 shadow-xl">
				<p className="text-center text-base font-medium text-gray-900">Was the security seal intact?</p>

				<div className="mt-4 flex gap-3">
					<Button type="button" variant="outline" onClick={() => onSelect(false)} className="h-10 w-full">
						No
					</Button>
					<Button type="button" variant="filled" onClick={() => onSelect(true)} className="h-10 w-full">
						Yes
					</Button>
				</div>
			</div>
		</div>
	);
}
