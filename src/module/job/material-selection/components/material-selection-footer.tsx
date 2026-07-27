import { Button } from "@/components/ui/button";

export default function MaterialSelectionFooter({
	selectedCount,
	onClearAll,
	onConfirm,
	isConfirmDisabled = false,
}: {
	selectedCount: number;
	onClearAll: () => void;
	onConfirm: () => void;
	isConfirmDisabled?: boolean;
}) {
	return (
		<div className="shrink-0 border-t border-brand-dark10 bg-white px-4 py-3">
			<div className="flex items-center justify-between gap-3">
				<Button variant="outline" className="h-10 w-full" onClick={onClearAll}>
					Clear All
				</Button>
				<Button variant="filled" className="h-10 w-full" onClick={onConfirm} disabled={isConfirmDisabled}>
					Preview Request{selectedCount ? ` (${selectedCount})` : ""}
				</Button>
			</div>
		</div>
	);
}
