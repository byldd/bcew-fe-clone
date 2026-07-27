import { ColumnDef } from "@tanstack/react-table";
import { IGetPayRollWeeksResponse } from "../types/payroll";
import { toFormattedDate } from "@/lib/utils/date";
import { useModal } from "@/hooks/useModal";
import PayrollLogsTable from "../components/payroll-logs-table";

export const getPayrollWeekColumns = (): ColumnDef<IGetPayRollWeeksResponse[number]>[] => {
	return [
		{
			header: "Week",
			cell: ({ row }) => {
				const { weekStartDate, weekEndDate } = row.original;
				return `${toFormattedDate(weekStartDate)} - ${toFormattedDate(weekEndDate)}`;
			},
		},
		{
			header: "Pay Roll Logs",
			cell: ({ row }) => {
				return <LogCell payRollWeek={row.original} />;
			},
		},
	];
};

const LogCell = ({ payRollWeek }: { payRollWeek: IGetPayRollWeeksResponse[number] }) => {
	const { payrollLogs } = payRollWeek;
	const total = payrollLogs?.length || 0;

	const { openModal, Modal } = useModal();

	const onSeeAll = () => {
		openModal({
			modalView: (
				<PayrollLogsTable
					filters={{
						payrollWeekId: payRollWeek?.id,
					}}
				/>
			),
			modalTitle: "Pay Roll Logs",
			variant: "big",
		});
	};

	return (
		<div className="flex flex-col items-center justify-center">
			<Modal />
			<p>{total}</p>
			{total > 0 && (
				<p className="cursor-pointer text-primary underline" onClick={onSeeAll}>
					See All
				</p>
			)}
		</div>
	);
};
