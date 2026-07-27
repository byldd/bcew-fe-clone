"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import SectionHeader from "@/components/shared/section-header";
import BackButton from "@/components/common/back-button";
import { DataTable } from "@/components/shared/datatable/datatable";
import { useMyMissingItemRequests } from "../hooks/useMissingItemRequests";
import { missingItemRequestsColumns } from "../utils/missing-item-requests-columns";
import { DEFAULT_PAGE_SIZE } from "@/module/job/material-selection/utils/consttants";

export default function MissingItemRequestsTemplate({ showBackButton = false }: { showBackButton?: boolean }) {
	const [page, setPage] = useState(1);
	const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);

	const searchParams = useSearchParams();
	const notificationId = searchParams.get("id");

	const { data, isLoading } = useMyMissingItemRequests({ page, pageSize });

	const items = data?.items ?? [];
	const total = data?.total ?? 0;

	useEffect(() => {
		if (!notificationId || !items.length) return;
		const el = document.getElementById(`mir-${notificationId}`);
		if (el) {
			el.scrollIntoView({ behavior: "smooth", block: "center" });
		}
	}, [items, notificationId]);

	return (
		<div className="w-full space-y-4 bg-white px-4 py-3 sm:px-6 sm:py-4">
			<div className="flex items-center gap-2">
				{showBackButton && <BackButton />}
				<SectionHeader title="Unknown Items" />
			</div>
			<DataTable
				useSectionHeader={false}
				columns={missingItemRequestsColumns}
				data={items}
				isLoading={isLoading}
				showGridLines
				stickyHeaderMode
				mobileCompact
				rowClassName={(row) =>
					notificationId && row.id === notificationId ? "bg-gray-300 hover:bg-gray-50" : "hover:bg-gray-50"
				}
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
