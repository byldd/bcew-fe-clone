import { dateToUTCString } from "@/lib/utils/date";
import { ICreateViolationPayload } from "../types";
import { IViolationSchema } from "./violation-schema";

type FormImage = { keyFile: string; url: string };

const stripImages = (images?: FormImage[]) => (images ?? []).map(({ keyFile, url }) => ({ keyFile, url }));

// `time` is the datetime emitted by TimeInput (wall-clock stored in UTC components);
// take the day from `date` and the hour/minute from `time`, same as job-site-injury.
const combineDateTime = (date?: Date, time?: string): string | null => {
	if (!date) return null;
	const result = new Date(date);
	if (time) {
		const parsed = new Date(time);
		if (!Number.isNaN(parsed.getTime())) {
			result.setHours(parsed.getUTCHours(), parsed.getUTCMinutes(), 0, 0);
		}
	}
	return dateToUTCString(result);
};

export const buildViolationPayload = (data: IViolationSchema, employeeId: string): ICreateViolationPayload => ({
	employeeId,
	jobDailyRecordId: data.jobDailyRecordId || null,
	description: data.description ?? null,
	violationDate: combineDateTime(data.violationDate, data.violationTime),
	severity: data.severity || undefined,
	locationOnSite: data.locationOnSite ?? null,
	photos: stripImages(data.photos),
});
