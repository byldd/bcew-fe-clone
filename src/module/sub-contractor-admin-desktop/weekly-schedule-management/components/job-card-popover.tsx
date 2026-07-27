import React from "react";
import { IWeekScheduleResponse } from "@/module/schedule-management/weekly-schedule-management/types/schedule-interface";

import JobPopoverItem from "@/module/schedule-management/weekly-schedule-management/components/job-popover-item";
import { useModal } from "@/hooks/useModal";
import { AssignCrewDesktopModal } from "@/module/sub-contractor-admin-desktop/weekly-schedule-management/components/assign-crew-modal";
import { useTypedTranslations } from "@/i18n/useTypedTranslations";
import { NAMESPACE } from "@/i18n/type";

const JobCardPopover = ({
	bcewJob,
	dailyJobWithEmployee,
	onClose,
}: {
	bcewJob?: IWeekScheduleResponse["bcewJobs"][number];
	date: Date;
	dailyJobWithEmployee: IWeekScheduleResponse["dailyJobs"][number];
	onClose: () => void;
}) => {
	const { openModal, Modal, closeModal } = useModal();
	const tSub = useTypedTranslations(NAMESPACE.SUBCONTRACTOR);

	const handleClose = () => {
		closeModal();
		onClose();
	};

	const handleAssignCrew = () => {
		openModal({
			modalTitle: (
				<p>
					{bcewJob?.schlin?.actrec.jobnme || bcewJob?.srvinv?.actrec.jobnme} (
					{bcewJob?.schlin?.tsknme || bcewJob?.srvinv?.ordnum})
				</p>
			),

			modalView: <AssignCrewDesktopModal dailyJobWithEmployee={dailyJobWithEmployee} closeModal={handleClose} />,
			variant: "medium",
		});
	};

	return (
		<div className="fixed right-2 top-36 z-[9999] flex w-[166px] flex-col overflow-hidden rounded-[10px] bg-white text-center shadow-[-4px_4px_12px_0px_#21212140]">
			<Modal />
			<JobPopoverItem
				label={dailyJobWithEmployee?.subcontractorCrew?.id ? tSub.editCrew : tSub.assignCrew}
				onClick={handleAssignCrew}
				className="text-brand-dark hover:bg-gray-100"
			/>
		</div>
	);
};

export default JobCardPopover;
