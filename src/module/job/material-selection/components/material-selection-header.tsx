import BackButton from "@/components/common/back-button";
import { Button } from "@/components/ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function MaterialSelectionHeader({
	onAddMissingItemRequest,
	onViewMissingItemRequests,
	isForeman,
}: {
	onAddMissingItemRequest: () => void;
	onViewMissingItemRequests?: () => void;
	isForeman?: boolean;
}) {
	return (
		<div className="mb-4 flex items-center justify-between gap-2 !px-0">
			<div className="flex items-center gap-2">
				<BackButton />
				<h1 className="text-xl font-bold text-brand-dark">Material Selection</h1>
			</div>
			<DropdownMenu>
				<DropdownMenuTrigger asChild>
					<Button variant="filled" size="sm" className="h-9 shrink-0 rounded-[8px] px-4 text-xs">
						Unknown Items
					</Button>
				</DropdownMenuTrigger>
				<DropdownMenuContent align="end" className="min-w-[160px]">
					{!isForeman && <DropdownMenuItem onSelect={onAddMissingItemRequest}>Add request</DropdownMenuItem>}
					{onViewMissingItemRequests && (
						<DropdownMenuItem onSelect={onViewMissingItemRequests}>View requests</DropdownMenuItem>
					)}
				</DropdownMenuContent>
			</DropdownMenu>
		</div>
	);
}
