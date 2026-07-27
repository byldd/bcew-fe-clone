"use client";

import { Button } from "@/components/ui/button";
import { CardTitle } from "@/components/ui/card";
import { useModal } from "@/hooks/useModal";
import TemporaryCoverageModal from "./temporary-coverage-modal";
import { ITemporaryCoverageResponse } from "@/module/employee/types";

interface Props {
	employeeId: string;
	employeeName: string;
	onStartCoverage: (coverage: ITemporaryCoverageResponse) => void;
}

const TemporaryCoverageTrigger = ({ employeeId, employeeName, onStartCoverage }: Props) => {
	const { openModal, closeModal, Modal } = useModal();

	return (
		<>
			<Button
				variant="outline"
				onClick={() =>
					openModal({
						modalTitle: (
							<CardTitle className="text-xl font-semibold">Set Temporary Coverage : {employeeName}</CardTitle>
						),
						modalView: (
							<TemporaryCoverageModal
								employeeId={employeeId}
								employeeName={employeeName}
								onClose={closeModal}
								onStartCoverage={onStartCoverage}
							/>
						),
						variant: "default",
					})
				}
			>
				Temporary Coverage
			</Button>
			<Modal />
		</>
	);
};

export default TemporaryCoverageTrigger;
