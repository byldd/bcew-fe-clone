import { YES_NO } from "../enums";
import { IJobSiteInjuryReportDetail } from "../types";
import { IJobSiteInjurySchema } from "./job-site-injury-schema";

const toYesNo = (value: boolean): string => (value ? YES_NO.YES : YES_NO.NO);

// Reverse of buildJobSiteInjuryPayload — hydrates the form from a saved (draft) report.
export const mapJobSiteInjuryReportToForm = (report: IJobSiteInjuryReportDetail): IJobSiteInjurySchema => ({
	injuryDate: report.injuryDate ? new Date(report.injuryDate) : undefined,
	injuryTime: report.injuryDate ?? "",
	jobDailyRecordId: report.jobDailyRecordId ?? "",
	howInjuryOccurred: report.howInjuryOccurred ?? "",
	bodyPartInjured: report.bodyPartInjured ?? "",
	equipmentMalfunction: toYesNo(report.equipmentMalfunction),
	equipmentMalfunctionExplain: report.equipmentMalfunctionExplain ?? "",

	medicalAction: report.medicalAction,
	medicalTreatmentLocation: report.medicalTreatmentLocation ?? "",
	isMedicalTreatmentLocationOther: report.isMedicalTreatmentLocationOther,
	treatmentStartDate: report.treatmentStartDate ? new Date(report.treatmentStartDate) : undefined,
	treatmentEndDate: report.treatmentEndDate ? new Date(report.treatmentEndDate) : undefined,
	doctorsMedics: report.doctorsMedics ?? "",
	drugScreenLocation: report.drugScreenLocation ?? "",

	immediateAction: report.immediateAction ?? "",
	permanentSolution: report.permanentSolution ?? "",

	photos: report.photos,

	isConfirmedAccurate: report.isConfirmedAccurate,
});
