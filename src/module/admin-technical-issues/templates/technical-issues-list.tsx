"use client";

import { useEffect, useState } from "react";
import SectionHeader from "@/components/shared/section-header";

import { DataTable } from "@/components/shared/datatable/datatable";
import { useTechnicalIssuesColumns } from "../utils/technical-columns";
import { useAdminTechnicalIssuesParams } from "../hooks/use-admin-technical-issue-params";
import { useAdminTechnicalIssues } from "../hooks/useTechnicalIssues";
import { toDate, toMidnightDateString } from "@/lib/utils/date";
import FilterTrigger from "../components/filter-trigger";
import ReportIssueTrigger from "../components/report-technical-issue-trigger";
import { FiSearch } from "react-icons/fi";
import { DatePicker } from "@/components/ui/date-picker";
import { useTypedTranslations } from "@/i18n/useTypedTranslations";
import { NAMESPACE } from "@/i18n/type";
import { useDebounce } from "@/hooks/useDebounce";
import useAuthStore from "@/store/auth-store";
import { ROLES } from "@/types";

export default function AdminTechnicalIssuesPage() {
	const { user } = useAuthStore((state) => state);
	const isAdmin = user?.userType === ROLES.ADMIN;
	const [search, setSearch] = useState("");
	const debouncedSearch = useDebounce(search, 500);
	const tCommon = useTypedTranslations(NAMESPACE.COMMON);
	const tAdmin = useTypedTranslations(NAMESPACE.ADMIN);
	const { getParams, setParams, clearDates } = useAdminTechnicalIssuesParams();
	const { startDate, endDate, role, status, action, page, pageSize } = getParams();

	useEffect(() => {
		clearDates();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	// Reset to page 1 when search or filters change
	useEffect(() => {
		setParams({ page: 1 });
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [debouncedSearch, startDate, endDate, role, status, action]);

	const { data, isLoading } = useAdminTechnicalIssues({
		startDate,
		endDate,
		role,
		status,
		action,
		page,
		pageSize,
		searchValue: debouncedSearch || undefined,
		reporterId: isAdmin ? undefined : (user?.id ?? undefined),
	});

	const columns = useTechnicalIssuesColumns();

	return (
		<div className="flex flex-col gap-3 space-y-4">
			<div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
				<SectionHeader title={tCommon.technicalIssues} />

				<div className="no-scrollbar overflow-x-auto">
					<div className="flex min-w-max items-center gap-2">
						<div className="relative">
							<FiSearch size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-brand-dark50" />
							<input
								type="text"
								value={search}
								onChange={(e) => setSearch(e.target.value)}
								placeholder={tAdmin.searchByIssueEmployee}
								className="h-10 w-[240px] rounded-[8px] border border-brand-dark10 bg-white pl-9 pr-3 text-sm outline-none"
							/>
						</div>
						<DatePicker
							className="border-none bg-white shadow-md hover:bg-white"
							mode={"range"}
							onClear={() => {
								clearDates();
							}}
							selected={{
								from: startDate ? toDate(startDate) : undefined,
								to: endDate ? toDate(endDate) : undefined,
							}}
							onSelect={(value) => {
								setParams({
									startDate: value?.from ? toMidnightDateString(value.from) : undefined,
									endDate: value?.to ? toMidnightDateString(value.to) : undefined,
								});
							}}
							key="date-picker"
							required={false}
						/>
						<FilterTrigger key="filter-trigger" />
						<ReportIssueTrigger key="report-issue" />
					</div>
				</div>
			</div>

			{/* DataTable */}
			<DataTable
				showGridLines
				stickyHeaderMode
				columns={columns}
				data={data?.items ?? []}
				isLoading={isLoading}
				useSectionHeader={false}
				paginatorOptions={{
					pageSize: pageSize ?? 25,
					total: data?.total ?? 0,
					currentPage: page ?? 1,
					setPageSize: (size: number) => setParams({ pageSize: size, page: 1 }),
					setPage: (p: number) => setParams({ page: p }),
				}}
			/>
		</div>
	);
}
