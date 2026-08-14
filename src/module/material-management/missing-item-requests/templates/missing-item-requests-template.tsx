"use client";

import { useEffect, useState } from "react";
import { Search } from "lucide-react";
import SectionHeader from "@/components/shared/section-header";
import { Spinner } from "@/components/ui/spinner";
import { Input } from "@/components/ui/input";
import { DataTablePagination } from "@/components/shared/datatable/data-table-pagination";
import { dateToUTCString } from "@/lib/utils/date";
import { useDebounce } from "@/hooks/useDebounce";
import { useMyMissingItemRequests } from "../hooks/useMissingItemRequests";
import { useForemanMissingItemRequestsParams } from "../hooks/useForemanMissingItemRequestsParams";
import type { ForemanMissingItemRequestsFiltersState } from "../utils/types";
import ForemanMissingItemRequestsFilters from "../components/foreman-missing-item-requests-filters";
import MissingItemRequestCard from "../components/missing-item-request-card";

export default function MissingItemRequestsTemplate({ showBackButton = false }: { showBackButton?: boolean }) {
	const { getParams, setParams } = useForemanMissingItemRequestsParams();
	const { id: notificationId, startDate, endDate, page, pageSize, ...filters } = getParams();
	const isSingleItemView = !!notificationId;

	const [keywordInput, setKeywordInput] = useState("");
	const debouncedKeyword = useDebounce(keywordInput, 400);

	const { data, isLoading } = useMyMissingItemRequests(
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
					startDate: startDate ? dateToUTCString(startDate) : undefined,
					endDate: endDate ? dateToUTCString(endDate) : undefined,
					searchValue: debouncedKeyword || undefined,
				}
	);

	const items = data?.items ?? [];
	const total = data?.total ?? 0;

	useEffect(() => {
		if (!notificationId || !items.length) return;
		const el = document.getElementById(`mir-${notificationId}`);
		if (el) {
			el.scrollIntoView({ behavior: "smooth", block: "center" });
		}
	}, [items, notificationId]);

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
			<SectionHeader title="Unknown Items" showBackButton={showBackButton} />

			<Input
				value={keywordInput}
				onChange={(event) => setKeywordInput(event.target.value)}
				placeholder="Search by job or phase"
				className="h-9 w-full bg-white text-sm sm:w-[280px]"
				icon={<Search className="h-4 w-4 text-brand-dark50" />}
				iconPosition="left"
			/>

			<ForemanMissingItemRequestsFilters
				filters={filters}
				onFilterChange={handleFilterChange}
				startDate={startDate}
				endDate={endDate}
				onDateRangeChange={handleDateRangeChange}
				showRequestedByFilter={false}
			/>

			{isLoading ? (
				<div className="flex justify-center py-10">
					<Spinner />
				</div>
			) : items.length === 0 ? (
				<p className="py-10 text-center text-sm text-brand-dark50">No missing item requests yet.</p>
			) : (
				<div className="space-y-3">
					{items.map((item) => (
						<MissingItemRequestCard key={item.id} item={item} highlighted={item.id === notificationId} />
					))}
				</div>
			)}

			{!isSingleItemView && total > 0 && (
				<DataTablePagination
					pageSize={pageSize}
					total={total}
					currentPage={page}
					setPageSize={(size: number) => setParams({ pageSize: size, page: 1 })}
					setPage={(nextPage: number) => setParams({ page: nextPage })}
				/>
			)}
		</div>
	);
}
