"use client";

import { useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import ErrorMessageComponent from "@/components/get-error-message";
import { DataTable } from "@/components/shared/datatable/datatable";
import { useJobPullList } from "../hooks/useJobPullList";
import { parseNumberParam } from "../utils";
import { getJobLevelPullListColumns } from "../utils/job-level-pull-list-columns";
import { JobLevelPullListTemplateProps } from "../utils/types";

export default function JobLevelPullListTemplate({
	jobnum: jobnumProp,
	tsknum: tsknumProp,
	hideHeader = false,
	searchInputClassName = "w-[260px]",
}: JobLevelPullListTemplateProps) {
	const searchParams = useSearchParams();
	const [search, setSearch] = useState("");

	const jobnum = jobnumProp ?? parseNumberParam(searchParams.get("jobnum"));
	const tsknum = tsknumProp ?? parseNumberParam(searchParams.get("tsknum"));

	const { data, isLoading, isError, error } = useJobPullList(jobnum, tsknum);

	const items = useMemo(() => data?.items ?? [], [data?.items]);

	const columns = useMemo(() => getJobLevelPullListColumns(), []);

	const filteredItems = useMemo(() => {
		if (!search.trim()) return items;
		const searchLower = search.toLowerCase();

		return items.filter((item) => {
			const partNumber = item.prtnum?.toString() ?? "";
			const partName = item.prtdsc?.toLowerCase() ?? "";
			return partNumber.includes(searchLower) || partName.includes(searchLower);
		});
	}, [items, search]);

	if (isError) return ErrorMessageComponent({ error });

	return (
		<div className="space-y-4">
			{!hideHeader ? (
				<div className="flex flex-wrap items-center justify-between gap-3">
					<div>
						<h1 className="text-lg font-semibold text-brand-dark50">Pull List</h1>
					</div>
				</div>
			) : null}

			<DataTable
				columns={columns}
				data={filteredItems}
				useSectionHeader={false}
				//temporarily disabled
				// handleSearch={setSearch}
				showGridLines
				stickyHeaderMode
				compact
				searchValue={search}
				searchPlaceholder="Search by part name or number"
				searchInputClassName={searchInputClassName}
				isLoading={isLoading}
			/>
		</div>
	);
}
