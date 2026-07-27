"use client";

import { Spinner } from "@/components/ui/spinner";
import { useGetUserPermissionHistory } from "../hooks/useRolesAndPermissions";
import { toLocalFormattedDate } from "@/lib/utils/date";
import { DATE_FORMAT } from "@/types/date";
import { formatValue } from "../utils";
import { userPermissions } from "../constants";

const UserPageUpdateHistoryDetails = ({ historyId, closeModal }: { historyId: string; closeModal: () => void }) => {
	const { data, isLoading } = useGetUserPermissionHistory(historyId);

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
		<div className="space-y-4">
			<div className="space-y-1">
				<h3 className="text-sm font-medium">{data?.user?.name}</h3>

				<p className="text-xs text-muted-foreground">
					Updated by <span className="font-semibold">{data?.updatedBy?.name}</span>
				</p>

				<p className="text-xs font-medium text-muted-foreground">
					{toLocalFormattedDate(data?.createdAt, DATE_FORMAT.DATE_AND_TIME)}
				</p>
			</div>

			{data.configurationChanges.map((change) => {
				const displayName = userPermissions[change.field as keyof typeof userPermissions] ?? change.field;

				return (
					<div key={change.field} className="space-y-1">
						<div className="font-sm font-medium">{displayName}</div>

						<div className="text-xs font-medium text-muted-foreground">
							{formatValue(change.previousValue)}
							{" → "}
							{formatValue(change.newValue)}
						</div>
					</div>
				);
			})}

			{data.permissionChanges && data.permissionChanges.length > 0 && (
				<div className="space-y-2">
					<h4 className="text-sm font-medium">Permission Changes</h4>

					<div className="space-y-2">
						{data.permissionChanges.map((permission) => (
							<div key={permission.pageId} className="space-y-1">
								<p className="text-sm font-medium">{permission.page?.name}</p>

								<p className="text-xs font-medium text-muted-foreground">
									From: {formatValue(permission.previousAccessLevel)}
									{"  →  "}
									To: {formatValue(permission.newAccessLevel)}
								</p>
							</div>
						))}
					</div>
				</div>
			)}
		</div>
	);
};

export default UserPageUpdateHistoryDetails;
