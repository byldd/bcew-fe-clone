"use client";
import React from "react";
import { Button } from "@/components/ui/button";
import OverrideSuccessModal from "@/module/schedule-management/time-logs-management/components/success-modal";
import { useModal } from "@/hooks/useModal";
import {
	extractTimeForInput,
	extractUTCDayAndTime,
	getDatePart,
} from "@/module/schedule-management/time-logs-management/utils";
import { useQueryClient } from "@tanstack/react-query";
import { useUpdateJobAssignmentTimeEmployee } from "@/module/employee/hooks/useEmployee";
import { toFormattedDate } from "@/lib/utils/date";
import { DATE_FORMAT } from "@/types/date";
import { openErrorToast } from "@/components/toast";
import { useTypedTranslations } from "@/i18n/useTypedTranslations";
import { NAMESPACE } from "@/i18n/type";

export interface IEditLogTimeProps {
	onClose: () => void;
	employeeId: string;
	stop: {
		dailyJobId: string;
		shtnme: string;
		gpsStart?: string;
		gpsEnd?: string;
		startTime?: string;
		endTime?: string;
		isOverTimeApproved?: boolean | null;
		date: string;
	};
}

const EditEmployeeLoggedTimeModal = ({ onClose, employeeId, stop }: IEditLogTimeProps) => {
	const tEmployee = useTypedTranslations(NAMESPACE.EMPLOYEE);
	const tTimelogs = useTypedTranslations(NAMESPACE.TIME_LOGS);
	const tCommon = useTypedTranslations(NAMESPACE.COMMON);

	const [overrideStartTime, setOverrideStartTime] = React.useState(extractTimeForInput(stop?.startTime));
	const [overrideEndTime, setOverrideEndTime] = React.useState(extractTimeForInput(stop?.endTime));
	const { Modal, openModal } = useModal();
	const queryClient = useQueryClient();

	const {
		shtnme: siteName,
		gpsStart: gpsStartTime,
		gpsEnd: gpsEndTime,
		startTime: loggedStartTime,
		endTime: loggedEndTime,
		isOverTimeApproved,
		dailyJobId,
		date,
	} = stop;

	const { mutate: updateTime, isPending } = useUpdateJobAssignmentTimeEmployee(dailyJobId);

	const handleSave = () => {
		if (!overrideStartTime || !overrideEndTime || !dailyJobId || !employeeId) return;

		const startDate = getDatePart(loggedStartTime ?? date);
		const endDate = getDatePart(loggedEndTime ?? date);

		const startTime = new Date(`${startDate}T${overrideStartTime}:00Z`).toISOString();
		const endTime = new Date(`${endDate}T${overrideEndTime}:00Z`).toISOString();

		updateTime(
			{
				employeeId,
				startTime,
				endTime,
			},
			{
				onSuccess: () => {
					openModal({
						modalView: (
							<OverrideSuccessModal
								name={siteName}
								timeRange={`${toFormattedDate(overrideStartTime, DATE_FORMAT.HH_MM_AA_PM)} to ${toFormattedDate(overrideEndTime, DATE_FORMAT.HH_MM_AA_PM)}`}
								onClose={() => {
									onClose();
									queryClient.invalidateQueries({ queryKey: ["userActivity"] });
								}}
							/>
						),
					});
				},
				onError: (error) => {
					openErrorToast({ error });
				},
			}
		);
	};

	return (
		<div>
			<h2 className="mb-6 text-lg font-semibold">{tTimelogs.editLoggedTime}</h2>

			<div className="mb-4">
				<p className="mb-1 text-sm text-gray-500">{tTimelogs.gpsTrackedTime}</p>
				<div className="flex justify-between text-sm font-medium">
					<span>
						{tEmployee.startTime}
						<br />
						{gpsStartTime ? toFormattedDate(gpsStartTime, DATE_FORMAT.HH_MM_AA_PM) : "--"}
					</span>
					<span>
						{tEmployee.endTime}
						<br />
						{gpsEndTime ? toFormattedDate(gpsEndTime, DATE_FORMAT.HH_MM_AA_PM) : "--"}
					</span>
				</div>
			</div>

			<div className="mb-4">
				<p className="mb-1 text-sm text-gray-500">{tTimelogs.membersLoggedTime}</p>
				<div className="flex justify-between text-sm font-medium">
					<span>
						{tEmployee.startTime}
						<br />
						{extractUTCDayAndTime(loggedStartTime)}
					</span>
					<span>
						{tEmployee.endTime}
						<br />
						{extractUTCDayAndTime(loggedEndTime)}
					</span>
				</div>
			</div>

			<div className="mb-4">
				<p className="mb-1 text-sm text-gray-500">{tTimelogs.overtimeRequest}</p>
				<span>{isOverTimeApproved ? "Approved" : "Not Approved"}</span>
				<p className="mb-1 mt-4 text-sm text-gray-500">{tTimelogs.overrideLoggedTime}</p>
				<div className="flex gap-3 px-1">
					<input
						type="time"
						value={overrideStartTime}
						onChange={(e) => setOverrideStartTime(e.target.value)}
						className="w-1/2 rounded border p-2 text-sm"
					/>
					<input
						type="time"
						value={overrideEndTime}
						onChange={(e) => setOverrideEndTime(e.target.value)}
						className="w-1/2 rounded border p-2 text-sm"
					/>
				</div>
			</div>

			<div className="flex justify-between gap-6 border-t">
				<Button disabled={isPending} onClick={onClose} variant={"outline"} className="min-w-[190px]">
					{tCommon.cancel}
				</Button>

				<Button variant="filled" onClick={handleSave} loading={isPending} className="min-w-[190px]">
					{tCommon.save}
				</Button>
			</div>
			<Modal />
		</div>
	);
};

export default EditEmployeeLoggedTimeModal;
