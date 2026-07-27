"use client";

import { useState } from "react";
import BackButton from "@/components/common/back-button";
import { DataTable } from "@/components/shared/datatable/datatable";
import { useSubContractorMissingItemRequests } from "../hooks/useSubContractorPullList";
import { missingItemRequestsColumns } from "@/module/material-management/missing-item-requests/utils/missing-item-requests-columns";
import { DEFAULT_PAGE_SIZE } from "@/module/job/material-selection/utils/consttants";

export default function SubContractorMissingItemRequestsTemplate() {
	const [page, setPage] = useState(1);
	const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);

	const { data, isLoading } = useSubContractorMissingItemRequests({ page, pageSize });

	const items = data?.items ?? [];
	const total = data?.total ?? 0;

	return (
		<div className="min-h-screen bg-brand-bgLightgrey px-4 py-6">
			<div className="mb-4 flex items-center gap-2">
				<BackButton />
				<h1 className="text-lg font-semibold text-brand-dark">Unknown Items</h1>
			</div>
			<DataTable
				useSectionHeader={false}
				columns={missingItemRequestsColumns}
				data={items}
				isLoading={isLoading}
				showGridLines
				stickyHeaderMode
				rowClassName={() => "hover:bg-gray-50"}
				paginatorOptions={{
					pageSize,
					total,
					currentPage: page,
					setPageSize: (size: number) => {
						setPageSize(size);
						setPage(1);
					},
					setPage,
				}}
			/>
		</div>
	);
}
