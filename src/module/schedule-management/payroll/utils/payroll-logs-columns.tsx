import { ColumnDef } from "@tanstack/react-table";
import { IGetPayRollLogResponse } from "../types/payroll";
import { toFormattedDate, toLocalFormattedDate } from "@/lib/utils/date";
import { DATE_FORMAT } from "@/types/date";

export const payRollLogColumns: ColumnDef<IGetPayRollLogResponse[number]>[] = [
	{
		header: "Week",
		cell: ({ row }) => {
			const payRollWeek = row.original.payRollWeek;
			if (!payRollWeek) return "N/A";
			const { weekStartDate, weekEndDate } = payRollWeek;
			return `${toFormattedDate(weekStartDate)} - ${toFormattedDate(weekEndDate)}`;
		},
	},

	{
		header: "Created By",
		cell: ({ row }) => {
			const { user } = row.original;
			return user?.name;
		},
	},
	{
		header: "Date Created",
		accessorKey: "createdAt",
		cell: ({ row }) => {
			const { createdAt } = row.original;
			return toLocalFormattedDate(createdAt, DATE_FORMAT.DATE_AND_TIME);
		},
	},
];
