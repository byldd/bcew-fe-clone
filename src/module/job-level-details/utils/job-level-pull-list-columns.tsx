import { ColumnDef } from "@tanstack/react-table";
import { FALLBACK } from "../constants";
import { formatQuantity, getStockStatus } from "./index";
import { JobPullListItem } from "./types";

export const getJobLevelPullListColumns = (): ColumnDef<JobPullListItem>[] => [
	{
		accessorKey: "prtnum",
		header: "Part#",
		size: 90,
		cell: ({ row }) => <span className="block w-full truncate">{row.original.prtnum ?? FALLBACK}</span>,
	},
	{
		accessorKey: "prtdsc",
		header: "Part Name",
		size: 360,
		cell: ({ row }) => (
			<span className="text-brand-dark70 block w-full truncate">{row.original.prtdsc || FALLBACK}</span>
		),
	},
	{
		accessorKey: "csttyp",
		header: "Stock Status",
		size: 140,
		cell: ({ row }) => {
			const status = getStockStatus(row.original.csttyp);
			return (
				<span className={`rounded-full px-3 py-1 text-[10px] font-semibold uppercase ${status.className}`}>
					{status.label}
				</span>
			);
		},
	},
	{
		accessorKey: "tsknme",
		header: "Phase",
		size: 90,
		cell: ({ row }) => <span className="block w-full truncate">{row.original.tsknme || FALLBACK}</span>,
	},
	{
		accessorKey: "vendor",
		header: "Provider",
		size: 90,
		cell: ({ row }) => <span className="block w-full truncate">{row.original.vendor || FALLBACK}</span>,
	},
	{
		accessorKey: "linqty",
		header: "ORD",
		size: 60,
		cell: ({ row }) => <span>{formatQuantity(row.original.linqty)}</span>,
	},
	{
		accessorKey: "linprc",
		header: "CHK",
		size: 60,
		cell: ({ row }) => <span>{formatQuantity(row.original.linprc)}</span>,
	},
	{
		accessorKey: "rcvdte",
		header: "RCV",
		size: 60,
		cell: ({ row }) => <span>{formatQuantity(row.original.rcvdte)}</span>,
	},
	{
		accessorKey: "cntqty",
		header: "BO",
		size: 60,
		cell: ({ row }) => <span>{formatQuantity(row.original.cntqty)}</span>,
	},
];
