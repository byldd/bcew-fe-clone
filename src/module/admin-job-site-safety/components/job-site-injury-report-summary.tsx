import { toFormattedDate } from "@/lib/utils/date";
import { DATE_FORMAT } from "@/types/date";
import { ReviewCard, ReviewRow } from "@/module/driving-safety/incident-reports/components/review-card";
import { REPORT_SOURCE, JOB_SITE_INJURY_MEDICAL_ACTION } from "@/module/employee-safety/enums";
import { IActiveEmployeeContact, IAdminJobSiteInjuryReportDetail } from "../types";
import { JOB_SITE_INJURY_MEDICAL_ACTION_LABEL, REPORT_SOURCE_LABEL } from "../utils/dashboard-constants";
import JobSiteSafetyDocuments from "./job-site-safety-documents";

interface JobSiteInjuryReportSummaryProps {
	report: IAdminJobSiteInjuryReportDetail;
	employee: IActiveEmployeeContact | null;

	cardClassName?: string;
}

const JobSiteInjuryReportSummary = ({ report, employee, cardClassName }: JobSiteInjuryReportSummaryProps) => (
	<>
		<ReviewCard title="Employee Information" className={cardClassName}>
			<ReviewRow label="Employee" value={employee?.name ?? "--"} />
			<ReviewRow label="Occupation" value={employee?.occupation ?? "--"} />
			<ReviewRow label="Phone Number" value={employee?.cellPhone ?? "--"} />
			<ReviewRow label="Source" value={REPORT_SOURCE_LABEL[report.source ?? REPORT_SOURCE.EMPLOYEE]} />
		</ReviewCard>

		<ReviewCard title="Incident Details" className={cardClassName}>
			<ReviewRow
				label="Date & Time of Injury"
				value={report.injuryDate ? toFormattedDate(report.injuryDate, DATE_FORMAT.DATE_AND_TIME) : "--"}
			/>
			<ReviewRow label="Where Did the Injury Occur (Job)" value={report.jobSiteName ?? "--"} />
			<ReviewRow label="How Did the Injury Occur" value={report.howInjuryOccurred ?? "--"} />
			<ReviewRow label="What Body Part Is Injured" value={report.bodyPartInjured ?? "--"} />
			<ReviewRow label="Did Equipment Malfunction" value={report.equipmentMalfunction ? "Yes" : "No"} />
			{report.equipmentMalfunction && (
				<ReviewRow label="Equipment Malfunction Details" value={report.equipmentMalfunctionExplain ?? "--"} />
			)}
		</ReviewCard>

		<ReviewCard title="Medical Details" className={cardClassName}>
			<ReviewRow
				label="Medical Action Required"
				value={
					JOB_SITE_INJURY_MEDICAL_ACTION_LABEL[report.medicalAction as JOB_SITE_INJURY_MEDICAL_ACTION] ??
					report.medicalAction
				}
			/>
			{report.medicalTreatmentLocation && (
				<ReviewRow label="Medical Treatment Location" value={report.medicalTreatmentLocation} />
			)}
			{report.treatmentStartDate && (
				<ReviewRow
					label="Dates of Treatment"
					value={`${toFormattedDate(report.treatmentStartDate, DATE_FORMAT.MM_SLASH_DD_YYYY)}${
						report.treatmentEndDate
							? ` – ${toFormattedDate(report.treatmentEndDate, DATE_FORMAT.MM_SLASH_DD_YYYY)}`
							: ""
					}`}
				/>
			)}
			{report.doctorsMedics && <ReviewRow label="Doctors / Medics" value={report.doctorsMedics} />}
			{report.drugScreenLocation && <ReviewRow label="Drug Screen Location" value={report.drugScreenLocation} />}
		</ReviewCard>

		<ReviewCard title="Recommendations" className={cardClassName}>
			<ReviewRow label="Immediate Action Taken" value={report.immediateAction ?? "--"} />
			<ReviewRow label="Permanent Solution" value={report.permanentSolution ?? "--"} />
		</ReviewCard>

		<JobSiteSafetyDocuments photos={report.photos} className={cardClassName} />
	</>
);

export default JobSiteInjuryReportSummary;
