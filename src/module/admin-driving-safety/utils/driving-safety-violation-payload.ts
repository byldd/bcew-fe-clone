import { dateToUTCString } from "@/lib/utils/date";
import { ICreateDrivingSafetyViolationPayload } from "../types";
import { IDrivingSafetyViolationSchema } from "./driving-safety-violation-schema";

type FormImage = { keyFile: string; url: string };

const stripDocuments = (documents?: FormImage[]) => (documents ?? []).map(({ keyFile, url }) => ({ keyFile, url }));

// `time` is the datetime emitted by TimeInput (wall-clock stored in UTC components);
// take the day from `date` and the hour/minute from `time`, same as job-site-safety-violation.
const combineDateTime = (date: Date, time?: string): string => {
	const result = new Date(date);
	if (time) {
		const parsed = new Date(time);
		if (!Number.isNaN(parsed.getTime())) {
			result.setHours(parsed.getUTCHours(), parsed.getUTCMinutes(), 0, 0);
		}
	}
	return dateToUTCString(result);
};

export const buildDrivingSafetyViolationPayload = (
	data: IDrivingSafetyViolationSchema,
	employeeId: string
): ICreateDrivingSafetyViolationPayload => ({
	employeeId,
	truckNumber: data.truckNumber!,
	violationTypeId: data.violationTypeId!,
	severity: data.severity || undefined,
	violationDate: combineDateTime(data.violationDate!, data.violationTime),
	description: data.description!,
	documents: stripDocuments(data.documents),
});
