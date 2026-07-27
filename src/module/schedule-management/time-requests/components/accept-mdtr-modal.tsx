import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { IMiddayStopRequest } from "../utils/types";
import { toFormattedDate } from "@/lib/utils/date";
import { requestTypeLabel } from "@/module/midday-stops/utils/constants";
import { QC_JOB_TYPE } from "../../weekly-schedule-management/types/schedule-interface";
import { openErrorToast, openSuccessToast } from "@/components/toast";
import { isBoolean } from "@/module/job/utils";
import { useQueryClient } from "@tanstack/react-query";
import { Textarea } from "@/components/ui/textarea";
import { useGetMDTRequestById, useMDTRAddNewStop, useMDTRequestDecline } from "../hooks/useTimeRequests";
import { getFormattedTimeRange } from "../../roster-time-configuration/utils";
import { FALLBACK_TIME_RANGE_STRINGS } from "@/utils/enums";
import { calculateHoursFromDateRange } from "@/module/employee-dashboard/utils";
import { useTypedTranslations } from "@/i18n/useTypedTranslations";
import { NAMESPACE } from "@/i18n/type";
import { MIDDAY_STOP_REQUEST_TYPE } from "@/module/midday-stops/utils/enums";
import { defaultRosterTime } from "@/module/job/utils/constants";
import { Spinner } from "@/components/ui/spinner";
import { FaCheck } from "react-icons/fa6";
import { RxCross2 } from "react-icons/rx";
import { TimeSource } from "../../roster-time-configuration/enums";

