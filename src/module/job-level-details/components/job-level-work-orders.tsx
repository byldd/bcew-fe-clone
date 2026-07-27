import { toFormattedDate } from "@/lib/utils/date";
import { DATE_FORMAT } from "@/types/date";
import { JobLevelCommsWorkOrder } from "../utils/types";
import { ImageGrid } from "./job-level-details-shared";
import { flattenNotes, flattenRecordImages, getDateRange } from "../utils";

export default function JobLevelDetailsWorkOrders({
	workOrders,
	onOpenImagePreview,
}: {
	workOrders: JobLevelCommsWorkOrder[];
	onOpenImagePreview: (url: string) => void;
}) {
	if (workOrders.length === 0) {
		return null;
	}

	return (
		<div className="rounded-[14px] border-none bg-white p-4 shadow-md">
			<h3 className="mb-3 text-base font-semibold text-brand-dark">Work Orders</h3>
			<div className="space-y-3">
				{workOrders.map((wo) => {
					const woImages = flattenRecordImages(wo.jobDailyRecords);
					const woNotes = flattenNotes(wo.jobDailyRecords);
					const woDates = getDateRange(wo.jobDailyRecords);
					return (
						<div key={wo.id} className="rounded-[12px] border-none bg-white p-3 shadow-sm">
							<div className="flex flex-wrap items-center justify-between gap-3">
								<div className="space-y-2">
									<p className="text-sm font-semibold text-brand-dark">{wo.ordnum}</p>
									<p className="text-xs text-brand-dark50">{wo.typnme || "Work order"}</p>
								</div>
								<div className="text-xs text-brand-dark50">
									{wo.completeDate ? toFormattedDate(wo.completeDate, DATE_FORMAT.MM_SLASH_DD_YYYY) : woDates.end}
								</div>
							</div>
							<div className="grid gap-4 lg:grid-cols-2">
								<div className="mt-3">
									<ImageGrid images={woImages} onOpen={onOpenImagePreview} />
								</div>
								<div>
									{woNotes.length === 0 ? (
										<p className="text-xs text-brand-dark50">No notes.</p>
									) : (
										<div className="space-y-2">
											{woNotes.slice(0, 2).map((note) => (
												<div key={note.id} className="rounded-[10px] border p-2">
													<p className="text-xs font-medium text-brand-dark">{note.user?.name || "Unknown"}</p>
													<p className="text-xs text-brand-dark50">{note.reason}</p>
												</div>
											))}
										</div>
									)}
								</div>
							</div>
						</div>
					);
				})}
			</div>
		</div>
	);
}
