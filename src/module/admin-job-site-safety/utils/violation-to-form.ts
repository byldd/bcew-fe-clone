import { IViolationReportDetail } from "../types";
import { IViolationSchema } from "./violation-schema";

export const mapViolationToForm = (violation: IViolationReportDetail): IViolationSchema => ({
	jobDailyRecordId: violation.jobDailyRecordId ?? "",
	description: violation.description ?? "",
	violationDate: violation.violationDate ? new Date(violation.violationDate) : undefined,
	violationTime: violation.violationDate ?? "",
	severity: violation.severity ?? "",
	locationOnSite: violation.locationOnSite ?? "",
	photos: violation.photos,
});
