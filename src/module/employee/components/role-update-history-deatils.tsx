"use client";

import { Spinner } from "@/components/ui/spinner";
import { useGetRolePermissionHistory } from "../hooks/useRolesAndPermissions";
import { toLocalFormattedDate } from "@/lib/utils/date";
import { DATE_FORMAT } from "@/types/date";
import { formatValue } from "../utils";
import { rolePermissions } from "../constants";

const RoleUpdateHistoryDetails = ({ historyId, closeModal }: { historyId: string; closeModal: () => void }) => {
	const { data, isLoading } = useGetRolePermissionHistory(historyId);

	if (isLoading) {
		return (
			<div className="flex justify-center py-10">
				<Spinner />
			</div>
		);
	}

	if (!data) {
		return <div className="py-10 text-center text-muted-foreground">Unable to load history.</div>;
	}

	return (
		<div className="space-y-6">
			<div className="space-y-1">
				<h3 className="text-sm font-medium">{data?.role?.name}</h3>

				<p className="text-xs text-muted-foreground">
					Updated by <span className="text-xs font-semibold">{data?.updatedBy?.name}</span>
				</p>

				<p className="text-xs font-medium text-muted-foreground">
					{" "}
					{toLocalFormattedDate(data?.createdAt, DATE_FORMAT.DATE_AND_TIME)}
				</p>
			</div>

			{data.configurationChanges.length > 0 && (
				<div className="space-y-2">
					<h4 className="text-sm font-medium">Configuration Changes</h4>

					<div className="space-y-2">
						{data.configurationChanges.map((change) => {
							const displayName = rolePermissions[change.field as keyof typeof rolePermissions] ?? change.field;

							return (
								<div key={change.field} className="space-y-1">
									<div className="text-sm">{displayName}</div>

									<div className="text-xs font-medium text-muted-foreground">
										{formatValue(change.previousValue)}
										{" → "}
										{formatValue(change.newValue)}
									</div>
								</div>
							);
						})}
					</div>
				</div>
			)}

			<div className="space-y-2">
				<h4 className="text-sm font-medium">Permission Changes</h4>

				<div className="space-y-2">
					{data?.permissionChanges?.map((permission) => (
						<div key={permission.id} className="space-y-1">
							<p className="text-sm">{permission.page?.name}</p>

							<div className="flex gap-1 text-xs text-muted-foreground">
								<span>From:</span>
								<span className="font-semibold">{formatValue(permission.previousAccessLevel)}</span>

								<span>→</span>

								<span>To:</span>
								<span className="font-semibold">{formatValue(permission.newAccessLevel)}</span>
							</div>
						</div>
					))}
				</div>
			</div>

			<div className="space-y-2">
				<h4 className="text-sm font-medium">Affected Users ({data.affectedUsers?.length})</h4>

				<div className="max-h-56 space-y-2 overflow-y-auto">
					{data?.affectedUsers?.map((user) => (
						<div key={user.userId} className="rounded-[8px] border p-2 text-sm">
							{user.userName}
						</div>
					))}
				</div>
			</div>
		</div>
	);
};

export default RoleUpdateHistoryDetails;
