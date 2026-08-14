import { JOB_SITE_SAFETY_LIFECYCLE_EVENT, JOB_SITE_SAFETY_REPORT_TYPE } from "../enums";
import { ILifecycleEvent } from "../types";

const SUBMITTED_LABEL: Record<JOB_SITE_SAFETY_REPORT_TYPE, string> = {
	[JOB_SITE_SAFETY_REPORT_TYPE.JOB_SITE_INJURY]: "Injury Report Submitted",
	[JOB_SITE_SAFETY_REPORT_TYPE.JOB_SITE_SAFETY_VIOLATION]: "Violation Report Submitted",
};

// The role, not the person, is what the timeline names — the same wording the
// Figma uses ("{{Role}} edited the details").
const ACTOR_EVENT_LABEL: Record<Exclude<JOB_SITE_SAFETY_LIFECYCLE_EVENT, "REPORT_SUBMITTED">, string> = {
	[JOB_SITE_SAFETY_LIFECYCLE_EVENT.DETAILS_EDITED]: "edited the details",
	[JOB_SITE_SAFETY_LIFECYCLE_EVENT.SENT_FOR_PRESIDENT_REVIEW]: "sent it for President's Review",
	[JOB_SITE_SAFETY_LIFECYCLE_EVENT.APPROVED_FOR_INSURANCE]: "approved it for Insurance",
	[JOB_SITE_SAFETY_LIFECYCLE_EVENT.SENT_TO_INSURANCE]: "sent it to Insurance",
	[JOB_SITE_SAFETY_LIFECYCLE_EVENT.RESOLVED_INTERNALLY]: "resolved it internally",
	[JOB_SITE_SAFETY_LIFECYCLE_EVENT.RESOLVED]: "marked it Resolved",
};

const UNKNOWN_ROLE = "Admin";

export const resolveLifecycleTitle = (event: ILifecycleEvent, reportType: JOB_SITE_SAFETY_REPORT_TYPE): string => {
	if (event.type === JOB_SITE_SAFETY_LIFECYCLE_EVENT.REPORT_SUBMITTED) return SUBMITTED_LABEL[reportType];
	return `${event.actorRoleName ?? UNKNOWN_ROLE} ${ACTOR_EVENT_LABEL[event.type]}`;
};

// Milestones still ahead of the report, greyed out under the events so far. A
// report closed internally never reaches any of them.
const UPCOMING_MILESTONES: { label: string; reachedBy: JOB_SITE_SAFETY_LIFECYCLE_EVENT[] }[] = [
	{
		label: "President's review pending",
		reachedBy: [JOB_SITE_SAFETY_LIFECYCLE_EVENT.APPROVED_FOR_INSURANCE],
	},
	{ label: "Sent to insurance", reachedBy: [JOB_SITE_SAFETY_LIFECYCLE_EVENT.SENT_TO_INSURANCE] },
	{ label: "Resolved", reachedBy: [JOB_SITE_SAFETY_LIFECYCLE_EVENT.RESOLVED] },
];

export const resolvePendingMilestones = (events: ILifecycleEvent[]): string[] => {
	const seen = new Set(events.map((event) => event.type));
	if (seen.has(JOB_SITE_SAFETY_LIFECYCLE_EVENT.RESOLVED_INTERNALLY)) return [];

	return UPCOMING_MILESTONES.filter((milestone) => !milestone.reachedBy.some((eventType) => seen.has(eventType))).map(
		(milestone) => milestone.label
	);
};
