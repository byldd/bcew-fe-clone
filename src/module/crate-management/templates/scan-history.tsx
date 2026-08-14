"use client";

import { useEffect, useRef } from "react";
import BackButton from "@/components/common/back-button";
import { Button } from "@/components/ui/button";
import { DatePicker } from "@/components/ui/date-picker";
import { Spinner } from "@/components/ui/spinner";
import { toDate, toMidnightDateString } from "@/lib/utils/date";
import { cn } from "@/lib/utils/utils";
import RecentScansList from "../components/recent-scans-list";
import { CRATE_SCAN_ACTION } from "../enums";
import { useRecentCrateScansInfinite } from "../hooks/useCrateManagement";
import { SCAN_HISTORY_TAB_ALL, ScanHistoryTab, useScanHistoryParams } from "../hooks/useScanHistoryParams";

const SCAN_HISTORY_TAB_LABEL: Record<ScanHistoryTab, string> = {
	[SCAN_HISTORY_TAB_ALL]: "All",
	[CRATE_SCAN_ACTION.CRATE_SCANNED_TO_RECEIVE]: "Received",
	[CRATE_SCAN_ACTION.CRATE_SCANNED_TO_RETURN]: "Returned",
};

export default function ScanHistoryTemplate() {
	const observerTarget = useRef<HTMLDivElement>(null);
	const { getParams, setParams, clearDates } = useScanHistoryParams();
	const { tab, startDate, endDate } = getParams();

	const { data, isLoading, fetchNextPage, hasNextPage, isFetchingNextPage } = useRecentCrateScansInfinite({
		pageSize: 10,
		action: tab === SCAN_HISTORY_TAB_ALL ? undefined : tab,
		startDate,
		endDate,
	});

	const scans = data?.pages.flatMap((page) => page.items) ?? [];
	const counts = data?.pages[0]?.counts;

	const tabs: { tab: ScanHistoryTab; count: number }[] = [
		{ tab: SCAN_HISTORY_TAB_ALL, count: counts?.all ?? 0 },
		{ tab: CRATE_SCAN_ACTION.CRATE_SCANNED_TO_RECEIVE, count: counts?.received ?? 0 },
		{ tab: CRATE_SCAN_ACTION.CRATE_SCANNED_TO_RETURN, count: counts?.returned ?? 0 },
	];

	useEffect(() => {
		const currentTarget = observerTarget.current;
		if (!currentTarget) return;

		const observer = new IntersectionObserver(
			(entries) => {
				if (entries[0]?.isIntersecting && hasNextPage && !isFetchingNextPage) {
					fetchNextPage();
				}
			},
			{ threshold: 0.1 }
		);

		observer.observe(currentTarget);

		return () => {
			observer.unobserve(currentTarget);
		};
	}, [hasNextPage, isFetchingNextPage, fetchNextPage]);

	return (
		<div className="flex min-h-screen flex-col bg-brand-bgLightgrey">
			<div className="flex items-center justify-between gap-2 px-4 py-4">
				<div className="flex items-center gap-2">
					<BackButton />
					<h1 className="text-base font-semibold text-gray-900">Scan History</h1>
				</div>

				<DatePicker
					mode="range"
					className="h-8"
					iconClassName="h-4 w-4"
					onClear={clearDates}
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
					required={false}
				/>
			</div>

			<div className="px-4">
				<div className="no-scrollbar flex gap-2 overflow-x-auto">
					{tabs.map(({ tab: tabValue, count }) => (
						<Button
							key={tabValue}
							type="button"
							variant="ghost"
							onClick={() => setParams({ tab: tabValue })}
							className={cn(
								"h-9 shrink-0 rounded-full px-3 text-xs font-medium",
								tab === tabValue
									? "bg-gray-900 text-white hover:bg-gray-900 hover:text-white"
									: "bg-gray-100 text-gray-700"
							)}
						>
							{SCAN_HISTORY_TAB_LABEL[tabValue]} ({count})
						</Button>
					))}
				</div>
			</div>

			<div className="flex-1 px-4 pb-8 pt-2">
				{isLoading ? (
					<p className="py-6 text-center text-sm text-gray-400">Loading...</p>
				) : (
					<>
						<RecentScansList scans={scans} />
						{scans.length > 0 && (
							<div ref={observerTarget} className="h-10 w-full">
								{isFetchingNextPage && (
									<div className="flex items-center justify-center py-4">
										<Spinner />
									</div>
								)}
							</div>
						)}
					</>
				)}
			</div>
		</div>
	);
}
