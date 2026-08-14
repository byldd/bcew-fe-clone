import { toFormattedDate } from "@/lib/utils/date";
import { DATE_FORMAT } from "@/types/date";
import { ReviewCard, ReviewRow } from "@/module/driving-safety/incident-reports/components/review-card";
import { INCIDENT_SEVERITY_META } from "@/module/driving-safety/incident-reports/utils/constants";
import { IViolationReportDetail } from "../types";
import JobSiteSafetyDocuments from "./job-site-safety-documents";

interface JobSiteSafetyViolationSummaryProps {
	violation: IViolationReportDetail;
}

const JobSiteSafetyViolationSummary = ({ violation }: JobSiteSafetyViolationSummaryProps) => (
	<>
		<ReviewCard title="Basic Information">
			<ReviewRow label="Employee Name" value={violation.user?.name ?? "--"} />
			<ReviewRow label="Jobsite" value={violation.jobSiteName ?? "--"} />
			<ReviewRow label="Date & Time" value={toFormattedDate(violation.violationDate, DATE_FORMAT.DATE_AND_TIME)} />
			<ReviewRow
				label="Severity"
				value={violation.severity ? INCIDENT_SEVERITY_META[violation.severity].label : "--"}
			/>
			<ReviewRow label="Location on Site" value={violation.locationOnSite ?? "--"} />
			<ReviewRow label="Description of Violation" value={violation.description} />
		</ReviewCard>

		<JobSiteSafetyDocuments photos={violation.photos} />
	</>
);

export default JobSiteSafetyViolationSummary;
