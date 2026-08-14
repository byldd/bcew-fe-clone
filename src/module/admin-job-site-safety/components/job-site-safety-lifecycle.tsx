import { toLocalFormattedDate } from "@/lib/utils/date";
import { DATE_FORMAT } from "@/types/date";
import { ReviewCard } from "@/module/driving-safety/incident-reports/components/review-card";
import { JOB_SITE_SAFETY_REPORT_TYPE } from "../enums";
import { ILifecycleChange, ILifecycleEvent } from "../types";
import { resolveLifecycleTitle, resolvePendingMilestones } from "../utils/lifecycle-constants";

const EMPTY_VALUE = "N/A";

const ChangeRow = ({ change }: { change: ILifecycleChange }) => (
	<li className="flex gap-1.5 text-xs leading-relaxed text-brand-dark50">
		<span className="mt-1.5 size-1 shrink-0 rounded-full bg-brand-dark50" />
		<span>
			{change.label} changed From {change.fromValue || EMPTY_VALUE} to {change.toValue || EMPTY_VALUE}
		</span>
	</li>
);

const JobSiteSafetyLifecycle = ({
	events,
	reportType,
}: {
	events: ILifecycleEvent[];
	reportType: JOB_SITE_SAFETY_REPORT_TYPE;
}) => (
	<ReviewCard title="Lifecycle" className="flex h-full min-h-0 flex-col">
		<div className="min-h-0 flex-1 overflow-y-auto pr-1">
			<ol className="mt-3 space-y-5">
				{events.map((event) => (
					<li key={event.id} className="relative pl-5">
						<span className="absolute left-0 top-1.5 size-2 rounded-full bg-green-500" />
						<p className="text-[13px] font-medium text-brand-dark">{resolveLifecycleTitle(event, reportType)}</p>
						<p className="mt-0.5 text-xs text-brand-dark50">
							{toLocalFormattedDate(event.createdAt, DATE_FORMAT.DATE_AND_TIME)}
							{event.actorUser?.name ? ` | Employee : ${event.actorUser.name}` : ""}
						</p>
						{event.changes.length > 0 && (
							<ul className="mt-2 space-y-1.5">
								{event.changes.map((change) => (
									<ChangeRow key={`${event.id}-${change.label}`} change={change} />
								))}
							</ul>
						)}
					</li>
				))}

				{resolvePendingMilestones(events).map((milestone) => (
					<li key={milestone} className="relative pl-5">
						<span className="absolute left-0 top-1.5 size-2 rounded-full bg-brand-dark10" />
						<p className="text-[13px] font-medium text-brand-dark50">{milestone}</p>
						<p className="mt-0.5 text-xs text-brand-dark50">pending</p>
					</li>
				))}
			</ol>
		</div>
	</ReviewCard>
);

export default JobSiteSafetyLifecycle;
