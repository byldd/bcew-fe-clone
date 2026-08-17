import { toFormattedDate } from "@/lib/utils/date";
import { DATE_FORMAT } from "@/types/date";
import { IActiveEmployeeContact, IAdminJobSiteInjuryReportDetail, IViolationReportDetail } from "../types";
import {
	JOB_SITE_INJURY_REPORT_PREFIX,
	JOB_SITE_SAFETY_VIOLATION_REPORT_PREFIX,
	formatJobSiteSafetyReportNumber,
} from "./dashboard-constants";

// Starting point for the claim email — the Fleet Manager can edit any of this
// before sending, apart from the report itself. The backend rebuilds the same
// defaults, so an untouched field sends the same text either way.
const INSURANCE_EMAIL_FROM = "safety-claims@bcelectric.works";
const INSURANCE_EMAIL_TO = "claims-intake@liberty-industrial.com";

const INSURANCE_EMAIL_CLOSING = `Please acknowledge receipt of this report by replying to this thread.
Regards,
 Safety & Risk Management`;

export const EMPTY_EMAIL_DRAFT = {
	from: "",
	to: "",
	cc: "",
	subject: "",
	intro: "",
	closing: "",
};

export const buildInjuryEmailDraft = (
	report: IAdminJobSiteInjuryReportDetail,
	employee: IActiveEmployeeContact | null
) => {
	const reference = formatJobSiteSafetyReportNumber(JOB_SITE_INJURY_REPORT_PREFIX, report.reportId, report.createdAt);
	const injuryDate = report.injuryDate ? toFormattedDate(report.injuryDate, DATE_FORMAT.MM_SLASH_DD_YYYY) : "--";

	return {
		from: INSURANCE_EMAIL_FROM,
		to: INSURANCE_EMAIL_TO,
		cc: "",
		subject: ` Injury Claim — ${reference} — ${employee?.name ?? "--"} — ${injuryDate}`,
		intro: `To the Claims Department,
Please find Bucks County Electric Works' report for the workplace injury referenced above. All supporting documents and photographs are attached.`,
		closing: INSURANCE_EMAIL_CLOSING,
	};
};

export const buildViolationEmailDraft = (violation: IViolationReportDetail) => {
	const reference = formatJobSiteSafetyReportNumber(
		JOB_SITE_SAFETY_VIOLATION_REPORT_PREFIX,
		violation.reportId,
		violation.createdAt
	);
	const violationDate = violation.violationDate
		? toFormattedDate(violation.violationDate, DATE_FORMAT.MM_SLASH_DD_YYYY)
		: "--";

	return {
		from: INSURANCE_EMAIL_FROM,
		to: INSURANCE_EMAIL_TO,
		cc: "",
		subject: ` Safety Violation — ${reference} — ${violation.user?.name ?? "--"} — ${violationDate}`,
		intro: `To the Claims Department,
Please find Bucks County Electric Works' report for the job site safety violation referenced above. All supporting documents and photographs are attached.`,
		closing: INSURANCE_EMAIL_CLOSING,
	};
};
