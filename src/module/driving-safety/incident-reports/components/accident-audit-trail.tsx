"use client";

import { Spinner } from "@/components/ui/spinner";
import { toLocalFormattedDate } from "@/lib/utils/date";
import { DATE_FORMAT } from "@/types/date";

import { useAccidentHistory } from "../hooks/useAccidentReport";
import { IAccidentAuditEntry, IAuditFieldChange } from "../types";
import {
	ACCIDENT_ADMIN_FIELD_CHANGE_LABEL,
	ACCIDENT_TECHNICIAN_FIELD_CHANGE_LABEL,
	INCIDENT_ACTOR_ROLE_LABEL,
	INCIDENT_AUDIT_ACTION_LABEL,
	INCIDENT_PENDING_LIFECYCLE,
} from "../utils/constants";
import {
	ACCIDENT_ADMIN_FIELD,
	ACCIDENT_TECHNICIAN_FIELD,
	INCIDENT_AUDIT_ACTION,
	INCIDENT_REPORT_STATUS,
} from "../utils/enums";
import { ReviewCard } from "./review-card";

const auditTitle = (entry: IAccidentAuditEntry): string =>
	`${INCIDENT_ACTOR_ROLE_LABEL[entry.role]} ${INCIDENT_AUDIT_ACTION_LABEL[entry.action]}`;

const changeLabel = (fieldName: string): string =>
	ACCIDENT_ADMIN_FIELD_CHANGE_LABEL[fieldName as ACCIDENT_ADMIN_FIELD] ??
	ACCIDENT_TECHNICIAN_FIELD_CHANGE_LABEL[fieldName as ACCIDENT_TECHNICIAN_FIELD] ??
	fieldName;

const TimelineDot = ({ done }: { done: boolean }) => (
	<span
		className={`absolute -left-[25px] top-1 h-2.5 w-2.5 rounded-full ring-4 ring-white ${
			done ? "bg-green-500" : "bg-brand-dark30"
		}`}
	/>
);

const ChangeList = ({ changes }: { changes: IAuditFieldChange[] }) => (
	<ul className="mt-1 space-y-1">
		{changes.map((change) => (
			<li key={change.fieldName} className="flex gap-2 text-xs text-brand-dark60">
				<span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-brand-dark30" />
				<span>
					{changeLabel(change.fieldName)} changed From {change.fromValue} to{" "}
					<span className="font-semibold text-brand-dark">{change.toValue}</span>
				</span>
			</li>
		))}
	</ul>
);

const AuditEntryRow = ({ entry }: { entry: IAccidentAuditEntry }) => {
	const isViolationChange =
		entry.action === INCIDENT_AUDIT_ACTION.VIOLATION_UPDATED && !!entry.fromValue && !!entry.toValue;

	return (
		<li className="relative mt-4 space-y-1">
			<TimelineDot done />
			<p className="text-sm font-semibold text-brand-dark">{auditTitle(entry)}</p>
			<p className="text-xs text-brand-dark50">
				{toLocalFormattedDate(entry.createdAt, DATE_FORMAT.DATE_AND_TIME)}
				{entry.actorName ? ` | Employee : ${entry.actorName}` : ""}
			</p>
			{isViolationChange && (
				<p className="mt-0.5 text-xs text-brand-dark60">
					{entry.fromValue} to <span className="font-semibold text-brand-dark">{entry.toValue}</span>
				</p>
			)}
			{entry.changes && entry.changes.length > 0 && <ChangeList changes={entry.changes} />}
		</li>
	);
};

const PendingRow = ({ label }: { label: string }) => (
	<li className="relative mt-4 space-y-1">
		<TimelineDot done={false} />
		<p className="text-sm font-semibold text-brand-dark50">{label}</p>
		<p className="text-xs text-brand-dark30">pending</p>
	</li>
);

const AccidentAuditTrail = ({ reportId, status }: { reportId: string; status: INCIDENT_REPORT_STATUS }) => {
	const { data: entries, isLoading } = useAccidentHistory(reportId);
	const pendingSteps = INCIDENT_PENDING_LIFECYCLE[status] ?? [];

	return (
		<ReviewCard title="Audit Trail & Lifecycle" className="flex h-full min-h-0 flex-col">
			{isLoading ? (
				<div className="flex h-20 items-center justify-center">
					<Spinner />
				</div>
			) : entries?.length ? (
				<div className="min-h-0 flex-1 overflow-y-auto pr-1">
					<ol className="relative ml-1 border-l border-brand-dark10 pl-5">
						{entries.map((entry) => (
							<AuditEntryRow key={entry.id} entry={entry} />
						))}
						{pendingSteps.map((label) => (
							<PendingRow key={label} label={label} />
						))}
					</ol>
				</div>
			) : (
				<p className="text-sm text-brand-dark50">No history yet.</p>
			)}
		</ReviewCard>
	);
};

export default AccidentAuditTrail;
