import { ColumnDef } from "@tanstack/react-table";
import { Pencil, Trash2 } from "lucide-react";
import WriteAccessWrapper from "@/module/admin/components/write-access-wrapper";
import { MODULE } from "@/utils/enums";
import { IGetMapZone } from "../types/zone";

interface GetProjectZoneColumnsArgs {
	onEdit: (zone: IGetMapZone) => void;
	onDelete: (zone: IGetMapZone) => void;
}

// Column set for the Project-tab table view - zone's own fields plus the linked bcew.reccln
// details (only present for MAP_ZONE_TYPE.PROJECT zones, see IGetMapZone.reccln). Add a column
// here when a new reccln field is requested; keep it to the "important" fields, not every column.
export const getProjectZoneColumns = ({ onEdit, onDelete }: GetProjectZoneColumnsArgs): ColumnDef<IGetMapZone>[] => [
	{
		id: "recnum",
		header: "Project #",
		cell: ({ row }) => row.original.reccln?.recnum ?? "--",
	},
	{
		id: "name",
		header: "Project",
		cell: ({ row }) => row.original.name,
	},
	{
		id: "shortName",
		header: "Short Name",
		cell: ({ row }) => row.original.reccln?.shtnme || "--",
	},
	{
		id: "address",
		header: "Address",
		cell: ({ row }) => {
			const reccln = row.original.reccln;
			if (!reccln) return row.original.fullAddress ?? "--";
			return [reccln.addrs1, reccln.addrs2].filter(Boolean).join(" ") || "--";
		},
	},
	{
		id: "city",
		header: "City",
		cell: ({ row }) => row.original.reccln?.ctynme || "--",
	},
	{
		id: "state",
		header: "State",
		cell: ({ row }) => row.original.reccln?.state_ || "--",
	},
	{
		id: "zip",
		header: "Zip",
		cell: ({ row }) => row.original.reccln?.zipcde || "--",
	},
	{
		id: "crossStreet",
		header: "Cross Street",
		cell: ({ row }) => row.original.reccln?.crsstr || "--",
	},
	{
		id: "phone",
		header: "Phone",
		cell: ({ row }) => row.original.reccln?.phnnum || "--",
	},

	{
		id: "action",
		header: "Actions",
		cell: ({ row }) => (
			<WriteAccessWrapper moduleName={MODULE.WEEKLY_SCHEDULE}>
				<div className="flex items-center justify-center gap-3">
					<button
						type="button"
						onClick={(e) => {
							e.stopPropagation();
							onEdit(row.original);
						}}
						aria-label="Edit zone"
						className="text-brand-grey hover:text-brand-dark"
					>
						<Pencil size={14} />
					</button>
					<button
						type="button"
						onClick={(e) => {
							e.stopPropagation();
							onDelete(row.original);
						}}
						aria-label="Delete zone"
						className="text-brand-grey hover:text-red-500"
					>
						<Trash2 size={14} />
					</button>
				</div>
			</WriteAccessWrapper>
		),
	},
];
