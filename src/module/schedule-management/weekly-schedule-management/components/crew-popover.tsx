import React from "react";
import { CrewPopoverProps } from "../types/schedule-interface";
import { useModal } from "@/hooks/useModal";
import EditStopModal from "../modals/edit-stop-modal";
import ChangeMemberModal from "../modals/change-member-modal";
import SwitchJobModal from "../modals/switch-job-modal";
import RemoveMemberModal from "../modals/remove-member-modal";
import JobPopoverItem from "./job-popover-item";
import { useTypedTranslations } from "@/i18n/useTypedTranslations";
import { NAMESPACE } from "@/i18n/type";

const CrewPopover: React.FC<CrewPopoverProps> = ({
	employee,
	dailyJob,
	bcewJob,
	dragSelectedWorkers,
	onClose,
	specialJob,
}) => {
	const { Modal, openModal, closeModal } = useModal(onClose);
	const tschedule = useTypedTranslations(NAMESPACE.SCHEDULE);
	const handleClose = () => {
		onClose();
		closeModal();
	};
	const openEditStop = () => {
		openModal({
			modalView: <EditStopModal employee={employee} dailyJob={dailyJob} onClose={handleClose} />,
			modalTitle: tschedule.editStop,
			subHeader: tschedule.editStopDescription,
			variant: "medium",
		});
	};

	const openChangeMember = () => {
		openModal({
			modalView: (
				<ChangeMemberModal employee={employee} dailyJob={dailyJob} onClose={handleClose} specialJob={specialJob} />
			),
			modalTitle: tschedule.changeMember,
			subHeader: tschedule.changeMemberDescription,
			variant: "medium",
		});
	};

	const openSwitchJob = () => {
		openModal({
			modalView: <SwitchJobModal onClose={handleClose} employee={employee} dailyJob={dailyJob} bcewJob={bcewJob} />,
			variant: "medium",
			modalTitle: tschedule.switchToAnotherJob,
			subHeader: tschedule.switchJobDescription,
		});
	};

	const openRemoveMember = () => {
		openModal({
			modalView: <RemoveMemberModal assignmentIds={[employee.id!]} dailyJob={dailyJob} onClose={handleClose} />,
			variant: "medium",
			modalTitle: tschedule.removeMember,
			subHeader: (
				<p>
					Do you really want to remove <span className="font-bold">{employee?.employee?.user?.name}</span> from{" "}
					<span className="font-bold">{`${bcewJob?.schlin?.actrec.jobnme || bcewJob?.srvinv?.actrec.jobnme} (${bcewJob?.schlin?.tsknum || bcewJob?.srvinv?.ordnum})`}</span>{" "}
					job?
				</p>
			),
		});
	};

	const openRemoveAll = () => {
		openModal({
			modalView: (
				<RemoveMemberModal
					assignmentIds={dragSelectedWorkers.workers.map((worker) => worker.id!)}
					dailyJob={dailyJob}
					onClose={handleClose}
				/>
			),
			variant: "medium",
			modalTitle: tschedule.removeAll,
			subHeader: (
				<p>
					Do you really want to remove{" "}
					<span className="font-bold">
						{dragSelectedWorkers.workers.map((worker) => worker.employee?.user?.name).join(", ")}
					</span>{" "}
					members from{" "}
					<span className="font-bold">{`${bcewJob?.schlin?.actrec.jobnme || bcewJob?.srvinv?.actrec.jobnme} (${bcewJob?.schlin?.tsknum || bcewJob?.srvinv?.ordnum})`}</span>{" "}
					job?
				</p>
			),
		});
	};

	return (
		<div className="absolute left-[-18px] top-20 flex w-[166px] flex-col overflow-hidden rounded-[10px] bg-white text-center shadow-[-4px_4px_12px_0px_#21212140]">
			<Modal />
			{dragSelectedWorkers.workers.length > 1 ? (
				<JobPopoverItem
					label={tschedule.removeMembers}
					onClick={openRemoveAll}
					className="text-red-500 hover:bg-red-100"
				/>
			) : (
				<>
					<JobPopoverItem
						label={tschedule.editStop}
						onClick={openEditStop}
						className="text-brand-dark hover:bg-gray-100"
					/>

					<JobPopoverItem
						label={tschedule.changeMember}
						className="text-brand-dark hover:bg-gray-100"
						onClick={openChangeMember}
					/>

					<JobPopoverItem
						label={tschedule.switchToAnotherJob}
						onClick={openSwitchJob}
						className="text-brand-dark hover:bg-gray-100"
					/>

					<JobPopoverItem
						label={tschedule.removeMember}
						onClick={openRemoveMember}
						className="text-red-500 hover:bg-red-100"
					/>
				</>
			)}
		</div>
	);
};

export default CrewPopover;
