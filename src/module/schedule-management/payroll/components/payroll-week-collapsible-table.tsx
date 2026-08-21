"use client";
import React, { useMemo, useState } from "react";
import { TableBody, TableHead, TableHeader, TableRow, TableCell } from "@/components/ui/table";
import { Spinner } from "@/components/ui/spinner";
import { Button } from "@/components/ui/button";
import { ChevronDown, ChevronUp } from "lucide-react";
import { useGetPayrollWeeks, useAcknowledgePayrollChange } from "../hooks/usePayrollLogs";
import { usePayRollParams } from "../hooks/usePayrollParams";
import { IGetPayRollWeeksResponse } from "../types/payroll";
import { toFormattedDate, dateToUTCString, toLocalFormattedDate } from "@/lib/utils/date";
import { useModal } from "@/hooks/useModal";
import PayrollLogsTable from "./payroll-logs-table";
import { useQueryClient } from "@tanstack/react-query";
import { openErrorToast, openSuccessToast } from "@/components/toast";
import { DATE_FORMAT } from "@/types/date";
import { IoMdArrowDropdown, IoMdArrowDropup } from "react-icons/io";
import { cn } from "@/lib/utils/utils";
import { SORT_ORDER } from "@/types";
import WriteAccessWrapper from "@/module/admin/components/write-access-wrapper";

type PayRollWeek = IGetPayRollWeeksResponse[number];
type PayRollChange = NonNullable<PayRollWeek["payRollChanges"]>[number];

const PARENT_COL_COUNT = 3;

export default function PayrollWeekCollapsibleTable() {
	const { getParams } = usePayRollParams();
	const { startDate, endDate } = getParams();
	const { data: weeks, isLoading } = useGetPayrollWeeks({ startDate, endDate });
	const [expandedRows, setExpandedRows] = useState<string[]>([]);

	const handleToggleRow = (id: string) => {
		setExpandedRows((prev) => (prev.includes(id) ? prev.filter((r) => r !== id) : [...prev, id]));
	};

	return (
		<div className="overflow-x-auto rounded-3xl border bg-white">
			<table className="w-full min-w-[600px] caption-bottom border-collapse text-sm">
				<TableHeader className="h-[75px] bg-brand-bgLightgrey [&_tr]:border-accent/15">
					<TableRow className="hover:bg-transparent">
						<TableHead className="text-nowrap border-b border-r text-left text-sm font-semibold text-brand-dark50">
							Week
						</TableHead>
						<TableHead className="text-nowrap border-b border-r text-center text-sm font-semibold text-brand-dark50">
							Pay Roll Logs
						</TableHead>
						<TableHead className="text-nowrap border-b text-center text-sm font-semibold text-brand-dark50">
							Changes After Payroll
						</TableHead>
					</TableRow>
				</TableHeader>

				<TableBody className="[&_tr]:border-accent/15">
					{isLoading ? (
						<TableRow>
							<TableCell colSpan={PARENT_COL_COUNT} className="py-20 text-center">
								<Spinner />
							</TableCell>
						</TableRow>
					) : !weeks || weeks.length === 0 ? (
						<TableRow>
							<TableCell colSpan={PARENT_COL_COUNT} className="py-16 text-center text-sm text-brand-dark50">
								No payroll weeks found
							</TableCell>
						</TableRow>
					) : (
						weeks.map((week) => {
							const isExpanded = expandedRows.includes(week.id);
							return (
								<React.Fragment key={week.id}>
									<PayrollWeekPrimaryRow
										week={week}
										isExpanded={isExpanded}
										onToggle={() => handleToggleRow(week.id)}
									/>
									{isExpanded && <PayrollChangesExpandedSection changes={week.payRollChanges ?? []} />}
								</React.Fragment>
							);
						})
					)}
				</TableBody>
			</table>
		</div>
	);
}

