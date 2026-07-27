"use client";
import React from "react";
import { TableCell, TableRow } from "@/components/ui/table";
import { IGetWeekendWorksResponse } from "../types/schedule-config";
import WeekendHistoryUserRow from "./weekend-history-user-row";
import { useTypedTranslations } from "@/i18n/useTypedTranslations";
import { NAMESPACE } from "@/i18n/type";

type IWeekendWorkRow = IGetWeekendWorksResponse["data"][number];

interface WeekendHistoryExpandedSectionProps {
	row: IWeekendWorkRow;
	colSpan: number;
}

const WeekendHistoryExpandedSection: React.FC<WeekendHistoryExpandedSectionProps> = ({ row, colSpan }) => {
	const tSchedule = useTypedTranslations(NAMESPACE.SCHEDULE);
	const tPeople = useTypedTranslations(NAMESPACE.PEOPLE_MANAGEMENT);
	const userWorks = row.userWeekendWorks ?? [];

	return (
		<>
			{/* Sub-header row */}
			<TableRow className="h-[60px] border-t border-gray-200 bg-brand-bgLightgrey hover:bg-gray-50">
				<TableCell className="border-b border-r text-left text-sm font-semibold text-brand-dark50">
					Member Name
				</TableCell>
				<TableCell className="border-b border-r text-center text-sm font-semibold text-brand-dark50">
					{tPeople.day}
				</TableCell>
				<TableCell className="text-nowrap border-b border-r text-center text-sm font-semibold text-brand-dark50">
					{tSchedule.scheduledBy}
				</TableCell>
				<TableCell className="border-b border-r text-center text-sm font-semibold text-brand-dark50">
					{tSchedule.workingMode}
				</TableCell>
				<TableCell className="border-b border-r text-center text-sm font-semibold text-brand-dark50">
					Technician Status
				</TableCell>
				<TableCell className="border-b border-r text-center text-sm font-semibold text-brand-dark50">
					Admin Status
				</TableCell>
				<TableCell className="border-b text-center text-sm font-semibold text-brand-dark50">Action</TableCell>
			</TableRow>
			{/* User rows */}
			{userWorks.length === 0 ? (
				<TableRow className="bg-gray-50 hover:bg-gray-50">
					<TableCell colSpan={colSpan} className="py-4 text-center text-sm text-brand-dark50">
						No members assigned
					</TableCell>
				</TableRow>
			) : (
				userWorks.map((userWork) => <WeekendHistoryUserRow key={userWork.id} userWork={userWork} parentWork={row} />)
			)}
		</>
	);
};

export default WeekendHistoryExpandedSection;
