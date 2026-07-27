import React, { useState } from "react";
import { IGetUserWeekendWorkResponse } from "../../types/weekend-work";
import { toFormattedDate } from "@/lib/utils/date";
import { TextareaField } from "@/components/ui/textareaField";
import { useUpdateUserWeekendWork } from "../../hooks/useWeekendWork";
import { Button } from "@/components/ui/button";
import { openErrorToast, openSuccessToast } from "@/components/toast";
import { useQueryClient } from "@tanstack/react-query";
import {
	E_WEEKEND_WORK_ADMIN_STATUS,
	E_WEEKEND_WORK_USER_STATUS,
} from "@/module/schedule-management/schedule-configuration/types/schedule-config";
import { getWeekendStatusLabel } from "../../utils";

const WeekendWorkModal = ({
	weekendWork,
	onClose,
}: {
	weekendWork: IGetUserWeekendWorkResponse[number];
	onClose: () => void;
}) => {
	const { userWeekendWork } = weekendWork;

	const { mutateAsync: updateUserWeekendWork, isPending } = useUpdateUserWeekendWork();
	const { label } = getWeekendStatusLabel(weekendWork);

	const willOptOut =
		userWeekendWork?.adminStatus === E_WEEKEND_WORK_ADMIN_STATUS.APPROVED ||
		userWeekendWork?.userStatus === E_WEEKEND_WORK_USER_STATUS.APPROVED;

	const [note, setNote] = useState(userWeekendWork?.note || "");
	const queryClient = useQueryClient();

	const handleAction = (userStatus: E_WEEKEND_WORK_USER_STATUS) => {
		if (willOptOut && !note) {
			openErrorToast({ message: "Please provide a reason for opting out" });
			return;
		}

		if (!userWeekendWork?.id) return;

		updateUserWeekendWork(
			{
				id: userWeekendWork?.id,
				note,
				userStatus,
			},
			{
				onSuccess: () => {
					queryClient.invalidateQueries({ queryKey: ["user-weekend-works"] });
					openSuccessToast(
						userStatus === E_WEEKEND_WORK_USER_STATUS.APPROVED
							? "Interest submitted. Awaiting confirmation"
							: "Interest declined"
					);
					onClose();
				},
				onError: (error) => {
					openErrorToast({ error });
				},
			}
		);
	};

	return (
		<div className="space-y-4">
			<div className="flex items-center justify-between">
				<div>
					<p className="text-sm text-brand-lightgrey">Date</p>
					{weekendWork?.date && <p className="text-sm font-medium">{toFormattedDate(weekendWork?.date)}</p>}
				</div>
				<div>
					<p className="text-sm text-brand-lightgrey">Status</p>
					<p className="text-sm font-medium">{label}</p>
				</div>
			</div>
			<div>
				<p className="text-sm text-brand-lightgrey">Admin Note</p>
				{<p className="text-sm font-medium">{weekendWork?.note || "--"}</p>}
			</div>

			<div className="space-y-1">
				<p className="text-sm text-brand-lightgrey">
					{willOptOut ? "Reason for Opting Out *" : "Add a Note (Optional)"}
				</p>
				<div className="px-0.5">
					<TextareaField placeholder="Type here" value={note} onChange={(e) => setNote(e.target.value)} />
				</div>
			</div>

			{willOptOut ? (
				<div className="my-3 flex gap-4">
					<Button className="w-full" variant="outline" onClick={onClose} disabled={isPending}>
						Cancel
					</Button>

					<Button
						className="w-full"
						variant="filled"
						onClick={() => handleAction(E_WEEKEND_WORK_USER_STATUS.OPT_OUT)}
						disabled={isPending}
					>
						Opt Out
					</Button>
				</div>
			) : (
				<div className="my-3 flex gap-4">
					{userWeekendWork?.userStatus == E_WEEKEND_WORK_USER_STATUS.OPT_OUT ||
					userWeekendWork?.userStatus == E_WEEKEND_WORK_USER_STATUS.DECLINED ? (
						<Button className="w-full" variant="outline" onClick={onClose} disabled={isPending}>
							Cancel
						</Button>
					) : (
						<Button
							className="w-full"
							variant="outline"
							onClick={() => handleAction(E_WEEKEND_WORK_USER_STATUS.DECLINED)}
							disabled={isPending}
						>
							Decline
						</Button>
					)}

					<Button
						className="w-full"
						variant="filled"
						onClick={() => handleAction(E_WEEKEND_WORK_USER_STATUS.APPROVED)}
						disabled={isPending}
					>
						Accept
					</Button>
				</div>
			)}
		</div>
	);
};

export default WeekendWorkModal;
