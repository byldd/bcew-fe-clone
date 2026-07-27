"use client";
import React, { useState } from "react";
import { TableCell, TableRow } from "@/components/ui/table";
import { IUserWeekendWork, E_WEEKEND_SCHEDULE_BY_MODE, E_WEEKEND_WORK_ADMIN_STATUS } from "../types/schedule-config";
import { IUser } from "../../weekly-schedule-management/types/schedule-interface";
import { IWeekendWork } from "../types/schedule-config";
import { toFormattedDate } from "@/lib/utils/date";
import { DATE_FORMAT } from "@/types/date";
import { CheckSquare, PenSquare, Trash2, XSquare } from "lucide-react";
import { useDeleteUserWeekendWork, useUpdateUserWeekendWorks } from "../hooks/useScheduleConfig";
import { openErrorToast, openSuccessToast } from "@/components/toast";
import { useQueryClient } from "@tanstack/react-query";
import { getWeekendWorkAdminStatus, getWeekendWorkTechStatus } from "../utils/weekend-config";
import { formatSnakeCase } from "@/lib/utils/value-formatter";
import { AppTooltip } from "@/components/ui/tooltip";

type IUserWeekendWorkWithUser = IUserWeekendWork & { user?: IUser };

interface WeekendHistoryUserRowProps {
	userWork: IUserWeekendWorkWithUser;
	parentWork: IWeekendWork & { createdBy: IUser };
}

const WeekendHistoryUserRow: React.FC<WeekendHistoryUserRowProps> = ({ userWork, parentWork }) => {
	const adminStatusInfo = getWeekendWorkAdminStatus(userWork.adminStatus);
	const techStatusInfo = getWeekendWorkTechStatus(userWork.userStatus);

	const { mutate: updateUserWeekendWorks, isPending } = useUpdateUserWeekendWorks();
	const { mutate: deleteUserWeekendWork, isPending: isPendingDelete } = useDeleteUserWeekendWork();
	const queryClient = useQueryClient();

	const [editMode, setEditMode] = useState(false);

	const handleAction = (adminStatus: E_WEEKEND_WORK_ADMIN_STATUS) => {
		updateUserWeekendWorks(
			{
				userWeekendWorkId: userWork.id,
				adminStatus,
			},
			{
				onSuccess: () => {
					queryClient.invalidateQueries({ queryKey: ["weekend-works"] });
					setEditMode(false);
					openSuccessToast(
						`Weekend work ${adminStatus === E_WEEKEND_WORK_ADMIN_STATUS.APPROVED ? "approved" : "declined"} successfully`
					);
				},
				onError: (error) => {
					openErrorToast({ error });
				},
			}
		);
	};

	const handleDelete = () => {
		deleteUserWeekendWork(
			{
				userWeekendWorkId: userWork.id,
			},
			{
				onSuccess: () => {
					queryClient.invalidateQueries({ queryKey: ["weekend-works"] });
					setEditMode(false);
					openSuccessToast("Weekend work deleted successfully");
				},
				onError: (error) => {
					openErrorToast({ error });
				},
			}
		);
	};

	return (
		<TableRow className="h-16 border-t border-gray-100 bg-gray-50 hover:bg-gray-50">
			{/* Member Name */}
			<TableCell className="border-b border-r text-left text-sm font-medium text-brand-dark">
				{userWork.user?.name ?? "—"}
			</TableCell>

			{/* Day */}
			<TableCell className="border-b border-r text-center text-sm font-medium text-brand-dark">
				{toFormattedDate(parentWork.date, DATE_FORMAT.WEEK_DAY)}
			</TableCell>

			{/* Scheduled By */}
			<TableCell className="border-b border-r text-center text-sm font-medium text-brand-dark">
				{formatSnakeCase(parentWork.scheduleByMode)}
			</TableCell>

			{/* Working Mode */}
			<TableCell className="border-b border-r text-center text-sm font-medium text-brand-dark">
				{formatSnakeCase(userWork.mode)}
			</TableCell>

			{/* Tech Status */}
			<TableCell className="border-b border-r text-center text-sm font-medium text-brand-dark">
				{parentWork?.scheduleByMode === E_WEEKEND_SCHEDULE_BY_MODE.ADMIN ? (
					<>
						<span className={techStatusInfo.className}>{techStatusInfo.label}</span>
						{userWork?.note && userWork.note.trim() !== "" && userWork.note !== "--" ? (
							<AppTooltip
								trigger={<p className="cursor-pointer text-gray-500 underline">View note</p>}
								text={userWork.note}
							/>
						) : (
							<p className="mt-1 text-center text-xs text-gray-400">No data available</p>
						)}
					</>
				) : (
					<span className={techStatusInfo.className}>{"--"}</span>
				)}
			</TableCell>

			{/* Admin Status */}
			<TableCell className="border-b border-r text-center text-sm font-medium text-brand-dark">
				<span className={adminStatusInfo.className}>{adminStatusInfo.label}</span>
			</TableCell>

			{/* Action */}
			<TableCell className="border-b py-3 text-center">
				{parentWork?.scheduleByMode === E_WEEKEND_SCHEDULE_BY_MODE.ADMIN && (
					<div className="flex items-center justify-center gap-1">
						{editMode ? (
							<>
								<button
									disabled={isPending || isPendingDelete}
									onClick={() => handleAction(E_WEEKEND_WORK_ADMIN_STATUS.APPROVED)}
									type="button"
									aria-label="Approve"
									className="text-brand-dark transition-colors hover:text-green-600"
								>
									<CheckSquare className="h-5 w-5" />
								</button>
								<button
									disabled={isPending || isPendingDelete}
									onClick={() => handleAction(E_WEEKEND_WORK_ADMIN_STATUS.DECLINED)}
									type="button"
									aria-label="Decline"
									className="text-brand-dark transition-colors hover:text-red-500"
								>
									<XSquare className="h-5 w-5" />
								</button>

								<button
									disabled={isPending || isPendingDelete}
									onClick={() => handleDelete()}
									type="button"
									aria-label="Decline"
									className="text-brand-dark transition-colors hover:text-red-500"
								>
									<Trash2 className="h-5 w-5" />
								</button>
							</>
						) : (
							<button onClick={() => setEditMode(true)} type="button" aria-label="Edit">
								<PenSquare className="h-4 w-4" />
							</button>
						)}
					</div>
				)}
			</TableCell>
		</TableRow>
	);
};

export default WeekendHistoryUserRow;
