"use client";

import { useMemo, useState } from "react";
import { DataTable } from "@/components/shared/datatable/datatable";
import { useEmployees } from "@/module/employee/hooks/useEmployee";
import { IEmployee } from "@/module/employee/types";
import { useRouter } from "next/navigation";
import { routes } from "@/config/routes";
import { useEmployeeColumns } from "@/module/employee/utils/employees-columns";
import FilterTrigger from "../components/filter-trigger";
import { useEmployeeParams } from "../hooks/useEmployeeParams";
import ErrorMessageComponent from "@/components/get-error-message";
import { dateToUTCString } from "@/lib/utils/date";
import { useTypedTranslations } from "@/i18n/useTypedTranslations";
import { NAMESPACE } from "@/i18n/type";
import { Button } from "@/components/ui/button";
import { ENV, MODULE } from "@/utils/enums";
import SectionHeader from "@/components/shared/section-header";
import { FiSearch } from "react-icons/fi";
import { env } from "@/env.mjs";
import WriteAccessWrapper from "@/module/admin/components/write-access-wrapper";

export default function EmployeeList() {
	const { getParams } = useEmployeeParams();
	const { startDate, endDate, department, jobRole, status } = getParams();
	const columns = useEmployeeColumns();

	const [search, setSearch] = useState("");

	const { data, isPending, isError, error } = useEmployees({
		startDate: startDate ? dateToUTCString(startDate) : startDate,
		endDate: endDate ? dateToUTCString(endDate) : endDate,
		department,
		jobRole,
		status,
	});

	const router = useRouter();
	const tPmanagement = useTypedTranslations(NAMESPACE.PEOPLE_MANAGEMENT);
	const tschedule = useTypedTranslations(NAMESPACE.SCHEDULE);

	const handleRowClick = (row: IEmployee) => {
		router.push(routes.admin.employeesDetails(row.portalUser));
	};

	const filteredEmployees = useMemo(() => {
		if (!data?.items) return [];
		if (!search.trim()) return data.items;

		const searchLower = search.toLowerCase();

		return data.items.filter(
			(emp) =>
				emp.memberName.toLowerCase().includes(searchLower) || emp.employeeNumber.toLowerCase().includes(searchLower)
		);
	}, [data?.items, search]);

	if (isError) return ErrorMessageComponent({ error });

	return (
		<div className="min-h-screen w-full space-y-3 bg-white">
			{/* Header + Controls */}
			<div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
				<SectionHeader title={tPmanagement.employees} />

				{/* Controls row — search + filter + fingerprint */}
				<div className="no-scrollbar overflow-x-auto px-0.5 py-0.5">
					<div className="flex min-w-max items-center gap-2">
						<div className="relative">
							<FiSearch size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-brand-dark50" />
							<input
								type="text"
								placeholder={tschedule.searchByEmployeeNameOrNumber}
								className="h-10 w-[240px] rounded-[8px] border border-brand-dark10 bg-white pl-9 pr-3 text-sm outline-none"
								value={search}
								onChange={(e) => setSearch(e.target.value)}
							/>
						</div>
						<FilterTrigger />

						<WriteAccessWrapper moduleName={MODULE.EMPLOYEES_LIST}>
							<Button
								variant="outline"
								className="border border-black"
								onClick={() => router.push(routes.admin.warehouseFingerprint)}
							>
								Fingerprint
							</Button>
						</WriteAccessWrapper>
					</div>
				</div>
			</div>

			{/* Table */}
			<DataTable
				showGridLines
				stickyHeaderMode
				columns={columns}
				data={filteredEmployees}
				isLoading={isPending}
				useSectionHeader={false}
				onClick={handleRowClick}
			/>
		</div>
	);
}
