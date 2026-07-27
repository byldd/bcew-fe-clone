"use client";

import { Spinner } from "@/components/ui/spinner";
import { toLocalFormattedDate } from "@/lib/utils/date";
import { DATE_FORMAT } from "@/types/date";
import { ACCESS_LEVEL_TRANSITION_LABEL, MODULE_LABELS } from "../constants";
import { useEmployeePermissionChangeHistory } from "../hooks/useRolesAndPermissions";

interface PermissionChangeHistoryListProps {
	userId: string;
}

export default function PermissionChangeHistoryList({ userId }: PermissionChangeHistoryListProps) {
	const { data, isLoading } = useEmployeePermissionChangeHistory(userId);

	if (isLoading) {
		return (
			<div className="flex justify-center py-6">
				<Spinner />
			</div>
		);
	}

	return (
		<div className="space-y-2 py-3">
			<p className="text-sm font-medium text-brand-dark">Permission Change History</p>

			<div className="space-y-5">
				{!data?.length && <p className="text-sm text-brand-dark50">No permission changes yet.</p>}

				{data?.map((item) => (
					<div key={item.id} className="space-y-1">
						<p className="text-sm font-medium text-brand-dark">{MODULE_LABELS[item.module] ?? item.module}</p>

						<p className="text-xs text-brand-dark50">
							Updated by {item.changedBy} • {toLocalFormattedDate(item.changedAt, DATE_FORMAT.DATE_AND_TIME)}
						</p>

						<div className="flex gap-1 text-xs text-brand-dark50">
							<span>From:</span>
							<span className="font-medium text-brand-dark">{ACCESS_LEVEL_TRANSITION_LABEL[item.fromAccessLevel]}</span>
							<span>→</span>
							<span>To:</span>
							<span className="font-medium text-brand-dark">{ACCESS_LEVEL_TRANSITION_LABEL[item.toAccessLevel]}</span>
						</div>
					</div>
				))}
			</div>
		</div>
	);
}