const PayrollWeekPrimaryRow = ({
	week,
	isExpanded,
	onToggle,
}: {
	week: PayRollWeek;
	isExpanded: boolean;
	onToggle: () => void;
}) => {
	const { weekStartDate, weekEndDate, payrollLogs, payRollChanges } = week;
	const totalLogs = payrollLogs?.length ?? 0;
	const totalChanges = payRollChanges?.length ?? 0;

	const { openModal, Modal } = useModal();

	const onSeeAllLogs = (e: React.MouseEvent) => {
		e.stopPropagation();
		openModal({
			modalView: <PayrollLogsTable filters={{ payrollWeekId: week.id }} />,
			modalTitle: "Pay Roll Logs",
			variant: "big",
		});
	};

	return (
		<TableRow
			className={`h-16 cursor-pointer transition-colors ${isExpanded ? "bg-white" : "hover:bg-gray-50"}`}
			onClick={onToggle}
		>
			<Modal />

			{/* Week */}
			<TableCell className="text-nowrap border-b border-r text-left text-sm font-medium text-brand-dark">
				{toFormattedDate(weekStartDate)} - {toFormattedDate(weekEndDate)}
			</TableCell>

			{/* Pay Roll Logs */}
			<TableCell
				className="border-b border-r text-center text-sm font-medium text-brand-dark"
				onClick={(e) => e.stopPropagation()}
			>
				<div className="flex flex-col items-center justify-center">
					<p>{totalLogs}</p>
					{totalLogs > 0 && (
						<p className="cursor-pointer text-primary underline" onClick={onSeeAllLogs}>
							See All
						</p>
					)}
				</div>
			</TableCell>

			{/* Changes After Payroll */}
			<TableCell className="border-b text-center text-sm font-medium text-brand-dark">
				<div className="flex items-center justify-center gap-2">
					<span>{totalChanges}</span>
					{totalChanges > 0 && (
						<Button
							variant="ghost"
							size="sm"
							type="button"
							aria-label={isExpanded ? "Collapse changes" : "Expand changes"}
							onClick={(e) => {
								e.stopPropagation();
								onToggle();
							}}
						>
							{isExpanded ? (
								<ChevronUp className="h-5 w-5 text-brand-dark" />
							) : (
								<ChevronDown className="h-5 w-5 text-brand-dark" />
							)}
						</Button>
					)}
				</div>
			</TableCell>
		</TableRow>
	);
};

const PayrollChangesExpandedSection = ({ changes }: { changes: PayRollChange[] }) => {
	const [sortAcknowledge, setSortAcknowledge] = useState<SORT_ORDER | null>(SORT_ORDER.ASC);
	const [sortRelease, setSortRelease] = useState<SORT_ORDER | null>(SORT_ORDER.ASC);

	const sortedChanges = useMemo(() => {
		return changes.sort((a, b) => {
			const aIsAck = !!a.acknowledgedAt;
			const bIsAck = !!b.acknowledgedAt;

			const aIsReleased = !!a.isDeleted;
			const bIsReleased = !!b.isDeleted;

			if (aIsAck) {
				if (!bIsAck) {
					return sortAcknowledge === SORT_ORDER.ASC ? 1 : -1;
				} else if (!aIsReleased && bIsReleased) {
					return sortRelease === SORT_ORDER.ASC ? -1 : 1;
				} else if (aIsReleased && !bIsReleased) {
					return sortRelease === SORT_ORDER.ASC ? 1 : -1;
				}
			}
			if (!aIsAck && bIsAck) {
				return sortAcknowledge === SORT_ORDER.ASC ? -1 : 1;
			}
			return 0;
		});
	}, [changes, sortAcknowledge, sortRelease]);

	return (
		<TableRow className="hover:bg-transparent">
			<TableCell colSpan={3} className="p-0">
				<div className="overflow-x-auto">
					<table className="w-full min-w-max border-collapse text-sm">
						<thead className="sticky top-0 z-10">
							<tr className="h-10 border-t border-gray-200 bg-brand-bgLightgrey">
								<th className="text-nowrap border-b border-r px-4 text-left text-sm font-semibold text-brand-dark50">
									Description
								</th>
								<th className="text-nowrap border-b border-r px-4 text-center text-sm font-semibold text-brand-dark50">
									Affected User
								</th>
								<th className="text-nowrap border-b border-r px-4 text-center text-sm font-semibold text-brand-dark50">
									Changed By
								</th>
								<th className="text-nowrap border-b border-r px-4 text-center text-sm font-semibold text-brand-dark50">
									Changed At
								</th>
								<th className="text-nowrap border-b border-r px-4 text-center text-sm font-semibold text-brand-dark50">
									Acknowledged By
								</th>
								<th className="text-nowrap border-b border-r px-4 text-center text-sm font-semibold text-brand-dark50">
									Acknowledged At
								</th>
								<WriteAccessWrapper>
									<th className="text-nowrap border-b border-r px-4 text-center text-sm font-semibold text-brand-dark50">
										<div className="flex items-center justify-center gap-2">
											<p>Actions</p>
											<div className="flex flex-col gap-0">
												<IoMdArrowDropup
													onClick={() => setSortAcknowledge(SORT_ORDER.ASC)}
													className={cn(
														"h-4 w-4 cursor-pointer",
														sortAcknowledge === SORT_ORDER.ASC ? "text-brand-dark" : "text-gray-400"
													)}
												/>
												<IoMdArrowDropdown
													onClick={() => setSortAcknowledge(SORT_ORDER.DESC)}
													className={cn(
														"h-4 w-4 cursor-pointer",
														sortAcknowledge === SORT_ORDER.DESC ? "text-brand-dark" : "text-gray-400"
													)}
												/>
											</div>
										</div>
									</th>
								</WriteAccessWrapper>

								<th className="text-nowrap border-b border-r px-4 text-center text-sm font-semibold text-brand-dark50">
									<div className="flex items-center justify-center gap-2">
										Payroll Reprocessed
										<div className="flex flex-col gap-0">
											<IoMdArrowDropup
												onClick={() => setSortRelease(SORT_ORDER.ASC)}
												className={cn(
													"h-4 w-4 cursor-pointer",
													sortRelease === SORT_ORDER.ASC ? "text-brand-dark" : "text-gray-400"
												)}
											/>
											<IoMdArrowDropdown
												onClick={() => setSortRelease(SORT_ORDER.DESC)}
												className={cn(
													"h-4 w-4 cursor-pointer",
													sortRelease === SORT_ORDER.DESC ? "text-brand-dark" : "text-gray-400"
												)}
											/>
										</div>
									</div>
								</th>
							</tr>
						</thead>
						<tbody>
							{sortedChanges.length === 0 ? (
								<tr className="bg-gray-50">
									<td colSpan={8} className="py-4 text-center text-sm text-brand-dark50">
										No changes found
									</td>
								</tr>
							) : (
								sortedChanges.map((change) => <PayrollChangeRow key={change.id} change={change} />)
							)}
						</tbody>
					</table>
				</div>
			</TableCell>
		</TableRow>
	);
};

