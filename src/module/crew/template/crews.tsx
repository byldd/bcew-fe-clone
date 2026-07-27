"use client";

import { useMemo, useState } from "react";
import { DataTable } from "@/components/shared/datatable/datatable";
import { useCrewColumns } from "@/module/crew/utils/column";
import CreateNewCrewTrigger from "@/module/crew/components/create-new-crew-trigger";
import { useCrewParams } from "@/module/crew/hooks/useCrewParams";
import { useCrews } from "@/module/crew/hooks/useCrew";
import FilterTrigger from "@/module/crew/components/filterTrigger";
import ErrorMessageComponent from "@/components/get-error-message";

import { useTypedTranslations } from "@/i18n/useTypedTranslations";
import { NAMESPACE } from "@/i18n/type";
import SectionHeader from "@/components/shared/section-header";
import { FiSearch } from "react-icons/fi";

export default function CrewList() {
	const { getParams } = useCrewParams();
	const { department, crewLeader, startDate, endDate } = getParams();
	const tPmanagement = useTypedTranslations(NAMESPACE.PEOPLE_MANAGEMENT);
	const columns = useCrewColumns();

	const [search, setSearch] = useState("");

	const { data, isPending, isError, error } = useCrews({
		department,
		crewLeader,
		startDate,
		endDate,
	});

	const filteredCrews = useMemo(() => {
		if (!data?.items) return [];
		if (!search.trim()) return data.items;

		const searchLower = search.toLowerCase();

		return data.items.filter((crew) => {
			const crewName = crew.name?.toLowerCase() ?? "";
			const crewLeaderName = crew.crewLeader?.employeeName?.toLowerCase() ?? "";

			return crewName.includes(searchLower) || crewLeaderName.includes(searchLower);
		});
	}, [data?.items, search]);

	if (isError) return ErrorMessageComponent({ error });

	return (
		<div className="min-h-screen w-full space-y-3 bg-white">
			{/* Mobile: header on its own row */}
			<div className="sm:hidden">
				<SectionHeader title={tPmanagement.crewManagement} />
			</div>

			{/* Desktop: header + controls in one row | Mobile: controls stacked */}
			<div className="flex flex-col gap-3 py-2 sm:flex-row sm:items-center sm:justify-between sm:py-0">
				{/* Desktop-only inline header */}
				<div className="hidden sm:block">
					<SectionHeader title={tPmanagement.crewManagement} />
				</div>

				{/* Search + Filter + Create */}
				<div className="no-scrollbar flex items-center gap-2 overflow-x-auto">
					<div className="relative shrink-0">
						<FiSearch size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-brand-dark50" />
						<input
							type="text"
							placeholder={tPmanagement.searchByMember}
							className="h-9 w-[240px] rounded-[8px] border border-brand-dark10 bg-white pl-9 pr-3 text-sm outline-none"
							value={search}
							onChange={(e) => setSearch(e.target.value)}
						/>
					</div>
					<FilterTrigger />
					<CreateNewCrewTrigger />
				</div>
			</div>

			{/* Table */}
			<DataTable
				columns={columns}
				showGridLines
				stickyHeaderMode
				data={filteredCrews}
				isLoading={isPending}
				useSectionHeader={false}
			/>
		</div>
	);
}
