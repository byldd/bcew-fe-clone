"use client";

import { useMemo, useState } from "react";
import useAuthStore from "@/store/auth-store";
import { DataTable } from "@/components/shared/datatable/datatable";
import ErrorMessageComponent from "@/components/get-error-message";
import { useSubContractorCrews } from "../../../sub-contractor/hooks/useSubContractorCrew";
import { AllCrewColumns } from "../utils/crew-columns";
import CreateSubContractorNewCrewTrigger from "../components/create-new-sub-contractor-crew-trigger";
import { useSubContractorCrewsParams } from "@/module/admin-sub-contractor/hooks/useSubContractorCrewsParams";
import CrewStatusTab from "@/module/admin-sub-contractor/components/crew-status-tab";
import { useTypedTranslations } from "@/i18n/useTypedTranslations";
import { NAMESPACE } from "@/i18n/type";
import SectionHeader from "@/components/shared/section-header";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

const SubContractorCrews = () => {
	const { user, subcontractorCrew } = useAuthStore((state) => state);
	const { getParams, setParams } = useSubContractorCrewsParams();
	const { crewStatus } = getParams();
	const columns = AllCrewColumns();
	const [search, setSearch] = useState("");

	const { data, isPending, isError, error } = useSubContractorCrews(user, subcontractorCrew, {
		crewStatus,
	});

	const handleSearch = (value: string) => {
		setSearch(value);
	};

	const filteredCrews = useMemo(() => {
		if (!data?.crews) return [];
		if (!search.trim()) return data.crews;

		const searchLower = search.toLowerCase();

		return data.crews.filter((crew) => {
			const crewName = crew.name?.toLowerCase() ?? "";
			const crewLeader = crew.crewLeaderName?.toLowerCase() ?? "";

			return crewName.includes(searchLower) || crewLeader.includes(searchLower);
		});
	}, [data?.crews, search]);

	const tSub = useTypedTranslations(NAMESPACE.SUBCONTRACTOR);
	if (isError) return ErrorMessageComponent({ error });

	return (
		<div className="w-full space-y-4">
			<div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
				<div className="shrink-0">
					<SectionHeader title={tSub.crew} />
				</div>

				<div className="flex flex-col gap-4 sm:flex-row sm:items-center">
					<div className="w-[240px]">
						<Input
							className="h-10 w-full bg-white"
							icon={<Search className="h-4 w-4 text-muted-foreground" />}
							iconPosition="left"
							placeholder={tSub.searchByCrewName}
							onChange={(e) => handleSearch(e.target.value)}
							value={search}
						/>
					</div>

					{/* Status tabs + Create button — horizontally scrollable on mobile */}
					<div className="no-scrollbar flex items-center gap-2 overflow-x-auto">
						<div className="flex min-w-max items-center gap-2">
							<CrewStatusTab activeTab={crewStatus} onChange={(tab) => setParams({ crewStatus: tab })} />
							<CreateSubContractorNewCrewTrigger />
						</div>
					</div>
				</div>
			</div>

			{/* ── Data table (handles its own horizontal scroll) ── */}
			<DataTable
				columns={columns}
				data={filteredCrews}
				isLoading={isPending}
				useSectionHeader={false}
				stickyHeaderMode
				showGridLines
			/>
		</div>
	);
};

export default SubContractorCrews;
