import { Button } from "@/components/ui/button";
import { openErrorToast, openSuccessToast } from "@/components/toast";
import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { toFormattedDate } from "@/lib/utils/date";
import { getFormattedTimeRange } from "@/module/schedule-management/roster-time-configuration/utils";
import { useQueryClient } from "@tanstack/react-query";
import { extendedTimeType } from "@/module/job/utils/enums";
import { calculateExtendedHours } from "@/module/job/utils";
import { extendedTimeTypeMap } from "../utils/constants";
import { FaCheck } from "react-icons/fa6";
import { FALLBACK_TIME_RANGE_STRINGS } from "@/utils/enums";
import { IExtendedTime } from "@/module/job/types";
import { defaultRosterTime, extendedReasonMap } from "@/module/job/utils/constants";
import { Textarea } from "@/components/ui/textarea";
import {
	useAcceptTimeLogsExtendedTime,
	useDeclineTimeLogsExtendedTime,
} from "../../time-requests/hooks/useTimeRequests";
import { useTypedTranslations } from "@/i18n/useTypedTranslations";
import { NAMESPACE } from "@/i18n/type";
import { useGetExtendedTimeById } from "@/module/job/hooks/useEmployeeExtendedTime";
import { DATE_FORMAT } from "@/types/date";
import { Spinner } from "@/components/ui/spinner";
import { RxCross2 } from "react-icons/rx";

