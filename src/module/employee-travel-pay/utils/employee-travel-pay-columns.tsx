import { ColumnDef } from "@tanstack/react-table";
import { IEmployeeTravelPayRequestsResponse } from "../types";
import { toFormattedDate } from "@/lib/utils/date";
import { formatSnakeCase } from "@/lib/utils/value-formatter";

export const employeeTravelPayColumns: ColumnDef<IEmployeeTravelPayRequestsResponse[number]>[] = [
	{
		accessorKey: "date",
		header: "Date",
		cell: ({ row }) => toFormattedDate(row.original.date),
	},
	{
		accessorKey: "firstStopDistance",
		header: "First Stop Distance",
		cell: ({ row }) => row.original.firstStopDistance,
	},
	{
		accessorKey: "lastStopDistance",
		header: "Last Stop Distance",
		cell: ({ row }) => row.original.lastStopDistance,
	},
	{
		accessorKey: "firstStop",
		header: "First Stop",
		cell: ({ row }) => row.original.firstStop,
	},
	{
		accessorKey: "lastStop",
		header: "Last Stop",
		cell: ({ row }) => row.original.lastStop,
	},

	{
		header: "Status",
		cell: ({ row }) => {
			const status = row?.original?.traevlPayRequestStatuses[0]?.status;
			return <span>{formatSnakeCase(status)}</span>;
		},
	},
];
