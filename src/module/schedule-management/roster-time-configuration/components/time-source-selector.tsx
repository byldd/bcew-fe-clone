"use client";

import { useState } from "react";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { TimeSource } from "@/module/schedule-management/roster-time-configuration/enums";
import { useUpdateRosterTime } from "@/module/schedule-management/roster-time-configuration/hooks/useRoster";
import { useModal } from "@/hooks/useModal";
import RosterCustomTimeUpdateModal from "@/module/schedule-management/roster-time-configuration/modals/roster-custom-time-update-modal";
import {
	getTimeSourceLabel,
	isDayTimeDifferent,
	isDayTimeSame,
} from "@/module/schedule-management/roster-time-configuration/utils";
import {
	ITimeSourceSelectorProps,
	IUpdateRosterTimePayload,
} from "@/module/schedule-management/roster-time-configuration/types";
import { useQueryClient } from "@tanstack/react-query";
import { ChevronDown } from "lucide-react";
import { handlePastDateOperations } from "@/utils";

import { Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";
import { getTodayDate, toFormattedDate } from "@/lib/utils/date";
import { useTypedTranslations } from "@/i18n/useTypedTranslations";
import { NAMESPACE } from "@/i18n/type";
import { DATE_FORMAT } from "@/types/date";
import ActiveScheduleConflictModal from "./active-schedule-conflict-modal";
import { AxiosError } from "axios";
import { useAdminPageAccessContext } from "@/module/admin/context/page-access";
import { ACCESS_LEVEL } from "@/module/employee/enums";

interface RosterTimeTooltipProps {
	timeRange: string;
	loggedTimeRange?: string;
	overrideTimeRange?: string;
	approvedExtendedTimeRange?: string;
	isTimeExtended: boolean;
	colorClass: string;
	onClick?: (e: React.MouseEvent) => void;
}

const RosterTimeTooltip = ({
	timeRange,
	loggedTimeRange,
	overrideTimeRange,
	approvedExtendedTimeRange,
	isTimeExtended,
	colorClass,
	onClick,
}: RosterTimeTooltipProps) => {
	const tEmployee = useTypedTranslations(NAMESPACE.EMPLOYEE_ROSTER);
	return (
		<Tooltip>
			<TooltipTrigger asChild>
				<p className={`text-xs ${colorClass}`} onClick={onClick}>
					{isTimeExtended ? approvedExtendedTimeRange : timeRange}
				</p>
			</TooltipTrigger>
			<TooltipContent
				side="top"
				sideOffset={8}
				className="rounded-[10px] border border-gray-200 bg-white px-3 py-2 text-gray-800 shadow-md"
			>
				<div className="grid grid-cols-[110px_1fr] gap-y-2 text-sm">
					<span className="font-normal text-brand-grey">{tEmployee.rosterTime}:</span>
					<span className="font-semibold text-brand-dark">{timeRange}</span>

					{approvedExtendedTimeRange && (
						<>
							<span className="font-normal text-brand-grey">{tEmployee.extendedTime}:</span>
							<span className="font-semibold text-brand-dark">{approvedExtendedTimeRange}</span>
						</>
					)}
					{loggedTimeRange && (
						<>
							<span className="font-normal text-brand-grey">{tEmployee.loggedTime}:</span>
							<span className="font-semibold text-brand-dark">{loggedTimeRange}</span>
						</>
					)}
					{overrideTimeRange && (
						<>
							<span className="font-normal text-brand-grey">{tEmployee.overrideTime}:</span>
							<span className="font-semibold text-brand-dark">{overrideTimeRange}</span>
						</>
					)}
				</div>
			</TooltipContent>
		</Tooltip>
	);
};

const TimeSourceSelector = ({
	roster,
	timeRange,
	employeeName,
	employeeDayTime,
	rosterDayTime,
	loggedTimeRange,
	overrideTimeRange,
	approvedExtendedTimeRange,
}: ITimeSourceSelectorProps) => {
	const [open, setOpen] = useState(false);
	const updateRosterTimeMutation = useUpdateRosterTime(roster?.id);
	const { openModal, closeModal, Modal } = useModal();
	const queryClient = useQueryClient();
	const { pageAccess } = useAdminPageAccessContext();
	const isPastDate = handlePastDateOperations(roster?.date, getTodayDate());
	const isTimeExtended =
		roster?.isTimeOverridden && roster?.extendedApprovedStartTime && roster?.extendedApprovedEndTime ? true : false;
	const isDisabled = isTimeExtended;

	const handleSelect = (payload: IUpdateRosterTimePayload) => {
		if (isDisabled) return;
		updateRosterTimeMutation.mutate(payload, {
			onSuccess: () => {
				queryClient.invalidateQueries({ queryKey: ["userRosterForWeek"] });
			},
			onError: (error: unknown) => {
				let errorMessage = "Something went wrong";

				if (error instanceof AxiosError) {
					errorMessage = error.response?.data?.message || error.message;
				} else if (error instanceof Error) {
					errorMessage = error.message;
				}

				openModal({
					modalTitle: "Active Schedule Conflict",
					modalView: (
						<ActiveScheduleConflictModal
							message={errorMessage}
							date={roster?.date}
							onClose={closeModal}
							employeeName={employeeName}
						/>
					),
				});
			},
		});

		setOpen(false);
	};

	const handleCustomizeTime = () => {
		if (isDisabled) return;
		openModal({
			modalTitle: (
				<span className="font-semibold">
					{`${toFormattedDate(roster.date, DATE_FORMAT.FULL_WEEK_DAY)}'s`} Working Hours
				</span>
			),
			modalView: (
				<RosterCustomTimeUpdateModal
					onClose={closeModal}
					employeeName={employeeName}
					roster={roster}
					onSave={handleSelect}
					isPastDate={isPastDate}
				/>
			),
		});
	};

	return (
		<div>
			<Modal />
			<Popover open={open} onOpenChange={setOpen}>
				<PopoverTrigger asChild>
					<Button
						variant="ghost"
						className="flex h-auto w-full flex-col items-center px-2 py-1 text-center"
						disabled={updateRosterTimeMutation?.isPending || pageAccess?.accessLevel !== ACCESS_LEVEL.WRITE}
					>
						<p
							className="flex items-center text-sm font-medium"
							onClick={(e) => {
								e.stopPropagation();
								if (!isDisabled) {
									// open dropdown
									setOpen((prev) => (prev === false ? true : false));
								}
							}}
						>
							{getTimeSourceLabel(roster.timeSource)}
							<ChevronDown size={14} className="ml-1 text-gray-500" />
						</p>

						{timeRange && roster.timeSource !== TimeSource.NOT_WORKING && (
							<RosterTimeTooltip
								timeRange={timeRange}
								loggedTimeRange={loggedTimeRange}
								overrideTimeRange={overrideTimeRange}
								approvedExtendedTimeRange={approvedExtendedTimeRange}
								isTimeExtended={isTimeExtended}
								colorClass={
									isPastDate && !employeeDayTime
										? "text-red-500"
										: isDayTimeDifferent(rosterDayTime, employeeDayTime)
											? "text-red-500"
											: isDayTimeSame(rosterDayTime, employeeDayTime)
												? "text-green-500"
												: "text-gray-500"
								}
								onClick={(e) => {
									e.stopPropagation();
									if (!isDisabled && roster?.timeSource === TimeSource.CUSTOM) {
										handleCustomizeTime();
									}
								}}
							/>
						)}
					</Button>
				</PopoverTrigger>

				<PopoverContent className="w-40 p-2">
					<div className="flex flex-col space-y-2">
						{Object.values(TimeSource).map((workingHoursType) => (
							<Button
								key={workingHoursType}
								variant={roster?.timeSource === workingHoursType ? "filled" : "ghost"}
								className="justify-start"
								onClick={() => {
									if (workingHoursType === TimeSource.CUSTOM) {
										handleCustomizeTime();
										return;
									}
									handleSelect({ timeSource: workingHoursType });
								}}
								disabled={isDisabled}
							>
								{getTimeSourceLabel(workingHoursType)}
							</Button>
						))}
					</div>
				</PopoverContent>
			</Popover>
		</div>
	);
};

export default TimeSourceSelector;
