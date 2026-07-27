"use client";

import { Spinner } from "@/components/ui/spinner";
import { toLocalFormattedDate } from "@/lib/utils/date";
import { DATE_FORMAT } from "@/types/date";
import { useEmployeeRoleChangeHistory } from "../hooks/useRolesAndPermissions";

interface RoleChangeHistoryListProps {
	userId: string;
	currentRole?: string;
}

export default function RoleChangeHistoryList({ userId, currentRole }: RoleChangeHistoryListProps) {
	const { data, isLoading } = useEmployeeRoleChangeHistory(userId);

	if (isLoading) {
		return (
			<div className="flex justify-center py-6">
				<Spinner />
			</div>
		);
	}

	const latestChange = data?.[0];

	return (
		<div className="space-y-4">
			{currentRole && (
				<div className="space-y-1">
					<p className="text-sm font-medium text-brand-dark50">Current Role</p>
					<p className="text-xs font-semibold text-brand-dark">{currentRole}</p>

					{latestChange && (
						<div className="space-y-1">
							<p className="text-xs text-brand-dark50">Previous Role: {latestChange.fromRole}</p>
							<p className="text-xs text-brand-dark50">
								Updated by {latestChange.changedBy} •{" "}
								{toLocalFormattedDate(latestChange.changedAt, DATE_FORMAT.DATE_AND_TIME)}
							</p>
						</div>
					)}
				</div>
			)}

			<div className="space-y-2 border-t border-brand-dark10 pt-3">
				<p className="text-sm font-semibold text-brand-dark">Role Change History</p>

				<div className="space-y-5">
					{!data?.length && <p className="text-sm text-brand-dark50">No role changes yet.</p>}

					{data?.map((item) => (
						<div key={item.id} className="space-y-1">
							<div className="flex gap-1 text-xs text-brand-dark50">
								<span>From:</span>
								<span className="font-medium text-brand-dark80">{item.fromRole}</span>
								<span>→</span>
								<span>To:</span>
								<span className="font-medium text-brand-dark80">{item.toRole}</span>
							</div>

							<p className="text-xs text-brand-dark50">
								Updated by {item.changedBy} • {toLocalFormattedDate(item.changedAt, DATE_FORMAT.DATE_AND_TIME)}
							</p>
						</div>
					))}
				</div>
			</div>
		</div>
	);
}
