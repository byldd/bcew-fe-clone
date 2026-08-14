"use client";

import { useEffect, useMemo, useState } from "react";
import { Search } from "lucide-react";
import SectionHeader from "@/components/shared/section-header";
import { Input } from "@/components/ui/input";
import { DataTable } from "@/components/shared/datatable/datatable";
import { useModal } from "@/hooks/useModal";
import { useDebounce } from "@/hooks/useDebounce";
import { dateToUTCString } from "@/lib/utils/date";
import { useAdminMissingItemRequests } from "@/module/material-management/missing-item-requests-admin/hooks/useAdminMissingItemRequests";
import type { AdminMissingItemRequest } from "@/module/material-management/missing-item-requests-admin/utils/types";
import { getForemanMissingItemRequestsColumns } from "../utils/foreman-missing-item-requests-columns";
import { useForemanMissingItemRequestsParams } from "../hooks/useForemanMissingItemRequestsParams";
import type { ForemanMissingItemRequestsFiltersState } from "../utils/types";
import ForemanMissingItemRequestsFilters from "../components/foreman-missing-item-requests-filters";
import TakeActionModal from "../components/take-action-modal";

export default function ForemanMissingItemRequestsTemplate({ showBackButton = false }: { showBackButton?: boolean }) {
	const { openModal, closeModal, Modal } = useModal();

	const { getParams, setParams } = useForemanMissingItemRequestsParams();
	const { id: notificationId, startDate, endDate, page, pageSize, ...filters } = getParams();
	const isSingleItemView = !!notificationId;

	const [keywordInput, setKeywordInput] = useState("");
	const debouncedKeyword = useDebounce(keywordInput, 400);

	const { data, isLoading } = useAdminMissingItemRequests(
		isSingleItemView
			? { page: 1, pageSize: 1, id: notificationId }
			: {
					page,
					pageSize,
					projectNumbers: filters.projectNumbers.length ? filters.projectNumbers : undefined,
					jobNumbers: filters.jobNumbers.length ? filters.jobNumbers : undefined,
					jobNames: filters.jobNames.length ? filters.jobNames : undefined,
					phaseNames: filters.phaseNames.length ? filters.phaseNames : undefined,
					statuses: filters.statuses.length ? filters.statuses : undefined,
					requestedByUserIds: filters.requestedByUserIds.length ? filters.requestedByUserIds : undefined,
					searchValue: debouncedKeyword || undefined,
					startDate: startDate ? dateToUTCString(startDate) : undefined,
					endDate: endDate ? dateToUTCString(endDate) : undefined,
				}
	);

	const rows = useMemo(() => data?.items ?? [], [data]);

	const handleTakeAction = (item: AdminMissingItemRequest) => {
		openModal({
			modalTitle: "Take Action",
			modalView: <TakeActionModal item={item} onClose={closeModal} />,
			variant: "medium",
		});
	};

	const columns = useMemo(() => getForemanMissingItemRequestsColumns({ onTakeAction: handleTakeAction }), []); // eslint-disable-line react-hooks/exhaustive-deps

	const handleFilterChange = <K extends keyof ForemanMissingItemRequestsFiltersState>(
		key: K,
		value: ForemanMissingItemRequestsFiltersState[K]
	) => {
		setParams({ [key]: value.length ? value : null, page: 1 });
	};

	const handleDateRangeChange = (nextStart: Date | null, nextEnd: Date | null) => {
		setParams({ startDate: nextStart, endDate: nextEnd, page: 1 });
	};

	return (
		<div className="w-full space-y-4 bg-white px-4 py-3 sm:px-6 sm:py-4">
			<Modal />
			<SectionHeader
				title="Unknown Item Requests"
				showBackButton={showBackButton}
				actions={
					<Input
						value={keywordInput}
						onChange={(event) => setKeywordInput(event.target.value)}
						placeholder="Search by job# / name"
						className="h-9 w-[260px] bg-white text-sm"
						icon={<Search className="h-4 w-4 text-brand-dark50" />}
						iconPosition="left"
					/>
				}
			/>

			<ForemanMissingItemRequestsFilters
				filters={filters}
				onFilterChange={handleFilterChange}
				startDate={startDate}
				endDate={endDate}
				onDateRangeChange={handleDateRangeChange}
			/>

			<DataTable
				useSectionHeader={false}
				columns={columns}
				data={rows}
				isLoading={isLoading}
				showGridLines
				stickyHeaderMode
				mobileCompact
				rowClassName={(row) =>
					notificationId && row.id === notificationId ? "bg-gray-300 hover:bg-gray-50" : "hover:bg-gray-50"
				}
				paginatorOptions={
					isSingleItemView
						? undefined
						: {
								pageSize,
								total: data?.total ?? 0,
								currentPage: page,
								setPageSize: (size: number) => setParams({ pageSize: size, page: 1 }),
								setPage: (nextPage: number) => setParams({ page: nextPage }),
							}
				}
			/>
		</div>
	);
}
