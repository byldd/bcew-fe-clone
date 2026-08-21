import { toFormattedDate } from "@/lib/utils/date";
import { DATE_FORMAT } from "@/types/date";
import { ColumnDef, Row } from "@tanstack/react-table";
import { IExtendedTimeRequestRow } from "./types";
import { extendedReasonType, extendedTimeType } from "@/module/job/utils/enums";
import { extendedReasonMap } from "@/module/job/utils/constants";
import AcceptETRAction from "../components/accept-etr-action";
import { calculateExtendedHours } from "@/module/job/utils";
import { ViewETRAndMDTRNote } from "../components/view-etr-mdtr-note";
import { useTypedTranslations } from "@/i18n/useTypedTranslations";
import { NAMESPACE } from "@/i18n/type";
import { useAdminPageAccessContext } from "@/module/admin/context/page-access";
import { ACCESS_LEVEL } from "@/module/employee/enums";

export const useExtendedTimeRequestColumns = () => {
	const tEmployee = useTypedTranslations(NAMESPACE.EMPLOYEE);
	const tTimelogs = useTypedTranslations(NAMESPACE.TIME_LOGS);
	const tTravel = useTypedTranslations(NAMESPACE.TRAVEL_PAY);
	const tAdmin = useTypedTranslations(NAMESPACE.ADMIN);

	const { pageAccess } = useAdminPageAccessContext();

	const Columns: ColumnDef<IExtendedTimeRequestRow>[] = [
		{
			header: tTimelogs.employeeName,
			accessorKey: "employeeName",
		},

		{
			header: tTimelogs.date,
			cell: ({ row }) => {
				return toFormattedDate(row.original.date);
			},
		},

		{
			header: tEmployee.rosterTime,
			cell: ({ row }) => {
				const { rosterStart, rosterEnd } = row.original;
				if (!rosterStart || !rosterEnd) return "-";

				return (
					<span>
						{toFormattedDate(rosterStart, DATE_FORMAT.HH_MM_AA_PM)} -{" "}
						{toFormattedDate(rosterEnd, DATE_FORMAT.HH_MM_AA_PM)}
					</span>
				);
			},
		},

		{
			header: tTimelogs.requestType,
			accessorKey: "requestType",
			cell: ({ getValue }) => {
				const value = getValue<extendedTimeType.EARLY_START | extendedTimeType.LATE_RELEASE>();
				return value === extendedTimeType.EARLY_START ? "Early Start" : "Late Release";
			},
		},

		{
			header: "Early Start / Late Release",
			cell: ({ row }) => {
				const { requestType, requestStart, requestEnd } = row.original;

				if (requestType === extendedTimeType.EARLY_START) {
					return (
						<>
							<div className="text-xs text-muted-foreground">{tEmployee.earlyStartTime}</div>
							<div>{requestStart && toFormattedDate(requestStart, DATE_FORMAT.HH_MM_AA_PM)}</div>
						</>
					);
				} else if (requestType === extendedTimeType.LATE_RELEASE) {
					return (
						<>
							<div className="text-xs text-muted-foreground">{tEmployee.lateReleaseTime}</div>
							<div>{requestEnd && toFormattedDate(requestEnd, DATE_FORMAT.HH_MM_AA_PM)}</div>
						</>
					);
				} else {
					return (
						<>
							<div className="text-xs text-muted-foreground">{tEmployee.earlyStartTime}</div>
							<div>{requestStart && toFormattedDate(requestStart, DATE_FORMAT.HH_MM_AA_PM)}</div>
							<div className="mt-2 text-xs text-muted-foreground">{tEmployee.lateReleaseTime}</div>
							<div>{requestEnd && toFormattedDate(requestEnd, DATE_FORMAT.HH_MM_AA_PM)}</div>
						</>
					);
				}
			},
		},

		{
			header: tTimelogs.extendedHours,
			cell: ({ row }) => {
				const { requestStart, requestEnd, rosterStart, rosterEnd, extendedType } = row.original;
				if (!requestStart || !rosterStart || !requestEnd || !rosterEnd) return "--";
				let extendedHours = "--";
				if (extendedType === extendedTimeType.EARLY_START) {
					extendedHours = calculateExtendedHours(requestStart, rosterStart, extendedType);
				} else if (extendedType === extendedTimeType.LATE_RELEASE) {
					extendedHours = calculateExtendedHours(requestEnd, rosterEnd, extendedType);
				} else {
					const earlyHours = calculateExtendedHours(requestStart, rosterStart, extendedTimeType.EARLY_START);
					const lateHours = calculateExtendedHours(requestEnd, rosterEnd, extendedTimeType.LATE_RELEASE);
					extendedHours = `Early - ${earlyHours}  Late - ${lateHours}`;
				}
				return `${extendedHours}`;
			},
		},
		{
			header: tEmployee.reason,
			cell: ({ row }) => {
				return (
					<div>
						<p>{extendedReasonMap[row.original.reason]}</p>
						{row.original.reason === extendedReasonType.WORK_ON_SCHEDULED_JOB && (
							<p className="text-brand-grey">{row.original.stopName}</p>
						)}
					</div>
				);
			},
		},
		{
			header: tEmployee.note,
			cell: ({ row }) => {
				return (
					<div className="flex items-center justify-center">
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
							<span className="text-green-600"> {tEmployee.approved}</span>
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
						cell: ({ row }: { row: Row<IExtendedTimeRequestRow> }) => {
							return (
								<div className="flex items-center justify-center">
									<AcceptETRAction extendedTimeId={row.original.id} />
								</div>
							);
						},
					},
				]
			: []),
	];

	return Columns;
};
