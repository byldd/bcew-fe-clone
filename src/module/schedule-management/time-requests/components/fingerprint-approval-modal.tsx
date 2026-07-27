import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import TimeInput from "@/components/ui/time-input";
import { FormLabelRequired } from "@/components/ui/formLabelrequired";
import { openErrorToast, openSuccessToast } from "@/components/toast";
import { useQueryClient } from "@tanstack/react-query";
import { toFormattedDate } from "@/lib/utils/date";
import { DATE_FORMAT } from "@/types/date";
import { useUpdateFingerprintStatus } from "../hooks/useTimeRequests";
import { IFingerprintApproval } from "../utils/types";
import { fingerprintApprovalStatus } from "../utils/enums";
import { FaCheck } from "react-icons/fa6";
import { RxCross2 } from "react-icons/rx";
import { useEmployeeTodayRoster } from "@/module/job/hooks/useEmployeeSchedule";

interface FingerprintApprovalModalProps {
	row: IFingerprintApproval;
	onClose: () => void;
}

const FingerprintApprovalModal = ({ row, onClose }: FingerprintApprovalModalProps) => {
	const [startTime, setStartTime] = useState(row.startTime ?? "");
	const [endTime, setEndTime] = useState(row.endTime ?? "");
	const { mutate: updateStatus, isPending } = useUpdateFingerprintStatus();
	const queryClient = useQueryClient();
	const { data: rosterTime } = useEmployeeTodayRoster({ date: row.date });
	const isAccepted = row.status === fingerprintApprovalStatus.ACCEPTED;
	const isDeclined = row.status === fingerprintApprovalStatus.DECLINED;
	const isActionable = !isAccepted && !isDeclined;

	const invalidate = () => {
		void queryClient.invalidateQueries({ queryKey: ["fingerprint-approval-requests"] });
	};

	const onApprove = () => {
		if (!startTime) return openErrorToast({ message: "Start time is required." });
		if (!endTime) return openErrorToast({ message: "End time is required." });

		updateStatus(
			{ id: row.id, status: fingerprintApprovalStatus.ACCEPTED, startTime, endTime },
			{
				onSuccess: () => {
					openSuccessToast("Fingerprint approval request approved successfully");
					invalidate();
					onClose();
				},
				onError: (error) => {
					openErrorToast({ error });
				},
			}
		);
	};

	const onDecline = () => {
		updateStatus(
			{ id: row.id, status: fingerprintApprovalStatus.DECLINED },
			{
				onSuccess: () => {
					openSuccessToast("Fingerprint approval request declined successfully");
					invalidate();
					onClose();
				},
				onError: (error) => {
					openErrorToast({ error });
				},
			}
		);
	};

	return (
		<div className="max-h-[60vh] w-full space-y-4 overflow-auto rounded-lg border-t bg-white font-inter">
			{isAccepted && (
				<div className="my-4 flex items-center gap-2 rounded-[8px] border border-brand-greenLight bg-brand-bgLightgreen px-4 py-2 text-brand-green10">
					<FaCheck />
					<span className="text-sm font-medium">Request has already been approved</span>
				</div>
			)}

			{isDeclined && (
				<div className="my-4 flex items-center gap-2 rounded-[8px] border border-red-200 bg-red-50 px-4 py-2 text-red-600">
					<RxCross2 />
					<span className="text-sm font-medium">Request has already been declined</span>
				</div>
			)}

			<h2 className="mt-2 font-inter text-sm font-normal text-brand-grey">
				Date
				<p className="mt-1 text-sm font-medium text-brand-dark">{row.date ? toFormattedDate(row.date) : "--"}</p>
			</h2>

			<div className="grid grid-cols-1 gap-y-4 font-inter sm:grid-cols-2">
				<div className="space-y-0.5">
					<p className="text-sm font-normal text-brand-grey">Employee Name</p>
					<p className="text-base font-medium text-brand-dark">{row.employee?.user?.name ?? "--"}</p>
				</div>

				{isActionable ? (
					<div className="col-span-2 flex flex-col gap-4">
						<div className="space-y-0.5">
							<p className="text-sm font-normal text-brand-grey">Roster Time</p>
							<p className="text-base font-medium text-brand-dark">
								{rosterTime
									? `${toFormattedDate(rosterTime.dayStartTime, DATE_FORMAT.HH_MM_AA_PM)} - ${toFormattedDate(rosterTime.dayEndTime, DATE_FORMAT.HH_MM_AA_PM)}`
									: "--"}
							</p>
						</div>

						<div className="flex gap-2">
							<div className="w-full flex-1">
								<FormLabelRequired label="Start Time" required />
								<TimeInput date={startTime} value={startTime} onChange={(val) => setStartTime(val)} />
							</div>
							<div className="w-full flex-1">
								<FormLabelRequired label="End Time" required />
								<TimeInput date={endTime} value={endTime} onChange={(val) => setEndTime(val)} />
							</div>
						</div>
					</div>
				) : (
					<>
						<div className="space-y-0.5">
							<p className="text-sm font-normal text-brand-grey">Start Time</p>
							<p className="text-base font-medium text-brand-dark">
								{row.startTime ? toFormattedDate(row.startTime, DATE_FORMAT.HH_MM_AA_PM) : "--"}
							</p>
						</div>

						<div className="space-y-0.5">
							<p className="text-sm font-normal text-brand-grey">End Time</p>
							<p className="text-base font-medium text-brand-dark">
								{row.endTime ? toFormattedDate(row.endTime, DATE_FORMAT.HH_MM_AA_PM) : "--"}
							</p>
						</div>
					</>
				)}
			</div>

			{isActionable && (
				<div className="flex items-center justify-between gap-2 border-t pt-4">
					<Button variant="outline" className="h-10 w-full" onClick={onDecline} disabled={isPending}>
						Mark full day off
					</Button>
					<Button loading={isPending} variant="filled" className="h-10 w-full" onClick={onApprove}>
						Accept
					</Button>
				</div>
			)}
		</div>
	);
};

export default FingerprintApprovalModal;
