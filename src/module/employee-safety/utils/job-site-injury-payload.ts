import { dateToUTCString } from "@/lib/utils/date";
import { YES_NO } from "../enums";
import { IJobSiteInjuryImagePayload, ISaveJobSiteInjuryPayload } from "../types";
import { IJobSiteInjurySchema } from "./job-site-injury-schema";

type FormImage = { keyFile: string; url: string };

const toBool = (value?: string): boolean | undefined => (value === undefined ? undefined : value === YES_NO.YES);

const stripImages = (images?: FormImage[]): IJobSiteInjuryImagePayload[] =>
	(images ?? []).map(({ keyFile, url }) => ({ keyFile, url }));

// `time` is the datetime emitted by TimeInput (wall-clock stored in UTC components);
// take the day from `date` and the hour/minute from `time`.
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

const toISODate = (date?: Date): string | null => (date ? dateToUTCString(date) : null);

export const buildJobSiteInjuryPayload = (data: IJobSiteInjurySchema): ISaveJobSiteInjuryPayload => {
	return {
		injuryDate: combineDateTime(data.injuryDate, data.injuryTime),
		howInjuryOccurred: data.howInjuryOccurred ?? null,
		bodyPartInjured: data.bodyPartInjured ?? null,
		equipmentMalfunction: toBool(data.equipmentMalfunction) ?? false,
		equipmentMalfunctionExplain: data.equipmentMalfunctionExplain ?? null,

		jobDailyRecordId: data.jobDailyRecordId ?? null,

		medicalAction: data.medicalAction || undefined,
		medicalTreatmentLocation: data.medicalTreatmentLocation ?? null,
		isMedicalTreatmentLocationOther: data.isMedicalTreatmentLocationOther ?? false,
		treatmentStartDate: toISODate(data.treatmentStartDate),
		// A single-day treatment only sets treatmentStartDate; mirror it as the end date.
		treatmentEndDate: toISODate(data.treatmentEndDate ?? data.treatmentStartDate),
		doctorsMedics: data.doctorsMedics ?? null,
		drugScreenLocation: data.drugScreenLocation ?? null,

		immediateAction: data.immediateAction ?? null,
		permanentSolution: data.permanentSolution ?? null,

		isConfirmedAccurate: data.isConfirmedAccurate ?? false,

		photos: stripImages(data.photos),
	};
};
