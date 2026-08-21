"use client";

import { Button } from "@/components/ui/button";
import { toFormattedDate } from "@/lib/utils/date";
import { DATE_FORMAT } from "@/types/date";
import { openErrorToast, openSuccessToast } from "@/components/toast";
import {
	ATTENDANCE_APPROVAL_STATUS,
	ATTENDANCE_REASON_LABEL,
	EMPLOYMENT_STATUS_LABEL,
	WORKSITE_TYPE_LABEL,
} from "../enums";
import { useAttendanceApproval } from "../hooks/useAttendanceApproval";
import { IAttendancePendingApproval } from "../types";

const DetailRow = ({ label, value }: { label: string; value: string }) => (
	<div className="flex items-center justify-between border-b border-brand-dark10 py-2 text-sm last:border-b-0">
		<span className="text-brand-grey">{label}</span>
		<span className="font-medium text-brand-dark">{value}</span>
	</div>
);

const AttendanceReviewModal = ({
	approval,
	onClose,
}: {
	approval: IAttendancePendingApproval;
	onClose: () => void;
}) => {
	const { mutateAsync, isPending } = useAttendanceApproval();

	const runAction = async (status: ATTENDANCE_APPROVAL_STATUS.APPROVED | ATTENDANCE_APPROVAL_STATUS.DECLINED) => {
		try {
			await mutateAsync({ id: approval.id, status });
			openSuccessToast(status === ATTENDANCE_APPROVAL_STATUS.APPROVED ? "Request approved" : "Request declined");
			onClose();
		} catch (error) {
			openErrorToast({ error: error as Error });
		}
	};

	return (
		<div className="space-y-1">
			<DetailRow label="Request ID" value={approval.requestId} />
			<DetailRow label="Employee" value={approval.user.name} />
			<DetailRow label="Status" value={EMPLOYMENT_STATUS_LABEL[approval.employmentStatus]} />
			<DetailRow label="Employee Type" value={WORKSITE_TYPE_LABEL[approval.worksiteType]} />
			<DetailRow label="Reason" value={ATTENDANCE_REASON_LABEL[approval.reason]} />
			<DetailRow label="Note" value={approval.note} />
			<DetailRow
				label="Scheduled Time"
				value={approval.scheduledTime ? toFormattedDate(approval.scheduledTime, DATE_FORMAT.HH_MM_AA_PM) : "--"}
			/>
			<DetailRow
				label="Actual Time"
				value={approval.actualTime ? toFormattedDate(approval.actualTime, DATE_FORMAT.HH_MM_AA_PM) : "--"}
			/>
			<DetailRow
				label="Submission Date"
				value={toFormattedDate(approval.submissionDate, DATE_FORMAT.MM_SLASH_DD_YYYY)}
			/>
			<DetailRow label="Requested Time Off" value={approval.requestedTimeOffRange} />

			{approval.ptoStatus === ATTENDANCE_APPROVAL_STATUS.PENDING ? (
				<div className="flex gap-2 pt-4">
					<Button
						type="button"
						variant="outline"
						className="flex-1"
						disabled={isPending}
						onClick={() => runAction(ATTENDANCE_APPROVAL_STATUS.DECLINED)}
					>
						Decline
					</Button>
					<Button
						type="button"
						variant="filled"
						className="flex-1"
						disabled={isPending}
						onClick={() => runAction(ATTENDANCE_APPROVAL_STATUS.APPROVED)}
					>
						Approve
					</Button>
				</div>
			) : (
				<p className="pt-4 text-sm text-brand-grey">
					This request was already{" "}
					{approval.ptoStatus === ATTENDANCE_APPROVAL_STATUS.APPROVED ? "approved" : "declined"}.
				</p>
			)}
		</div>
	);
};

export default AttendanceReviewModal;
