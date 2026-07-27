"use client";

import { Button } from "@/components/ui/button";
import { useEndTemporaryCoverage } from "@/module/employee/hooks/useEmployeeOffboarding";

interface Props {
	employeeId: string;
	employeeName: string;
	coveringEmployeeName: string;
	onClose: () => void;
	onConfirm: () => void;
}

const EndCoverageModal = ({ employeeId, employeeName, coveringEmployeeName, onClose, onConfirm }: Props) => {
	const firstName = employeeName.split(" ")[0];

	const endCoverageMutation = useEndTemporaryCoverage(employeeId);

	const handleConfirm = () => {
		endCoverageMutation.mutate(undefined, {
			onSettled: onConfirm,
		});
	};

	return (
		<div className="space-y-4 border-t">
			<div className="rounded-[10px] p-3 text-sm text-brand-dark60">
				Ending coverage now will immediately remove {coveringEmployeeName}&apos;s temporary access to {firstName}&apos;s
				schedule and permissions. All work remains assigned to {firstName}.
			</div>

			<div className="flex justify-end gap-2 border-t pt-2">
				<Button type="button" variant="outline" className="flex-1" onClick={onClose}>
					Cancel
				</Button>
				<Button
					type="button"
					variant="filled"
					className="flex-1"
					loading={endCoverageMutation.isPending}
					onClick={handleConfirm}
				>
					End Coverage
				</Button>
			</div>
		</div>
	);
};

export default EndCoverageModal;
