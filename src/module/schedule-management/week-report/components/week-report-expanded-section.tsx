import { TableCell, TableRow } from "@/components/ui/table";
import { IWeekReportEntry } from "../types";
import TimeLogsSectionTable from "./time-logs-section-table";
import AttendanceSectionTable from "./attendance-section-table";
import TimeVarianceSectionTable from "./time-variance-section-table";
import TimeRequestSectionTable from "./time-request-section-table";
import TravelPaySectionTable from "./travel-pay-section-table";
import { ReportSection } from "./table-components";

const WEEK_REPORT_COL_COUNT = 8;

const WeekReportExpandedSection = ({ entry }: { entry: IWeekReportEntry }) => {
	return (
		<TableRow className="hover:bg-transparent">
			<TableCell colSpan={WEEK_REPORT_COL_COUNT} className="bg-brand-bgLightgrey/40 p-4">
				<div className="flex flex-col gap-4">
					<ReportSection title="Time Logs" bare>
						<TimeLogsSectionTable timeLogs={entry.timeLogs} />
					</ReportSection>
					<ReportSection title="Attendance Records">
						<AttendanceSectionTable attendances={entry.attendances} />
					</ReportSection>
					<ReportSection title="Time Variance">
						<TimeVarianceSectionTable timeVariances={entry.timeVariances} />
					</ReportSection>
					<ReportSection title="Time Request">
						<TimeRequestSectionTable extendedTimes={entry.extendedTimes} newJobRequests={entry.newJobRequests} />
					</ReportSection>
					<ReportSection title="Travel Pay">
						<TravelPaySectionTable travelPayRequests={entry.travelPayRequests} />
					</ReportSection>
				</div>
			</TableCell>
		</TableRow>
	);
};

export default WeekReportExpandedSection;