const AcceptETRModal = ({ onClose, extendedTimeId }: { extendedTimeId: string; onClose: () => void }) => {
	const { mutate: acceptExtendedTime } = useAcceptTimeLogsExtendedTime();
	const { mutate: declineExtendedTime } = useDeclineTimeLogsExtendedTime();
	const queryClient = useQueryClient();
	const tTimeLogs = useTypedTranslations(NAMESPACE.TIME_LOGS);
	const { data, isLoading } = useGetExtendedTimeById(extendedTimeId);
	const [adminNote, setAdminNote] = useState<string>(data?.adminNote || "");
	const tCommon = useTypedTranslations(NAMESPACE.COMMON);

	const {
		rosterTime,
		request: extendedRequest,
		startTime,
		endTime,
		extendedReason,
		extendedType,
		note,
		stopName,
		isApproved,
		jobStartTime,
		jobEndTime,
	} = data || {};
	const { employee } = extendedRequest || {};
	const { dayStartTime, dayEndTime, extendedApprovedStartTime, extendedApprovedEndTime, date } =
		rosterTime || defaultRosterTime;

	const { handleSubmit } = useForm<IExtendedTime>({
		defaultValues: {
			startTime,
			endTime,
			extendedReason,
			extendedType,
			note: note || "",
			stopName,
		},
	});

	const onFormSubmit = () => {
		acceptExtendedTime(
			{ extendedTimeId, adminNote },
			{
				onSuccess: () => {
					openSuccessToast(tTimeLogs.extendedTimeApprovedSuccessfully);
					queryClient.invalidateQueries({ queryKey: ["timelogs"] });
					queryClient.invalidateQueries({ queryKey: ["extended-time"] });
					onClose();
				},
				onError: (error) => {
					openErrorToast({ error });
				},
			}
		);
	};

	const onFormDecline = () => {
		declineExtendedTime(
			{ extendedTimeId, adminNote },
			{
				onSuccess: () => {
					openSuccessToast(tTimeLogs.extendedTimeDeclinedSuccessfully);
					queryClient.invalidateQueries({ queryKey: ["timelogs"] });
					queryClient.invalidateQueries({ queryKey: ["extended-time"] });
					onClose();
				},
				onError: (error) => {
					openErrorToast({ error });
				},
			}
		);
	};

	if (isLoading) return <Spinner />;
	if (!data?.id) {
		return <div>{tTimeLogs.requestDeleted}</div>;
	}

	return (
		<div className="max-h-[60vh] w-full space-y-4 overflow-auto border-t bg-white font-inter">
			{isApproved === true && (
				<div className="my-4 flex items-center gap-2 rounded-[8px] border border-brand-greenLight bg-brand-bgLightgreen px-4 py-2 text-brand-green10">
					<FaCheck />
					<span className="text-sm font-medium">Request has already been approved</span>
				</div>
			)}

			{isApproved === false && (
				<div className="my-4 flex items-center gap-2 rounded-[8px] border border-red-200 bg-red-50 px-4 py-2 text-red-600">
					<RxCross2 />
					<span className="text-sm font-medium">Request has already been declined</span>
				</div>
			)}
			<h2 className="mt-2 border-brand-lightgrey font-inter text-sm font-normal text-brand-grey">
				{tTimeLogs.date}{" "}
				<p className="mt-1 text-sm font-medium text-brand-dark">{date ? toFormattedDate(date) : "--"}</p>
			</h2>
			<div className="grid grid-cols-1 gap-y-4 text-sm sm:grid-cols-2">
				<div className="space-y-0.5">
					<p className="text-sm font-normal text-brand-grey">{tTimeLogs.employeeName}</p>
					<p className="text-base font-medium text-brand-dark">{employee?.user.name || "--"}</p>
				</div>

				<div className="space-y-0.5">
					<p className="text-sm font-normal text-brand-grey">{tTimeLogs.rosterTime}</p>
					<p className="text-base font-medium text-brand-dark">
						{getFormattedTimeRange(dayStartTime, dayEndTime, FALLBACK_TIME_RANGE_STRINGS.DEFAULT_TIME_RANGE)}
					</p>
				</div>

				<div className="space-y-0.5">
					<p className="text-sm font-normal text-brand-grey">{tTimeLogs.requestType}</p>
					<p className="text-base font-medium text-brand-dark">
						{extendedType ? extendedTimeTypeMap[extendedType] : "--"}
					</p>
				</div>

				{extendedApprovedStartTime && extendedApprovedEndTime && (
					<div className="space-y-0.5">
						<p className="text-sm font-normal text-brand-grey">{tTimeLogs.extendedRosterTime}</p>
						<p className="text-base font-medium text-brand-dark">
							{getFormattedTimeRange(
								extendedApprovedStartTime,
								extendedApprovedEndTime,
								FALLBACK_TIME_RANGE_STRINGS.DEFAULT_TIME_RANGE
							)}
						</p>
					</div>
				)}

				<div className="space-y-0.5">
					<p className="text-sm font-normal text-brand-grey">{tTimeLogs.jobName}</p>
					<p className="text-base font-medium text-brand-dark">{stopName || "--"}</p>
				</div>

				{extendedType === extendedTimeType.EARLY_START && (
					<div className="space-y-0.5">
						<p className="text-sm font-normal text-brand-grey">{tTimeLogs.earlyStartTime}</p>
						<p className="text-base font-medium text-brand-dark">
							{startTime ? toFormattedDate(startTime, DATE_FORMAT.HH_MM_AA_PM) : "--"}
						</p>
					</div>
				)}

				{extendedType === extendedTimeType.LATE_RELEASE && (
					<div className="space-y-0.5">
						<p className="text-sm font-normal text-brand-grey">{tTimeLogs.lateReleaseTime}</p>
						<p className="text-base font-medium text-brand-dark">
							{endTime ? toFormattedDate(endTime, DATE_FORMAT.HH_MM_AA_PM) : ""}
						</p>
					</div>
				)}

				<div className="space-y-0.5">
					<p className="text-sm font-normal text-brand-grey">{tTimeLogs.extendedTime}</p>
					<p className="text-base font-medium text-brand-dark">
						{getFormattedTimeRange(jobStartTime, jobEndTime, FALLBACK_TIME_RANGE_STRINGS.DEFAULT_TIME_RANGE)}
					</p>
				</div>

				<div className="space-y-0.5">
					<p className="text-sm font-normal text-brand-grey">{tTimeLogs.extendedHours}</p>
					<p className="text-base font-medium text-brand-dark">
						{extendedType === extendedTimeType.EARLY_START
							? calculateExtendedHours(startTime, dayStartTime, extendedTimeType.EARLY_START)
							: calculateExtendedHours(endTime, dayEndTime, extendedTimeType.LATE_RELEASE)}
					</p>
				</div>

				<div className="space-y-0.5">
					<p className="text-sm font-normal text-brand-grey">{tTimeLogs.reason}</p>
					<p className="whitespace-pre-wrap break-all text-base font-medium text-brand-dark">
						{extendedReason ? extendedReasonMap[extendedReason] : "--"}
					</p>
				</div>
			</div>

			<div className="max-w-full space-y-0.5">
				<p className="text-sm font-normal text-brand-grey">{tTimeLogs.noteFromEmployee}</p>
				<p className="whitespace-pre-wrap break-all text-base font-medium text-brand-dark">{note || "--"}</p>
			</div>

			<div className="space-y-1">
				<p className="text-sm font-normal text-brand-grey">{tTimeLogs.addNote}</p>
				<div className="px-0.5">
					<Textarea
						placeholder={tCommon.typeHere}
						className="h-20 whitespace-pre-wrap break-all rounded-[10px] border-none bg-muted py-2 text-sm text-muted-foreground"
						value={adminNote}
						onChange={(e) => setAdminNote(e.target.value)}
					/>
				</div>
			</div>

			{
				<div className="flex items-center justify-between gap-2 border-t pt-4">
					{isApproved != false && (
						<Button
							// disabled={isApproved === false}
							variant="outline"
							className="w-full"
							onClick={handleSubmit(onFormDecline)}
						>
							{tTimeLogs.decline}
						</Button>
					)}

					{isApproved != true && (
						<Button
							// disabled={isApproved === true}
							variant={"filled"}
							className="w-full"
							onClick={handleSubmit(onFormSubmit)}
						>
							{tTimeLogs.accept}
						</Button>
					)}
				</div>
			}
		</div>
	);
};

export default AcceptETRModal;