const PayrollChangeRow = ({ change }: { change: PayRollChange }) => {
	const {
		id,
		description,
		affectedUser,
		changedByUser,
		changedAt,
		acknowledgedUser,
		acknowledgedAt,
		isAcknowledged,
		isDeleted,
	} = change;
	const { mutate, isPending } = useAcknowledgePayrollChange();
	const queryClient = useQueryClient();

	const onAcknowledge = (e: React.MouseEvent) => {
		e.stopPropagation();
		mutate(
			{ acknowledgedAt: dateToUTCString(new Date()), changeId: id, isAcknowledged: true },
			{
				onSuccess: () => {
					void queryClient.invalidateQueries({ queryKey: ["payroll-weeks"] });
					void queryClient.invalidateQueries({ queryKey: ["payroll-changes"] });
					openSuccessToast("Changes Acknowledged Successfully");
				},
				onError: (error) => {
					openErrorToast({ error });
				},
			}
		);
	};

	return (
		<tr className="bg-gray-50 hover:bg-gray-100">
			<td className="w-[30%] border-b border-r px-4 py-2 text-left text-sm text-brand-dark">{description}</td>
			<td className="text-nowrap border-b border-r px-4 py-2 text-center text-sm text-brand-dark">
				{affectedUser?.name ?? "-"}
			</td>
			<td className="text-nowrap border-b border-r px-4 py-2 text-center text-sm text-brand-dark">
				{changedByUser?.name ?? "System"}
			</td>
			<td className="text-nowrap border-b border-r px-4 py-2 text-center text-sm text-brand-dark">
				{toLocalFormattedDate(changedAt, DATE_FORMAT.DATE_AND_TIME)}
			</td>
			<td className="text-nowrap border-b border-r px-4 py-2 text-center text-sm text-brand-dark">
				{acknowledgedUser?.name ?? "-"}
			</td>
			<td className="text-nowrap border-b border-r px-4 py-2 text-center text-sm text-brand-dark">
				{acknowledgedAt ? toLocalFormattedDate(acknowledgedAt, DATE_FORMAT.DATE_AND_TIME) : "-"}
			</td>
			{
				<WriteAccessWrapper>
					<td className="text-nowrap border-b border-r px-4 py-2 text-center text-sm text-brand-dark">
						<Button size={"sm"} disabled={isPending || isAcknowledged} variant="filled" onClick={onAcknowledge}>
							{isAcknowledged ? "Acknowledged" : "Acknowledge"}
						</Button>
					</td>
				</WriteAccessWrapper>
			}
			<td className="text-nowrap border-b border-r px-4 py-2 text-center text-sm text-brand-dark">
				<span>
					{isAcknowledged ? (
						isAcknowledged && isDeleted ? (
							<span className="text-green-500">Yes</span>
						) : (
							<span className="text-red-500">No</span>
						)
					) : (
						"-"
					)}
				</span>
			</td>
		</tr>
	);
};
