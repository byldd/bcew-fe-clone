"use client";

import { ColumnDef } from "@tanstack/react-table";
import { IEmployee } from "@/module/employee/types";
import { PTORequestCell } from "@/module/employee/components/pto-request-cell";
import { USER_PERMISSION } from "@/module/employee/enums";
import { toFormattedDate } from "@/lib/utils/date";
import { DATE_FORMAT } from "@/types/date";
import { useTypedTranslations } from "@/i18n/useTypedTranslations";
import { NAMESPACE } from "@/i18n/type";

export const useEmployeeColumns = () => {
	const tPeople = useTypedTranslations(NAMESPACE.PEOPLE_MANAGEMENT);
	const columns: ColumnDef<IEmployee>[] = [
		{
			accessorKey: "memberName",
			header: tPeople.employeeName,
			cell: ({ row }) => {
				const name = row.original.memberName;
				return <span className="font-medium">{name}</span>;
			},
		},
		{
			accessorKey: "role",
			header: tPeople.jobRole,
			cell: ({ row }) => {
				const role = row.original.role;
				return <span className="font-medium">{role}</span>;
			},
		},
		{
			accessorKey: "ptoRequests",
			header: tPeople.ptoRequest,
			cell: ({ row }) => {
				const dates = row.original.ptoRequests.map((r) => r.trans_dte);
				return <PTORequestCell dates={dates} />;
			},
		},
		{
			accessorKey: "assignedVehicle",
			header: tPeople.assignedVehicle,
			cell: ({ row }) => {
				const assignedVehicle = row.original.assignedVehicle;
				return assignedVehicle || "-";
			},
		},
		{
			accessorKey: "department",
			header: tPeople.department,
		},
		{
			accessorKey: "joiningDate",
			header: tPeople.hireDate,
			cell: ({ row }) => {
				const joiningDate = row.original?.joiningDate;
				return joiningDate ? toFormattedDate(joiningDate, DATE_FORMAT.MM_SLASH_DD_YYYY) : "-";
			},
		},
		{
			header: tPeople.expectedOutput,
			cell: () => "-",
		},
		{
			header: tPeople.training,
			cell: () => "-",
		},
		{
			header: tPeople.permission,
			cell: ({ row }) => {
				return row?.original?.isPermissionOverridden ? USER_PERMISSION.CUSTOMIZED : USER_PERMISSION.DEFAULT;
			},
		},
	];
	return columns;
};
