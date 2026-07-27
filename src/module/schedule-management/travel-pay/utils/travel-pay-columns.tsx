import { ColumnDef, Row } from "@tanstack/react-table";
import { ITravelPayRequestsResponse } from "../types";
import { addDays } from "date-fns";
import { isSameDate, toDate, toFormattedDate } from "@/lib/utils/date";
import { useModal } from "@/hooks/useModal";
import EditTravelPayModal from "../components/edit-travel-pay-modal";
import { createColumnHelper } from "@tanstack/react-table";
import { cn } from "@/lib/utils/utils";
import { TRAVEL_PAY_REQUEST_STATUS } from "../types";
import { TRAVEL_PAY_STATUS } from "../utils/travel-pay-status";
import { useTypedTranslations } from "@/i18n/useTypedTranslations";
import { NAMESPACE } from "@/i18n/type";
import EmployeeColumnHeader from "../components/employee-column-header";

const columnHelper = createColumnHelper<{
	userName: string;
	travelPays: ITravelPayRequestsResponse;
}>();

export const gettravelPayColumns = ({ weekStart, weekEnd }: { weekStart: Date; weekEnd: Date }) => {
	const dates = [];

	let i = weekStart;
	while (dates.length <= 7 && i <= weekEnd) {
		dates.push(i);
		i = addDays(i, 1);
	}
	const getDayName = (date: Date) => date.toLocaleDateString("en-US", { weekday: "short" });

	const travelPayColumns: ColumnDef<{ userName: string; travelPays: ITravelPayRequestsResponse }>[] = [
		{
			id: "employee_name",
			header: ({}) => <EmployeeColumnHeader />,
			cell: ({ row }) => {
				return <span className="font-inter text-sm font-medium text-brand-dark">{row.original.userName}</span>;
			},
		},

		...dates.map((columnDate) =>
			columnHelper.display({
				id: columnDate.toISOString(),

				header: () => (
					<div className="flex flex-col items-center text-sm font-semibold leading-tight text-brand-dark50">
						<span>{getDayName(columnDate)}</span>
						<span>{toFormattedDate(columnDate)}</span>
					</div>
				),

				cell: ({ row }: { row: Row<{ userName: string; travelPays: ITravelPayRequestsResponse }> }) => {
					const travelPayRequest = row?.original?.travelPays?.find((travelPay) =>
						isSameDate(travelPay?.date, columnDate)
					);

					if (!travelPayRequest) {
						return "--";
					}
					return <TravelPayCell travelPayRequest={travelPayRequest} />;
				},
			})
		),

		{
			header: "Total Approved",
			cell: ({ row }) => {
				const totalApprovedRequest = row.original?.travelPays?.filter(
					(travelPay) =>
						travelPay.traevlPayRequestStatuses?.sort(
							(a, b) => toDate(b.createdAt).getTime() - toDate(a.createdAt).getTime()
						)?.[0]?.status === TRAVEL_PAY_REQUEST_STATUS.APPROVED
				);

				return <span className="font-inter text-sm font-medium text-brand-dark">{totalApprovedRequest?.length}</span>;
			},
		},
	];

	return travelPayColumns;
};

const TravelPayCell = ({ travelPayRequest }: { travelPayRequest: ITravelPayRequestsResponse[number] }) => {
	const { openModal, Modal, closeModal } = useModal();
	const tTravelPay = useTypedTranslations(NAMESPACE.TRAVEL_PAY);

	const onClickRow = () => {
		openModal({
			modalView: <EditTravelPayModal id={travelPayRequest?.id} onClose={closeModal} />,
			// modalTitle: `Travel Pay Request ${travelPayRequest?.user?.name} - ${toFormattedDate(travelPayRequest?.date)}`, // may be used later
			modalTitle: tTravelPay.viewEntry,
			variant: "medium",
		});
	};

	const totalStatusCount = travelPayRequest?.traevlPayRequestStatuses?.length;

	const currentStatus = travelPayRequest?.traevlPayRequestStatuses?.[0]?.status as TRAVEL_PAY_REQUEST_STATUS;

	const initialStatus = travelPayRequest?.traevlPayRequestStatuses?.[totalStatusCount - 1];

	const statusUI = TRAVEL_PAY_STATUS[currentStatus];
	const initialStatusUI = TRAVEL_PAY_STATUS[initialStatus?.status as TRAVEL_PAY_REQUEST_STATUS];

	return (
		<div
			id={`${travelPayRequest?.id}`}
			onClick={(e) => {
				e.stopPropagation();
				onClickRow();
			}}
			className="mx-auto flex max-w-[170px] cursor-pointer flex-col items-center gap-1 text-center text-xs"
		>
			<Modal />
			<p className="text-xs font-medium text-brand-dark50">Home → {travelPayRequest?.firstStop}</p>
			<p className="text-xs font-medium text-brand-dark">{travelPayRequest?.firstStopDistance} mi</p>
			<p className="text-xs font-medium text-brand-dark50">{travelPayRequest?.lastStop} → Home</p>
			<p className="text-xs font-medium text-brand-dark">{travelPayRequest?.lastStopDistance} mi</p>

			{statusUI && (
				<p className={cn("text-xs font-medium", statusUI.className)}>
					{totalStatusCount > 1 && (
						<span className={cn("text-xs font-medium", initialStatusUI?.className)}>{initialStatusUI?.label} → </span>
					)}
					{statusUI.label}
				</p>
			)}
		</div>
	);
};
