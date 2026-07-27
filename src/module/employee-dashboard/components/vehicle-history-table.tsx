import React from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { IVehicleHistoryEntry } from "../types";
import { extractUTCDayAndTime, formatDateToMMDDYYYY } from "@/module/schedule-management/time-logs-management/utils";
import { useTypedTranslations } from "@/i18n/useTypedTranslations";
import { NAMESPACE } from "@/i18n/type";

const VehicleHistoryTable = ({ data }: { data: IVehicleHistoryEntry[] | undefined }) => {
	const tEmployee = useTypedTranslations(NAMESPACE.EMPLOYEE);
	return (
		<div className="overflow-x-hidden overflow-y-hidden rounded-lg border border-brand-dark10 bg-white">
			<Table>
				<TableHeader>
					<TableRow className="whitespace-nowrap border-b border-brand-dark10">
						<TableHead className="px-6 py-3 text-left text-sm font-semibold text-brand-dark50">
							{tEmployee.vehicleNo}
						</TableHead>
						<TableHead className="px-6 py-3 text-left text-sm font-semibold text-brand-dark50">
							{tEmployee.date}
						</TableHead>
						<TableHead className="px-6 py-3 text-left text-sm font-semibold text-brand-dark50">
							{tEmployee.start}
						</TableHead>
						<TableHead className="px-6 py-3 text-left text-sm font-semibold text-brand-dark50">
							{tEmployee.end}
						</TableHead>
						<TableHead className="px-6 py-3 text-start text-sm font-semibold text-brand-dark50">
							{tEmployee.miles}
						</TableHead>
					</TableRow>
				</TableHeader>
				<TableBody>
					{data &&
						data.map((entry, index) => (
							<TableRow key={index} className="space-y-4 last:border-b-0">
								<TableCell className="px-4 py-3 align-top">
									<div className="whitespace-nowrap font-medium text-brand-dark">{entry.Truck_Number}</div>
								</TableCell>
								<TableCell className="px-4 py-3">
									<div className="whitespace-nowrap text-sm text-brand-dark">
										{formatDateToMMDDYYYY(entry.assignedTime)}
									</div>
									<div className="mx-4 whitespace-nowrap text-xs text-brand-dark50">{tEmployee.today}</div>
								</TableCell>
								<TableCell className="px-4 py-3">
									<div className="whitespace-nowrap text-sm text-brand-dark">
										{extractUTCDayAndTime(entry.assignedTime)}
									</div>
									<div className="whitespace-nowrap text-xs text-brand-dark50">GPS 7:00am</div>
								</TableCell>
								<TableCell className="px-4 py-3">
									<div className="whitespace-nowrap text-sm text-brand-dark">
										{extractUTCDayAndTime(entry.assignedTime)}
									</div>
									<div className="whitespace-nowrap text-xs text-brand-dark50">GPS 7:00pm</div>
								</TableCell>
								<TableCell className="px-4 py-3">
									<div className="text-sm font-medium text-brand-dark">{entry.Odometer_Reading}</div>
								</TableCell>
							</TableRow>
						))}
				</TableBody>
			</Table>
		</div>
	);
};

export default VehicleHistoryTable;
