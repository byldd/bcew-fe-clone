import { ColumnDef, Row } from "@tanstack/react-table";
import { ITimeVarianceResponse } from "./types";
import { getTodayDate, isSameDate, toDate, toFormattedDate } from "@/lib/utils/date";
import { useRouter } from "next/navigation";
import { routes } from "@/config/routes";
import { useTypedTranslations } from "@/i18n/useTypedTranslations";
import { NAMESPACE } from "@/i18n/type";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import TimeVarianceAttendanceRecords from "../components/time-variance-attendance-records";
import { FaRegClock } from "react-icons/fa";

export const useTimeVarianceColumns = ({ dates }: { dates: Date[] }) => {
	const tTimelogs = useTypedTranslations(NAMESPACE.TIME_LOGS);
	const timeVarianceColumns: ColumnDef<ITimeVarianceResponse>[] = [
		{
			accessorKey: "userName",
			header: tTimelogs.employeeName,
			cell: ({ row }) => {
				return <span>{row.original.userName}</span>;
			},
		},

		...dates?.map((date) => ({
			header: `${toFormattedDate(date)}`,
			cell: ({ row }: { row: Row<ITimeVarianceResponse> }) => {
				return <TimeVarianceCell row={row} date={date} />;
			},
		})),
	];

	return timeVarianceColumns;
};

const TimeVarianceCell = ({ row, date }: { row: Row<ITimeVarianceResponse>; date: Date }) => {
	const tEmployee = useTypedTranslations(NAMESPACE.EMPLOYEE);
	const tTimelogs = useTypedTranslations(NAMESPACE.TIME_LOGS);
	const router = useRouter();

	const timeVarianceData = row?.original;

	const currentDateTimeVariance = timeVarianceData?.timeVariance?.find((variance) => isSameDate(date, variance.date));

	const isFutreDate = toDate(date) > getTodayDate();

	if (!currentDateTimeVariance || isFutreDate) {
		return <div> -- </div>;
	}

	const onClick = () => {
		router.push(
			`${routes.admin.timeLogs}?userName=${row.original.userName}&startDate=${toFormattedDate(date).slice(0, 10)}`
		);
	};

	return (
		<div onClick={onClick}>
			{currentDateTimeVariance.attendanceRecords?.length > 0 && (
				<Popover>
					<PopoverTrigger asChild>
						<button
							className="absolute right-1 top-1 cursor-pointer text-brand-dark50 hover:text-brand-dark"
							onClick={(e) => e.stopPropagation()}
						>
							<FaRegClock size={14} />
						</button>
					</PopoverTrigger>
					<PopoverContent
						align="end"
						sideOffset={6}
						collisionPadding={16}
						className="w-auto border-none p-0 shadow-md"
						onClick={(e) => e.stopPropagation()}
					>
						<TimeVarianceAttendanceRecords attendanceRecords={currentDateTimeVariance.attendanceRecords} />
					</PopoverContent>
				</Popover>
			)}
			<p>
				Roster {tTimelogs.time}{" "}
				<span className="text-gray-400">
					({currentDateTimeVariance.schHours} {tEmployee.hrs})
				</span>{" "}
			</p>

			<p>
				{" "}
				{currentDateTimeVariance?.schStartTime} - {currentDateTimeVariance.schEndTime}{" "}
			</p>
			<p>
				Act.{tTimelogs.time}{" "}
				<span className="text-gray-400">
					({currentDateTimeVariance.actHours} {tEmployee.hrs})
				</span>
			</p>
			<p>
				{" "}
				{currentDateTimeVariance?.actStartTime} - {currentDateTimeVariance?.actEndTime}{" "}
			</p>
			{currentDateTimeVariance.pauseTime && (
				<>
					<p>{tTimelogs.pauseTime}</p>
					<p>{currentDateTimeVariance.pauseTime}</p>
				</>
			)}
		</div>
	);
};
