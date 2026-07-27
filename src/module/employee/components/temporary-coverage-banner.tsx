"use client";

import { Button } from "@/components/ui/button";
import { CardTitle } from "@/components/ui/card";
import { useModal } from "@/hooks/useModal";
import EndCoverageModal from "./end-coverage-modal";

interface Props {
	employeeId: string;
	employeeName: string;
	coveringEmployeeName: string;
	onEndCoverage: () => void;
}

const TemporaryCoverageBanner = ({ employeeId, employeeName, coveringEmployeeName, onEndCoverage }: Props) => {
	const { openModal, closeModal, Modal } = useModal();
	const firstName = employeeName.split(" ")[0];

	return (
		<div className="mb-4 flex items-center justify-between rounded-[10px] border border-[#FDE68AE6] bg-[#FFFBEB] px-4 py-3 text-sm text-[#78350F]">
			<span>
				{firstName} is currently covered by{" "}
				<span className="font-semibold text-brand-dark">{coveringEmployeeName}</span>.
			</span>
			<Button
				type="button"
				variant="outline"
				size="sm"
				onClick={() =>
					openModal({
						modalTitle: <CardTitle className="text-xl font-semibold">End Coverage for {employeeName}?</CardTitle>,
						modalView: (
							<EndCoverageModal
								employeeId={employeeId}
								employeeName={employeeName}
								coveringEmployeeName={coveringEmployeeName}
								onClose={closeModal}
								onConfirm={() => {
									closeModal();
									onEndCoverage();
								}}
							/>
						),
						variant: "default",
					})
				}
			>
				End Coverage
			</Button>
			<Modal />
		</div>
	);
};

export default TemporaryCoverageBanner;
