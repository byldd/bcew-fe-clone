"use client";

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { ISubContractorDailyJobDetailsResponse, ISubContractorDailyJobLogTime } from "@/module/sub-contractor/types";

import { extractTimeForInput } from "@/module/schedule-management/time-logs-management/utils";
import { openErrorToast, openSuccessToast } from "@/components/toast";
import { useUpdateSubContractorDailyJobTime } from "@/module/sub-contractor/hooks/useSubContractorJobSchedule";
import { dateToUTCString, setTime } from "@/lib/utils/date";
import useAuthStore from "@/store/auth-store";

interface ISubContractorTimeLogModalContentProps {
	subContractorJobUpdates: ISubContractorDailyJobLogTime;
	onClose: () => void;
	assignedJob: ISubContractorDailyJobDetailsResponse;
	refetch: () => void;
}

export function SubContractorTimeLogModalContent({
	subContractorJobUpdates,
	onClose,
	assignedJob,
	refetch,
}: ISubContractorTimeLogModalContentProps) {
	const [startTime, setStartTime] = useState(extractTimeForInput(subContractorJobUpdates?.startTime));
	const [endTime, setEndTime] = useState(extractTimeForInput(subContractorJobUpdates?.endTime));

	const subContractorType = useAuthStore((state) => state);

	const { mutate: updateSubContractorDailyJobTime, isPending } = useUpdateSubContractorDailyJobTime(
		subContractorType?.user,
		subContractorType?.subcontractorCrew
	);

	const handleLogTimeSave = (startTime: string | undefined, endTime: string | undefined) => {
		if (!startTime || !endTime || !assignedJob?.id || !assignedJob?.date) return;

		const date = assignedJob?.date;

		if (!date) return;

		updateSubContractorDailyJobTime(
			{
				jobDailyRecordId: assignedJob.id,
				startTime: dateToUTCString(setTime(date, startTime)),
				endTime: dateToUTCString(setTime(date, endTime)),
			},
			{
				onSuccess: () => {
					refetch();
					openSuccessToast("Time updated successfully.");
					onClose();
				},
				onError: (error) => {
					openErrorToast({ error });
				},
			}
		);
	};

	const handleSubmit = () => {
		if (!startTime || !endTime) return;

		if (startTime && endTime && startTime >= endTime) {
			openErrorToast({ message: "Start time must be earlier than end time." });
			return;
		}

		handleLogTimeSave(startTime, endTime);
	};

	return (
		<div className="w-full space-y-4 px-0">
			<div className="flex min-w-full space-x-4 px-2">
				<div className="w-full flex-1">
					<Label htmlFor="start-time" className="font-inter text-xs font-normal text-brand-grey">
						Start Time
					</Label>
					<input
						id="start-time"
						type="time"
						value={startTime}
						onChange={(e) => setStartTime(e.target.value)}
						className="min-w-full rounded-[10px] border-none px-1 py-2"
					/>
				</div>
				<div className="w-full flex-1">
					<Label htmlFor="end-time" className="font-inter text-xs font-normal text-brand-grey">
						End Time
					</Label>
					<input
						id="end-time"
						type="time"
						value={endTime}
						onChange={(e) => setEndTime(e.target.value)}
						className="min-w-full rounded-[10px] border-none px-1 py-2"
					/>
				</div>
			</div>

			<Button
				disabled={!startTime || !endTime || isPending}
				variant="filled"
				className="mt-4 w-full"
				onClick={handleSubmit}
				loading={isPending}
			>
				Save Time
			</Button>
		</div>
	);
}
