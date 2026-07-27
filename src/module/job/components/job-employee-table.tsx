import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { toFormattedDate } from "@/lib/utils/date";
import { IJobEmployeeTableProps } from "@/module/schedule-management/weekly-schedule-management/types/schedule-interface";
import { DATE_FORMAT } from "@/types/date";
import { JobWorkType } from "../utils/enums";
import { useTypedTranslations } from "@/i18n/useTypedTranslations";
import { NAMESPACE } from "@/i18n/type";

export function JobEmployeeTable({ jobEmployeeAssignments, handleYouTag, handleTaskLeader }: IJobEmployeeTableProps) {
	const tEmployee = useTypedTranslations(NAMESPACE.EMPLOYEE);

	const getDisplayTime = ({
		didNotWorked,
		overrideTime,
		baseTime,
	}: {
		didNotWorked?: boolean | null | undefined;
		overrideTime?: string | null | undefined;
		baseTime?: string | null | undefined;
	}) => {
		if (didNotWorked) return JobWorkType.DID_NOT_WORKED;

		if (overrideTime) {
			return toFormattedDate(overrideTime, DATE_FORMAT.HH_MM_AA_PM);
		}

		if (baseTime) {
			return toFormattedDate(baseTime, DATE_FORMAT.HH_MM_AA_PM);
		}

		return "--";
	};

	const getGpsTime = (time?: Date | null) => {
		return time ? toFormattedDate(time, DATE_FORMAT.HH_MM_AA_PM) : "--";
	};

	return (
		<Table className="table-fixed overflow-hidden rounded-[10px] border border-brand-dark10 bg-brand-dark10">
			<TableHeader>
				<TableRow className="border-b-1 !bg-white font-inter text-brand-dark50">
					<TableHead className="w-1/4 px-2 py-4 text-center text-xs !font-semibold">{tEmployee.member}</TableHead>
					<TableHead className="w-1/4 py-4 text-center text-xs !font-semibold">{tEmployee.stopNo}</TableHead>
					<TableHead className="w-1/4 px-2 py-4 text-center text-xs !font-semibold">{tEmployee.start}</TableHead>
					<TableHead className="w-1/4 px-2 py-4 text-center text-xs !font-semibold">{tEmployee.end}</TableHead>
				</TableRow>
			</TableHeader>
			<TableBody>
				{jobEmployeeAssignments &&
					jobEmployeeAssignments.map((jobEmployee, index) => (
						<TableRow key={index} className="border-b-0 bg-white text-xs font-medium">
							<TableCell className="px-2 py-4 text-center">
								<span className="font-medium">{jobEmployee.employee?.user?.name}</span>
								<div className="flex items-center justify-center gap-1">
									{handleYouTag(jobEmployee?.employee?.id) && (
										<span className="font-inter text-xs font-medium text-brand-dark50">(You)</span>
									)}
									{handleTaskLeader(jobEmployee?.employee?.id) && (
										<span className="font-inter text-xs font-medium text-brand-dark50">(TL)</span>
									)}
								</div>
							</TableCell>
							<TableCell className="px-2 py-4 text-center">{jobEmployee.stopNumber ?? "--"}</TableCell>
							<TableCell className="px-2 py-4 text-center">
								<div>
									<span className="block">
										{getDisplayTime({
											didNotWorked: jobEmployee?.didNotWorked,
											overrideTime: jobEmployee?.overrideStartTime,
											baseTime: jobEmployee?.startTime,
										})}
									</span>

									{jobEmployee?.employee?.user?.role?.trackTimeByGPS && (
										<span className="block font-inter text-[8px] font-medium text-brand-dark50">
											GPS: {getGpsTime(jobEmployee?.employee?.gpsLogData?.activeFrom)}
										</span>
									)}
								</div>
							</TableCell>
							<TableCell className="py-4 text-center">
								<div>
									<span className="block">
										{getDisplayTime({
											didNotWorked: jobEmployee?.didNotWorked,
											overrideTime: jobEmployee?.overrideEndTime,
											baseTime: jobEmployee?.endTime,
										})}
									</span>

									{jobEmployee?.employee?.user?.role?.trackTimeByGPS && (
										<span className="block font-inter text-[8px] font-medium text-brand-dark50">
											GPS: {getGpsTime(jobEmployee?.employee?.gpsLogData?.activeTo)}
										</span>
									)}
								</div>
							</TableCell>
						</TableRow>
					))}
			</TableBody>
		</Table>
	);
}
