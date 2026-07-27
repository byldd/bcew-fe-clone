"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { UserCog } from "lucide-react";
import { Spinner } from "@/components/ui/spinner";
import { routes } from "@/config/routes";
import { MATERIAL_HISTORY_FILTER } from "../utils/enums";
import { MATERIAL_HISTORY_FILTER_OPTIONS } from "../utils/constants";
import { CollapsibleSection } from "./collapsible-section";
import { buildMaterialStatusTimeline } from "../utils/material-status";
import { useEmployeeMaterialStatus } from "../material-selection/hooks/useEmployeePullList";
import MaterialHistoryFilter from "./material-history-filter";
import MaterialHistoryTimelineItem from "./material-history-timeline-item";
import JobAdditionalMaterialList from "./job-additional-material-list";

export function JobMaterialsSection({ assignmentId }: { assignmentId?: string }) {
	const router = useRouter();
	const { data, isLoading } = useEmployeeMaterialStatus({ assignmentId });
	const [filters, setFilters] = useState<MATERIAL_HISTORY_FILTER[]>(
		MATERIAL_HISTORY_FILTER_OPTIONS.map((option) => option.value)
	);
	const timeline = useMemo(() => (data ? buildMaterialStatusTimeline(data) : []), [data]);

	const isAll = MATERIAL_HISTORY_FILTER_OPTIONS.every((option) => filters.includes(option.value));
	const visibleTimeline = isAll ? timeline : timeline.filter((entry) => filters.includes(entry.filterKey));
	const showAdditionalMaterial = isAll || filters.includes(MATERIAL_HISTORY_FILTER.ADDITIONAL_MATERIAL);
	const hasContent = visibleTimeline.length > 0 || showAdditionalMaterial;

	const handleOpenPullList = () => {
		if (!assignmentId) {
			return;
		}
		router.push(routes.employee.pullList(assignmentId));
	};

	return (
		<div className="rounded-[10px] border border-brand-dark10 bg-white px-4 py-3">
			<CollapsibleSection
				title="Materials"
				contentClassName="space-y-3"
				action={
					<button
						type="button"
						onClick={handleOpenPullList}
						disabled={!assignmentId}
						className="text-sm font-medium text-brand-dark underline underline-offset-2 disabled:opacity-50"
					>
						Open Pull List
					</button>
				}
			>
				<div className="flex items-center justify-between gap-2">
					<p className="text-sm font-medium text-brand-dark">History</p>
					<MaterialHistoryFilter selected={filters} onChange={setFilters} />
				</div>

				{isLoading ? (
					<div className="flex justify-center py-6">
						<Spinner />
					</div>
				) : hasContent ? (
					<div className="pt-1">
						{visibleTimeline.map((entry, index) => (
							<MaterialHistoryTimelineItem
								key={entry.filterKey}
								entry={entry}
								isLast={index === visibleTimeline.length - 1 && !showAdditionalMaterial}
							/>
						))}
						{showAdditionalMaterial && (
							<div>
								<div className="flex items-center gap-3">
									<span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue-100 text-blue-600">
										<UserCog className="h-4 w-4" />
									</span>
									<p className="text-sm font-semibold text-brand-dark">Additional Material</p>
								</div>
								<div className="mt-3 space-y-3 border-t border-brand-dark10 pt-3">
									<JobAdditionalMaterialList assignmentId={assignmentId} />
								</div>
							</div>
						)}
					</div>
				) : (
					<p className="py-6 text-center text-sm text-brand-dark50">No material status available.</p>
				)}
			</CollapsibleSection>
		</div>
	);
}
