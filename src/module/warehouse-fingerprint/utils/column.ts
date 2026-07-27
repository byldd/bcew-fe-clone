import { createElement } from "react";
import { ColumnDef } from "@tanstack/react-table";
import { Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import FingerprintStatusBadge from "../components/fingerprint-status-badge";
import { IEnrolledStatus, IWarehouseEmployee } from "../types";

interface WarehouseEmployeeColumnOptions {
	tPeople: {
		memberName: string;
		jobRole: string;
	};
	enrolledMap: Map<string, IEnrolledStatus>;
	onEditFingerprints: (employee: IWarehouseEmployee) => void;
}

export const getWarehouseEmployeeColumns = ({
	tPeople,
	enrolledMap,
	onEditFingerprints,
}: WarehouseEmployeeColumnOptions): ColumnDef<IWarehouseEmployee>[] => [
	{
		accessorKey: "name",
		header: tPeople.memberName,
		cell: ({ row }) => createElement("span", { className: "font-medium" }, row.original.name),
	},

	{
		accessorKey: "role.name",
		header: tPeople.jobRole,
		cell: ({ row }) => createElement("span", { className: "font-medium" }, row.original.role?.name || "-"),
	},

	{
		accessorKey: "team.name",
		header: "Team",
		cell: ({ row }) => createElement("span", { className: "font-medium" }, row.original.team?.name || "-"),
	},

	{
		id: "enrolled",
		header: "Enrolled",
		cell: ({ row }) => {
			const enrollment = enrolledMap.get(row.original.id);

			return createElement(FingerprintStatusBadge, {
				count: enrollment?.count || 0,
			});
		},
	},

	{
		id: "action",
		header: "Action",
		cell: ({ row }) =>
			createElement(
				Button,
				{
					type: "button",
					variant: "ghost",
					size: "icon",
					onClick: () => onEditFingerprints(row.original),
					className: "h-8 w-8 text-blue-600 hover:bg-blue-100",
					title: "Edit Fingerprints",
				},
				createElement(Pencil, { className: "h-4 w-4" })
			),
	},
];
