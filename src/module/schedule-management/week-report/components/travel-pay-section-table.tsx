import { ITravelPayRequestsResponse, TRAVEL_PAY_REQUEST_STATUS } from "@/module/schedule-management/travel-pay/types";
import { TRAVEL_PAY_STATUS } from "@/module/schedule-management/travel-pay/utils/travel-pay-status";
import { toFormattedDate, toDate } from "@/lib/utils/date";
import { DATE_FORMAT } from "@/types/date";
import { cn } from "@/lib/utils/utils";
import { SectionTableHead, SectionTableCell } from "./table-components";

const TravelPaySectionTable = ({ travelPayRequests }: { travelPayRequests: ITravelPayRequestsResponse }) => {
	if (travelPayRequests.length === 0) {
		return <p className="px-1 py-2 text-xs text-brand-dark50">No travel pay requests</p>;
	}

	const totalApproved = travelPayRequests.filter((request) => {
		const sortedStatuses = [...request.traevlPayRequestStatuses].sort(
			(a, b) => toDate(b.createdAt).getTime() - toDate(a.createdAt).getTime()
		);
		return sortedStatuses[0]?.status === TRAVEL_PAY_REQUEST_STATUS.APPROVED;
	}).length;

	return (
		<>
			<table className="w-full min-w-max border-collapse">
				<thead>
					<tr className="bg-brand-bgLightgrey">
						<SectionTableHead>Date</SectionTableHead>
						<SectionTableHead>Route</SectionTableHead>
						<SectionTableHead>Status</SectionTableHead>
					</tr>
				</thead>
				<tbody>
					{travelPayRequests.map((request) => {
						const sortedStatuses = [...request.traevlPayRequestStatuses].sort(
							(a, b) => toDate(b.createdAt).getTime() - toDate(a.createdAt).getTime()
						);
						const currentStatus = sortedStatuses[0]?.status as TRAVEL_PAY_REQUEST_STATUS;
						const initialStatus = sortedStatuses[sortedStatuses.length - 1]?.status as TRAVEL_PAY_REQUEST_STATUS;
						const statusUI = TRAVEL_PAY_STATUS[currentStatus];
						const initialStatusUI = TRAVEL_PAY_STATUS[initialStatus];

						return (
							<tr key={request.id}>
								<SectionTableCell>{toFormattedDate(request.date, DATE_FORMAT.MM_SLASH_DD_YYYY)}</SectionTableCell>
								<SectionTableCell>
									<span className="block">
										Home → {request.firstStop} <span className="text-brand-dark50">{request.firstStopDistance} mi</span>
									</span>
									<span className="block">
										{request.lastStop} → Home <span className="text-brand-dark50">{request.lastStopDistance} mi</span>
									</span>
								</SectionTableCell>
								<SectionTableCell>
									{statusUI && (
										<span className={cn("font-medium", statusUI.className)}>
											{sortedStatuses.length > 1 && (
												<span className={cn("font-medium", initialStatusUI?.className)}>
													{initialStatusUI?.label} →{" "}
												</span>
											)}
											{statusUI.label}
										</span>
									)}
								</SectionTableCell>
							</tr>
						);
					})}
				</tbody>
			</table>
			<p className="px-1 pt-2 text-xs font-semibold text-brand-dark50">
				Total Approved: {totalApproved} of {travelPayRequests.length}
			</p>
		</>
	);
};

export default TravelPaySectionTable;
