import { ColumnDef } from "@tanstack/react-table";
import {
	IRoleTiming,
	IRoster,
	ITeamTiming,
	IUserRoster,
} from "@/module/schedule-management/roster-time-configuration/types";
import { rosterDays } from "@/module/schedule-management/roster-time-configuration/constants";
import TimeSourceSelector from "@/module/schedule-management/roster-time-configuration/components/time-source-selector";
import { RosterWeekDays } from "@/module/schedule-management/roster-time-configuration/enums";
import { RefreshCw } from "lucide-react";
import { useModal } from "@/hooks/useModal";
import RosterSyncModal from "@/module/schedule-management/roster-time-configuration/modals/roster-sync-modal";
import { toFormattedDate } from "@/lib/utils/date";
import { DATE_FORMAT } from "@/types/date";
import { calculateTotalLoggedHours, calculateTotalScheduledHours, formatHoursToHM, getFormattedTimeRange } from ".";
import { FALLBACK_TIME_RANGE_STRINGS } from "@/utils/enums";
import { useTypedTranslations } from "@/i18n/useTypedTranslations";
import { NAMESPACE } from "@/i18n/type";

export const employeeTimeConfigColumns: ColumnDef<IUserRoster>[] = [
	{
		accessorKey: "name",
		header: "Employee",
		cell: ({ row }) => (
			<div id={`${row?.original?.id}`}>
				<p>{row?.original?.name}</p>
				<p className="text-gray-500">{row?.original?.team?.name}</p>
			</div>
		),
	},
	{
		accessorKey: "role",
		header: "Role",
		cell: ({ row }) => row?.original?.role?.name ?? "-",
	},
	...rosterDays.map(
		(day, index): ColumnDef<IUserRoster> => ({
			id: day,
			header: ({ table }) => {
				const firstRow = table.getRowModel().rows[0];
				const roster = firstRow?.original?.roster?.[index];
				if (roster?.date) {
					const dayNum = toFormattedDate(roster.date, DATE_FORMAT.DATE);
					const weekday = toFormattedDate(roster.date, DATE_FORMAT.WEEK_DAY);
					return (
						<div className="flex flex-col items-center">
							<span>{dayNum}</span>
							<span>{weekday}</span>
						</div>
					);
				}

				return day; // fallback if no date
			},
			cell: ({ row }) => {
				const roster = row.original.roster[index];
				if (!roster) return "--";
				if (day === RosterWeekDays.Saturday && !row?.original?.isSaturdayWorking) return "--";
				if (day === RosterWeekDays.Sunday && !row?.original?.isSundayWorking) return "--";
				if (roster?.isOnLeave) return <span className="text-md text-gray-500">PTO</span>;

				const rosterDayTime = {
					dayStartTime: roster?.dayStartTime || "",
					dayEndTime: roster?.dayEndTime || "",
				};

				if (roster?.isTimeOverridden && roster?.extendedApprovedStartTime && roster?.extendedApprovedEndTime) {
					rosterDayTime.dayStartTime = roster?.extendedApprovedStartTime;
					rosterDayTime.dayEndTime = roster?.extendedApprovedEndTime;
				}

				const loggedDayTime = {
					dayStartTime: roster?.employeeDayTime?.dayStartTime || "",
					dayEndTime: roster?.employeeDayTime?.dayEndTime || "",
				};

				return (
					<TimeSourceSelector
						roster={roster}
						timeRange={getFormattedTimeRange(roster?.dayStartTime, roster?.dayEndTime)}
						loggedTimeRange={getFormattedTimeRange(
							loggedDayTime?.dayStartTime,
							loggedDayTime?.dayEndTime,
							FALLBACK_TIME_RANGE_STRINGS.TIME_MISSING,
							true
						)}
						overrideTimeRange={getFormattedTimeRange(
							roster?.employeeDayTime?.overrideStartTime,
							roster?.employeeDayTime?.overrideEndTime,
							FALLBACK_TIME_RANGE_STRINGS.TIME_MISSING,
							true
						)}
						approvedExtendedTimeRange={getFormattedTimeRange(
							roster?.extendedApprovedStartTime,
							roster?.extendedApprovedEndTime
						)}
						employeeName={row?.original?.name}
						employeeDayTime={roster?.employeeDayTime}
						rosterDayTime={rosterDayTime}
					/>
				);
			},
		})
	),
	{
		id: "actualHours",
		header: "Scheduled Hours",
		cell: ({ row }) => {
			const { roster, isSaturdayWorking, isSundayWorking } = row.original;
			const totalScheduledHours = calculateTotalScheduledHours(roster, isSaturdayWorking, isSundayWorking);
			return formatHoursToHM(totalScheduledHours);
		},
	},
	{
		id: "loggedHours",
		header: "Logged Hours",
		cell: ({ row }) => {
			const { roster, isSaturdayWorking, isSundayWorking } = row.original;

			const totalScheduledHours = calculateTotalScheduledHours(roster, isSaturdayWorking, isSundayWorking);
			const totalLoggedHours = calculateTotalLoggedHours(roster, isSaturdayWorking, isSundayWorking);

			const totalLoggedHoursColor =
				!totalLoggedHours || totalLoggedHours <= 0
					? ""
					: totalLoggedHours === totalScheduledHours
						? "text-green-500"
						: "text-red-500";

			return <div className={totalLoggedHoursColor}>{formatHoursToHM(totalLoggedHours)}</div>;
		},
	},
	{
		id: "sync",
		cell: ({ row }) => (
			<ActionCell
				userId={row?.original?.id}
				userName={row?.original?.name}
				roster={row?.original?.roster}
				isSynced={row?.original?.isSynced}
				team={row?.original?.team}
				role={row?.original?.role}
			/>
		),
	},
];

interface ActionCellProps {
	userId: string;
	userName: string;
	roster: IRoster[];
	isSynced: boolean;
	team: ITeamTiming;
	role: IRoleTiming;
}

const ActionCell: React.FC<ActionCellProps> = ({ userId, roster, userName, isSynced, team, role }) => {
	const { openModal, closeModal, Modal } = useModal();
	const tEmployee = useTypedTranslations(NAMESPACE.EMPLOYEE_ROSTER);

	const handleClick = () => {
		openModal({
			modalTitle: tEmployee.syncStandardTiming,

			modalView: (
				<RosterSyncModal
					onClose={closeModal}
					userId={userId}
					userName={userName}
					userWeeklyRosterSchedule={roster}
					team={team}
					role={role}
				/>
			),

			variant: "medium",
		});
	};

	return (
		<>
			<Modal />
			<div className="flex w-full items-center justify-center gap-2 px-4">
				<button
					className={`flex items-center justify-center rounded-md p-2 transition-colors ${
						isSynced
							? "bg-green-100 text-green-700 hover:bg-[#D1EED1]"
							: "text-gray-500 hover:bg-gray-100 hover:text-gray-700"
					}`}
					onClick={handleClick}
				>
					<RefreshCw size={18} strokeWidth={2.2} />
				</button>
			</div>
		</>
	);
};
