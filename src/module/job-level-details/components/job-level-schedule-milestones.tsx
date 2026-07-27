"use client";

import { useMemo, useState } from "react";
import { ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils/utils";
import { DataTable } from "@/components/shared/datatable/datatable";
import { SCHEDULE_PHASE_FILTERS } from "../constants";
import { getJobLevelScheduleMilestonesColumns } from "../utils/job-level-schedule-milestones-columns";
import { JobLevelScheduleMilestonesProps, SchedulePhaseFilterKey } from "../utils/types";

export default function JobLevelScheduleMilestones({
	rows,
	onOpenHistory,
	onOpenPhaseHistory,
}: JobLevelScheduleMilestonesProps) {
	const [activeFilter, setActiveFilter] = useState<SchedulePhaseFilterKey>("all");

	const visibleRows = useMemo(
		() => (activeFilter === "all" ? rows : rows.filter((row) => row.key === activeFilter)),
		[rows, activeFilter]
	);

	const columns = useMemo(() => getJobLevelScheduleMilestonesColumns(onOpenPhaseHistory), [onOpenPhaseHistory]);

	return (
		<div className="space-y-3">
			<div className="flex flex-wrap items-center justify-between gap-3">
				<div className="flex flex-wrap items-center gap-3">
					<h3 className="text-sm font-semibold text-brand-dark">Schedule Milestones &amp; Date History</h3>
					<div className="flex flex-wrap items-center gap-2">
						{SCHEDULE_PHASE_FILTERS.map((filter) => {
							const isActive = activeFilter === filter.key;
							return (
								<button
									key={filter.key}
									type="button"
									onClick={() => setActiveFilter(filter.key)}
									className={cn(
										"h-8 rounded-full px-3 text-xs font-medium transition-colors",
										isActive
											? "bg-black text-white"
											: "border border-brand-dark10 bg-white text-brand-dark hover:bg-gray-50"
									)}
								>
									{filter.label}
								</button>
							);
						})}
					</div>
				</div>
				<button
					type="button"
					onClick={onOpenHistory}
					className="flex items-center gap-1 whitespace-nowrap text-xs font-medium text-brand-dark hover:underline"
				>
					Full Schedule Edit History
					<ArrowRight className="h-3.5 w-3.5" />
				</button>
			</div>

			<DataTable columns={columns} data={visibleRows} useSectionHeader={false} compact showGridLines />
		</div>
	);
}
