import React from "react";
import { IEmployeeTravelPayRequestsResponse } from "../types";
import { toFormattedDate } from "@/lib/utils/date";
import { formatSnakeCase } from "@/lib/utils/value-formatter";
import { TRAVEL_PAY_REQUEST_STATUS } from "@/module/schedule-management/travel-pay/types";
import { cn } from "@/lib/utils/utils";
import { useModal } from "@/hooks/useModal";
import NotesHistoryModal from "./notes-history-modal";
import StatusHistoryModal from "./status-history-modal";
import { useTypedTranslations } from "@/i18n/useTypedTranslations";
import { NAMESPACE } from "@/i18n/type";

const ListCard = ({ travelPayRequest }: { travelPayRequest: IEmployeeTravelPayRequestsResponse[number] }) => {
	const currentStatus = travelPayRequest.traevlPayRequestStatuses[0]?.status;
	const { openModal, closeModal, Modal } = useModal();
	const tEmployee = useTypedTranslations(NAMESPACE.EMPLOYEE);

	const onViewNotes = () => {
		openModal({
			modalView: (
				<NotesHistoryModal
					notes={travelPayRequest.notes}
					onClose={closeModal}
					travelPayRequestId={travelPayRequest.id}
				/>
			),
			modalTitle: tEmployee.notesHistory,
		});
	};

	const onViewStatusHistory = () => {
		openModal({
			modalView: <StatusHistoryModal travelPayRequest={travelPayRequest} />,
			modalTitle: "Status History",
			// May be used in future
			// modalTitle: `Status History ${toFormattedDate(travelPayRequest.date)}`,
		});
	};
	const getStatusColor = (status?: string) => {
		switch (status) {
			case TRAVEL_PAY_REQUEST_STATUS.APPROVED:
				return "text-[#20C55F]";

			case TRAVEL_PAY_REQUEST_STATUS.PENDING:
				return "text-[#F59E0B]";

			case TRAVEL_PAY_REQUEST_STATUS.REJECTED:
				return "text-[#EF4448]";

			default:
				return "text-brand-grey";
		}
	};
	return (
		<div className="mt-3 rounded-[10px] border border-gray-200 bg-white p-4">
			<Modal />
			<div className="flex items-center justify-between text-sm">
				<p className="text-xs font-medium text-brand-dark">{toFormattedDate(travelPayRequest.date)}</p>
				<p className={cn("text-xs font-medium", getStatusColor(currentStatus))}>{formatSnakeCase(currentStatus)}</p>
			</div>
			<div className="mt-2 flex items-center justify-between text-sm">
				<div>
					<p className="text-xs text-brand-grey">
						{tEmployee.home} → {travelPayRequest.firstStop}
					</p>
					<p className="text-sm font-medium text-brand-dark">
						{travelPayRequest.firstStopDistance} {tEmployee.miles}
					</p>
				</div>
				<div>
					<p className="text-xs text-brand-grey">
						{travelPayRequest.lastStop} → {tEmployee.home}
					</p>
					<p className="text-sm font-medium text-brand-dark">
						{travelPayRequest.lastStopDistance} {tEmployee.miles}
					</p>
				</div>
			</div>

			{currentStatus === TRAVEL_PAY_REQUEST_STATUS.REJECTED && (
				<div className="mt-2 text-sm">
					<p className="text-xs text-brand-grey">{tEmployee.reasonForRejection}</p>
					<p className="text-sm font-medium text-brand-dark">{travelPayRequest.traevlPayRequestStatuses[0]?.note}</p>
				</div>
			)}
			<div className="mt-2 flex items-center justify-between text-sm">
				<p className="cursor-pointer text-brand-grey underline" onClick={onViewStatusHistory}>
					{tEmployee.viewStatusHistory}
				</p>
				<p className="cursor-pointer text-brand-grey underline" onClick={onViewNotes}>
					{tEmployee.viewNotesHistory}
				</p>
			</div>
		</div>
	);
};

export default ListCard;
