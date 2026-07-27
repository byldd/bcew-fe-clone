"use client";
import React, { useState } from "react";
import { TableBody, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Spinner } from "@/components/ui/spinner";
import { TableCell } from "@/components/ui/table";
import { IGetWeekendWorksResponse } from "../types/schedule-config";
import WeekendHistoryPrimaryRow from "./weekend-history-primary-row";
import WeekendHistoryExpandedSection from "./weekend-history-expanded-section";
import { useTypedTranslations } from "@/i18n/useTypedTranslations";
import { NAMESPACE } from "@/i18n/type";

type IWeekendWorkRow = IGetWeekendWorksResponse["data"][number];

interface WeekendHistoryCollapsibleTableProps {
	data: IWeekendWorkRow[];
	isLoading: boolean;
}

const COLUMN_COUNT = 7;

const WeekendHistoryCollapsibleTable: React.FC<WeekendHistoryCollapsibleTableProps> = ({ data, isLoading }) => {
	const [expandedRows, setExpandedRows] = useState<string[]>([]);
	const tSchedule = useTypedTranslations(NAMESPACE.SCHEDULE);
	const tPeople = useTypedTranslations(NAMESPACE.PEOPLE_MANAGEMENT);

	const handleToggleRow = (id: string) => {
		setExpandedRows((prev) => (prev.includes(id) ? prev.filter((r) => r !== id) : [...prev, id]));
	};

	return (
		<div className="overflow-x-auto rounded-3xl border bg-white">
			<table className="w-full min-w-[700px] caption-bottom border-collapse text-sm">
				<TableHeader className="h-[75px] bg-brand-bgLightgrey [&_tr]:border-accent/15">
					<TableRow className="hover:bg-transparent">
						<TableHead className="text-nowrap border-b border-r text-left text-sm font-semibold text-brand-dark50">
							{tSchedule.date}
						</TableHead>
						<TableHead className="text-nowrap border-b border-r text-center text-sm font-semibold text-brand-dark50">
							{tPeople.day}
						</TableHead>
						<TableHead className="text-nowrap border-b border-r text-center text-sm font-semibold text-brand-dark50">
							{tSchedule.scheduledBy}
						</TableHead>

						<TableHead className="text-nowrap border-b border-r text-center text-sm font-semibold text-brand-dark50">
							Members Required
						</TableHead>
						<TableHead
							colSpan={2}
							className="text-nowrap border-b border-r text-center text-sm font-semibold text-brand-dark50"
						>
							Request Sent
						</TableHead>
						<TableHead className="text-nowrap border-b text-center text-sm font-semibold text-brand-dark50">
							Action
						</TableHead>
					</TableRow>
				</TableHeader>

				<TableBody className="[&_tr]:border-accent/15">
					{isLoading ? (
						<TableRow>
							<TableCell colSpan={COLUMN_COUNT} className="py-20 text-center">
								<Spinner />
							</TableCell>
						</TableRow>
					) : data.length === 0 ? (
						<TableRow>
							<TableCell colSpan={COLUMN_COUNT} className="py-16 text-center text-sm text-brand-dark50">
								No weekend history found
							</TableCell>
						</TableRow>
					) : (
						data.map((row) => {
							const isExpanded = expandedRows.includes(row.id);
							return (
								<React.Fragment key={row.id}>
									<WeekendHistoryPrimaryRow
										row={row}
										isExpanded={isExpanded}
										onToggle={() => handleToggleRow(row.id)}
									/>
									{isExpanded && <WeekendHistoryExpandedSection row={row} colSpan={COLUMN_COUNT} />}
								</React.Fragment>
							);
						})
					)}
				</TableBody>
			</table>
		</div>
	);
};

export default WeekendHistoryCollapsibleTable;
