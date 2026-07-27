"use client";

import { Button } from "@/components/ui/button";

interface Props {
	employeeName: string;
	transferredCount: number;
	onClose: () => void;
	onConfirm: () => void;
}

const ConfirmDeactivationModal = ({ employeeName, transferredCount, onClose, onConfirm }: Props) => {
	const firstName = employeeName.split(" ")[0];

	return (
		<div className="space-y-4 border-t">
			<div className="rounded-[10px] p-3 text-sm text-brand-dark60">
				All {transferredCount} open assignments have been transferred. {firstName} will immediately lose portal access.
				This can be reversed by reactivating the account.
			</div>

			<div className="flex justify-end gap-2 border-t pt-2">
				<Button type="button" variant="outline" className="flex-1" onClick={onClose}>
					Cancel
				</Button>
				<Button type="button" variant="filled" className="flex-1" onClick={onConfirm}>
					Confirm Deactivation
				</Button>
			</div>
		</div>
	);
};

export default ConfirmDeactivationModal;
