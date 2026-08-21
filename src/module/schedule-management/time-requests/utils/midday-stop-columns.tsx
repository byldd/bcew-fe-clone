import { toFormattedDate } from "@/lib/utils/date";
import { DATE_FORMAT } from "@/types/date";
import { ColumnDef, Row } from "@tanstack/react-table";
import { IMiddayStopRequest } from "./types";
import { formatDuration } from ".";
import { requestTypeLabel } from "@/module/midday-stops/utils/constants";
import { ViewETRAndMDTRNote } from "../components/view-etr-mdtr-note";
import { useTypedTranslations } from "@/i18n/useTypedTranslations";
import { NAMESPACE } from "@/i18n/type";
import { MIDDAY_STOP_REQUEST_TYPE } from "@/module/midday-stops/utils/enums";
import { useAdminPageAccessContext } from "@/module/admin/context/page-access";
import AccpetMDTRAction from "../components/accept-mdtr-action";
import { ACCESS_LEVEL } from "@/module/employee/enums";

export const useMiddayStopColumns = () => {
	const tEmployee = useTypedTranslations(NAMESPACE.EMPLOYEE);
	const tTimelogs = useTypedTranslations(NAMESPACE.TIME_LOGS);
	const tTravel = useTypedTranslations(NAMESPACE.TRAVEL_PAY);

	const { pageAccess } = useAdminPageAccessContext();
	const tAdmin = useTypedTranslations(NAMESPACE.ADMIN);

	const Columns: ColumnDef<IMiddayStopRequest>[] = [
		{
			header: tTimelogs.employeeName,
			cell: ({ row }) => <span>{row.original.employee?.user?.name}</span>,
		},
		{
			header: tEmployee.rosterTime,
			cell: ({ row }) => {
				const roster = row.original.employee?.user?.rosterTimes?.[0];

				if (!roster?.dayStartTime || !roster?.dayEndTime) return null;

				return (
					<span>
						{toFormattedDate(roster.dayStartTime, DATE_FORMAT.HH_MM_AA_PM)} -{" "}
						{toFormattedDate(roster.dayEndTime, DATE_FORMAT.HH_MM_AA_PM)}
					</span>
				);
			},
		},
		{
			accessorKey: "requestType",
			header: tTimelogs.requestType,
			cell: ({ row }) => requestTypeLabel[row.original.requestType] ?? "--",
		},
		{
			header: tTimelogs.timeTaken,
			cell: ({ row }) => (
				<span>
					{toFormattedDate(row.original.startTime, DATE_FORMAT.HH_MM_AA_PM)} -{" "}
					{toFormattedDate(row.original.endTime, DATE_FORMAT.HH_MM_AA_PM)}
				</span>
			),
		},
		{
			header: tTimelogs.hours,
			cell: ({ row }) => formatDuration(row.original.startTime, row.original.endTime),
		},
		{
			header: tTimelogs.jobDetails,
			cell: ({ row }) =>
				row.original.project ? (
					<div className="text-sm">
						<div className="font-medium">
							{row.original.requestType === MIDDAY_STOP_REQUEST_TYPE.ADD_NEW_STOP
								? row.original.project
								: requestTypeLabel[row.original.requestType]}
						</div>
						{row.original.actrec && (
							<div className="text-muted-foreground">
								{tEmployee.job} #{row.original.actrec}
							</div>
						)}
					</div>
				) : (
					(requestTypeLabel[row.original.requestType] ?? "--")
				),
		},

		{
			header: tEmployee.note,
			cell: ({ row }) => {
				return (
					<div>
						<ViewETRAndMDTRNote note={row.original.note} />
					</div>
				);
			},
		},
		{
			header: tTimelogs.status,
			cell: ({ row }) => {
				return (
					<div className="flex items-center justify-center">
						{row.original.isApproved === true ? (
							<span className="text-green-600">{tEmployee.approved}</span>
						) : row.original.isApproved === false ? (
							<span className="text-red-600">{tTravel.rejected}</span>
						) : (
							<span className="text-yellow-600">{tEmployee.pending}</span>
						)}
					</div>
				);
			},
		},

		...(pageAccess?.accessLevel === ACCESS_LEVEL.WRITE
			? [
					{
						header: tAdmin.action,
						cell: ({ row }: { row: Row<IMiddayStopRequest> }) => {
							return (
								<div className="flex items-center justify-center">
									<AccpetMDTRAction row={row.original} />
								</div>
							);
						},
					},
				]
			: []),
	];
	return Columns;
};
