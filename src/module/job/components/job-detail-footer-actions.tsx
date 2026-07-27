import { Button } from "@/components/ui/button";
import { IJobDetailFooterActionsProps } from "../types";
import { usePendingLatenessGuard } from "../hooks/usePendingLatenessGuard";

export function JobDetailFooterActions({
	isTaskLeader,
	isJobFinishToday,
	isSpecialJob,
	isLoading,
	isRefetching,
	hasJobId,
	hasEmployeeStartTime,
	showRescheduleAction,
	isFingerprintEnabled,
	onJobUpdateClick,
	onTimeLogClick,
	onRescheduleClick,
	labels,
}: IJobDetailFooterActionsProps) {
	const { PendingLatenessModal, guardPendingLateness } = usePendingLatenessGuard();

	return (
		<div className="fixed bottom-0 left-0 right-0 z-50 flex space-x-3 bg-white px-4 py-4">
			<PendingLatenessModal />
			<Button
				disabled={!isTaskLeader || isJobFinishToday || isLoading || isRefetching}
				variant="filled"
				onClick={onJobUpdateClick}
				className="w-full"
			>
				{isJobFinishToday
					? labels.completed
					: isTaskLeader && !isSpecialJob
						? labels.jobUpdatesTitle
						: labels.notCompleted}
			</Button>
			<Button
				disabled={!hasJobId || isLoading || isRefetching || isFingerprintEnabled}
				onClick={() => guardPendingLateness(onTimeLogClick)}
				variant="filled"
				className="w-full"
			>
				{hasEmployeeStartTime ? labels.updateLogTime : labels.logTime}
			</Button>
			{showRescheduleAction && (
				<Button disabled={!hasJobId} onClick={onRescheduleClick} variant="filled" className="w-full">
					{labels.reschedule}
				</Button>
			)}
		</div>
	);
}