const AcceptMDTRModal = ({ onClose, middayStopId }: { onClose: () => void; middayStopId: string }) => {
	const { data: middayStopRequest, isLoading } = useGetMDTRequestById(middayStopId);
	const { mutate: createAddNewJobMutation, isPending } = useMDTRAddNewStop();
	const { mutate: declineMDTRequest } = useMDTRequestDecline();
	const queryClient = useQueryClient();
	const [adminNote, setAdminNote] = useState<string>(middayStopRequest?.adminNote || "");
	const { isApproved, project, actrec, note, employee, requestType, startTime, endTime, specialJobId, rosterTime } =
		middayStopRequest || {};
	const { dayStartTime, dayEndTime, extendedApprovedStartTime, extendedApprovedEndTime, date, timeSource } =
		rosterTime || defaultRosterTime;
	const tTimeLogs = useTypedTranslations(NAMESPACE.TIME_LOGS);
	const tCommon = useTypedTranslations(NAMESPACE.COMMON);

	const showProject = project && requestType === MIDDAY_STOP_REQUEST_TYPE.ADD_NEW_STOP;

	const isSpecialJob = showProject && specialJobId;

	const onApprove = () => {
		if (timeSource === TimeSource.NOT_WORKING) {
			return openErrorToast({ message: "Cannot approve request when employee is marked as not working on the roster" });
		}
		if (!middayStopRequest) return;
		onSubmit(middayStopRequest, middayStopRequest?.employee?.id, middayStopRequest?.requestType, middayStopRequest?.id);
	};

	const onReject = () => {
		declineMDTRequest(
			{ id: middayStopId, adminNote },
			{
				onSuccess: () => {
					openSuccessToast(tTimeLogs.newJobRequestDeclinedSuccessfully);
					void queryClient.invalidateQueries({ queryKey: ["midday-stop-requests"] });
					void queryClient.invalidateQueries({ queryKey: ["timelogs"] });
					onClose();
				},
				onError: (error) => {
					openErrorToast({ error });
				},
			}
		);
	};

	if (isLoading) return <Spinner />;
	if (!middayStopRequest?.id) {
		return <div>{tTimeLogs.requestDeleted}</div>;
	}

	const onSubmit = (
		data: IMiddayStopRequest,
		employeeId: string | undefined,
		requestType: string | undefined,
		requestId: string
	) => {
		createAddNewJobMutation(
			{
				stopNumber: data.stopNumber || undefined,
				date: data.date,
				bcewSchlinExtendedId: data.bcewSchlinExtendedId || undefined,
				bcewSchlinIdnum: data.bcewSchlinIdnum || undefined,
				bcewSrvinvIdnum: data.bcewSrvinvIdnum || undefined,
				specialJobId: data.specialJobId || undefined,
				qcType: data.qcType as QC_JOB_TYPE | undefined,
				employeeId,
				requestType,
				startTime: data.startTime,
				endTime: data.endTime,
				requestId,
				adminNote,
			},
			{
				onSuccess: () => {
					openSuccessToast(tTimeLogs.newJobRequestApprovedSuccessfully);
					void queryClient.invalidateQueries({ queryKey: ["midday-stop-requests"] });
					void queryClient.invalidateQueries({ queryKey: ["timelogs"] });
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
			<div className="grid grid-cols-1 gap-y-4 font-inter sm:grid-cols-2">
				<div className="space-y-0.5">
					<p className="text-sm font-normal text-brand-grey">{tTimeLogs.employeeName}</p>
					<p className="text-base font-medium text-brand-dark">{employee?.user?.name || "--"}</p>
				</div>

				<div className="space-y-0.5">
					<p className="text-sm font-normal text-brand-grey">{tTimeLogs.rosterTime}</p>
					{dayStartTime && dayEndTime && (
						<p className="text-base font-medium text-brand-dark">
							{timeSource === TimeSource.NOT_WORKING
								? "Not working"
								: getFormattedTimeRange(dayStartTime, dayEndTime, FALLBACK_TIME_RANGE_STRINGS.DEFAULT_TIME_RANGE)}
						</p>
					)}
				</div>

				<div className="space-y-0.5">
					<p className="text-sm font-normal text-brand-grey">{tTimeLogs.requestType}</p>
					<p className="text-base font-medium capitalize text-brand-dark">
						{requestType ? requestTypeLabel?.[requestType] : "--"}
					</p>
				</div>

				{timeSource !== TimeSource.NOT_WORKING && extendedApprovedStartTime && extendedApprovedEndTime && (
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
					<p className="text-sm font-normal text-brand-grey">{tTimeLogs.timeTaken}</p>
					<p className="text-base font-medium text-brand-dark">
						{getFormattedTimeRange(startTime, endTime, FALLBACK_TIME_RANGE_STRINGS.DEFAULT_TIME_RANGE)}
					</p>
				</div>
			</div>

			<div className="space-y-0.5">
				<p className="text-sm font-normal text-brand-grey">{tTimeLogs.hours}</p>
				<p className="text-base font-medium text-brand-dark">{calculateHoursFromDateRange(startTime, endTime)}</p>
			</div>

			{showProject && (
				<div className="grid grid-cols-1 gap-y-4 font-inter sm:grid-cols-2">
					<div className="space-y-0.5">
						<p className="text-sm font-normal text-brand-grey">
							{isSpecialJob ? tTimeLogs.specialJobName : tTimeLogs.projectName}
						</p>
						<p className="text-base font-medium text-brand-dark">
							{requestType ? requestTypeLabel[requestType] : project}
						</p>
					</div>
					<div className="space-y-0.5">
						<p className="text-sm font-normal text-brand-grey">{tTimeLogs.jobName}</p>
						<p className="text-base font-medium text-brand-dark">
							{requestType === MIDDAY_STOP_REQUEST_TYPE.ADD_NEW_STOP ? project : requestTypeLabel[requestType]}
						</p>
						{actrec && <p className="text-muted-foreground">Job #{actrec}</p>}
					</div>
				</div>
			)}

			<div className="max-w-full space-y-0.5">
				<p className="text-sm font-normal text-brand-grey">{tTimeLogs.noteFromEmployee}</p>
				<p className="whitespace-pre-wrap break-all text-base font-medium text-brand-dark">{note || "--"}</p>
			</div>

			{isBoolean(isApproved) ? (
				<div className="max-w-full space-y-0.5">
					<p className="text-sm font-normal text-brand-grey">{tTimeLogs.noteForEmployee}</p>
					<p className="whitespace-pre-wrap break-all text-base font-medium text-brand-dark">{adminNote || "--"}</p>
				</div>
			) : (
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
			)}

			<div className="flex items-center justify-between gap-2 border-t pt-4">
				{isApproved != false && (
					<Button variant="outline" className="h-10 w-full" onClick={() => onReject()}>
						{tTimeLogs.decline}
					</Button>
				)}

				{isApproved != true && (
					<Button loading={isPending} variant={"filled"} className="h-10 w-full" onClick={() => onApprove()}>
						{tTimeLogs.accept}
					</Button>
				)}
			</div>
		</div>
	);
};

export default AcceptMDTRModal;
