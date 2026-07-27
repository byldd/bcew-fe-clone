import React from "react";
import { IEmployeeTravelPayRequestsResponse } from "../types";
import { toFormattedDate } from "@/lib/utils/date";
import { formatSnakeCase } from "@/lib/utils/value-formatter";
import { TRAVEL_PAY_REQUEST_STATUS } from "@/module/schedule-management/travel-pay/types";
import { cn } from "@/lib/utils/utils";
import { useTypedTranslations } from "@/i18n/useTypedTranslations";
import { NAMESPACE } from "@/i18n/type";

const StatusHistoryModal = ({ travelPayRequest }: { travelPayRequest: IEmployeeTravelPayRequestsResponse[number] }) => {
	const tEmployee = useTypedTranslations(NAMESPACE.EMPLOYEE);

	return (
		<div className="flex flex-col gap-6 space-y-2">
			{travelPayRequest.traevlPayRequestStatuses.map((status) => (
				<div key={status.id} className="space-y-1">
					<div className="space-y-1">
						<p className="text-xs font-normal text-brand-grey">{toFormattedDate(status.createdAt)}</p>
						<p
							className={cn(
								"text-xs",
								status.status === TRAVEL_PAY_REQUEST_STATUS.REJECTED
									? "text-brand-red"
									: status.status === TRAVEL_PAY_REQUEST_STATUS.PENDING
										? "text-orange-500"
										: "text-brand-greenAccent"
							)}
						>
							{formatSnakeCase(status.status)}
						</p>
					</div>
					{status.status === TRAVEL_PAY_REQUEST_STATUS.REJECTED && (
						<div className="space-y-1">
							<p className="text-xs font-normal text-brand-grey">{tEmployee.reasonForRejection}</p>
							<p className="text-sm font-medium text-brand-dark">{status.note ?? "N/A"}</p>
						</div>
					)}
					<p className="text-sm">
						<span className="text-sm font-medium">{tEmployee.addedBy}:</span>{" "}
						{status?.addedByUser?.name ?? tEmployee.system}
					</p>
				</div>
			))}
		</div>
	);
};

export default StatusHistoryModal;
