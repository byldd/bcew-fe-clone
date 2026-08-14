"use client";

import { Spinner } from "@/components/ui/spinner";
import { toLocalFormattedDate } from "@/lib/utils/date";
import { DATE_FORMAT } from "@/types/date";
import { ACCESS_LEVEL_TRANSITION_LABEL, userPermissions } from "../constants";
import { formatValue } from "../utils";
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

	const configurationChanges = data?.configurationChanges ?? [];
	const permissionChanges = data?.permissionChanges ?? [];

	if (!configurationChanges.length && !permissionChanges.length) {
		return <p className="py-3 text-sm text-brand-dark50">No permission changes yet.</p>;
	}

	return (
		<div className="space-y-4">
			<p className="pt-0 text-base font-medium text-brand-dark">Permission Changes</p>

			{configurationChanges.map((change) => {
				const displayName = userPermissions[change.field as keyof typeof userPermissions] ?? change.field;

				return (
					<div key={change.id} className="space-y-1">
						<p className="text-sm font-medium text-brand-dark">{displayName}</p>

						<p className="text-xs font-medium text-brand-dark50">
							{formatValue(change.previousValue)} → {formatValue(change.newValue)}
						</p>
					</div>
				);
			})}

			{permissionChanges.length > 0 && (
				<div className="space-y-3">
					{permissionChanges.map((item) => (
						<div key={item.id} className="space-y-1">
							<p className="text-sm font-medium text-brand-dark">{item.pageName}</p>

							<p className="text-xs font-medium text-brand-dark50">
								Updated by {item.changedBy} • {toLocalFormattedDate(item.changedAt, DATE_FORMAT.DATE_AND_TIME)}
							</p>

							<div className="flex gap-1 text-xs font-medium text-brand-dark50">
								<span>From:</span>
								<span className="font-medium text-brand-dark">
									{ACCESS_LEVEL_TRANSITION_LABEL[item.fromAccessLevel]}
								</span>
								<span>→</span>
								<span>To:</span>
								<span className="font-medium text-brand-dark">{ACCESS_LEVEL_TRANSITION_LABEL[item.toAccessLevel]}</span>
							</div>
						</div>
					))}
				</div>
			)}
		</div>
	);
}
