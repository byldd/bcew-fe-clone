"use client";

import { useEffect, useState } from "react";
import { DataTable } from "@/components/shared/datatable/datatable";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useSubContractorCrews, useSubContractors } from "../hooks/useSubContracrtor";
import { useSubContractorCrewsParams } from "@/module/admin-sub-contractor/hooks/useSubContractorCrewsParams";
import { useDebounce } from "@/hooks/useDebounce";
import { useSubContractorColumns } from "@/module/admin-sub-contractor/utils/column";
import SubContractorHeader from "@/module/admin-sub-contractor/components/sub-contractor-header";
import ErrorMessageComponent from "@/components/get-error-message";
import CrewStatusTab from "../components/crew-status-tab";

export default function SubContractorList() {
	const { getParams, setParams } = useSubContractorCrewsParams();
	const { page, pageSize, activeSubContractor, crewStatus } = getParams();
	const columns = useSubContractorColumns();
	const [search, setSearch] = useState("");
	const debouncedSearch = useDebounce(search, 1000);

	const { data: subContractors = [] } = useSubContractors();

	const {
		data,
		isLoading: isCrewsLoading,
		isError: isCrewError,
		error: crewError,
	} = useSubContractorCrews(activeSubContractor || "", {
		page,
		pageSize,
		searchValue: debouncedSearch,
		crewStatus,
	});

	useEffect(() => {
		if (!activeSubContractor && subContractors.length > 0) {
			setParams({ activeSubContractor: subContractors[0]?.id });
		}
	}, [activeSubContractor, subContractors, setParams]);

	if (isCrewError) {
		return ErrorMessageComponent({ error: crewError });
	}

	return (
		<div className="w-full">
			{/* Header */}
			<SubContractorHeader search={search} onSearchChange={setSearch} />

			<Tabs
				value={activeSubContractor}
				onValueChange={(tabId) => {
					setParams({ activeSubContractor: tabId, page: 1, pageSize: 10 });
					setSearch("");
				}}
				className="w-full"
			>
				<div className="no-scrollbar overflow-x-auto pb-4">
					<div className="flex min-w-max items-center gap-2 px-0.5">
						{/* Subcontractor company tabs */}
						<TabsList className="inline-flex items-center gap-2 bg-transparent p-0">
							{subContractors.map((sc) => (
								<TabsTrigger
									key={sc.id}
									value={sc.id}
									className="inline-flex h-10 items-center justify-center whitespace-nowrap rounded-[8px] border border-brand-dark10 px-3 py-2 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-brand-dark data-[state=inactive]:bg-white data-[state=active]:text-white data-[state=inactive]:text-brand-dark"
								>
									{sc.name}
								</TabsTrigger>
							))}
						</TabsList>

						{/* Visual separator */}
						{subContractors.length > 0 && <span className="bg-brand-dark20 h-5 w-px shrink-0" />}

						{/* Active / Inactive status filter */}
						<CrewStatusTab activeTab={crewStatus} onChange={(tab) => setParams({ crewStatus: tab })} />
					</div>
				</div>

				{/* Tab Content */}
				{subContractors.map((sc) => (
					<TabsContent key={sc.id} value={sc.id}>
						{data?.items && (
							<DataTable
								showGridLines
								stickyHeaderMode
								useSectionHeader={false}
								className="!p-0"
								columns={columns}
								data={sc.id === activeSubContractor ? data.items : []}
								isLoading={isCrewsLoading}
								paginatorOptions={{
									currentPage: page,
									pageSize,
									total: data?.total ?? 0,
									setPage: (page: number) => setParams({ page }),
									setPageSize: (size: number) => setParams({ pageSize: size, page: 1 }),
								}}
							/>
						)}
					</TabsContent>
				))}
			</Tabs>
		</div>
	);
}
