import { VEHICLE_ACCIDENT_PHOTO_CATEGORY } from "@/module/employee-safety/enums";

import { IAccidentReviewDetail, IApproveAccidentReportPayload } from "../types";
import { IAccidentReviewSchema } from "./accident-review-schema";

type ReviewDocument = IAccidentReviewSchema["repairEstimate"][number];

const documentsForCategory = (
	report: IAccidentReviewDetail,
	category: VEHICLE_ACCIDENT_PHOTO_CATEGORY
): ReviewDocument[] =>
	report.photos.filter((photo) => photo.category === category).map(({ keyFile, url }) => ({ keyFile, url }));

export const buildAccidentReviewDefaults = (report: IAccidentReviewDetail): IAccidentReviewSchema => ({
	violationTypeId: report.violationTypeId ?? "",
	overrideReason: report.pointOverrideReason ?? "",
	repairEstimate: documentsForCategory(report, VEHICLE_ACCIDENT_PHOTO_CATEGORY.REPAIR_ESTIMATE),
	insuranceCorrespondence: documentsForCategory(report, VEHICLE_ACCIDENT_PHOTO_CATEGORY.INSURANCE_CORRESPONDENCE),
});

export const collectReviewDocuments = (values: IAccidentReviewSchema): ReviewDocument[] => [
	...values.repairEstimate,
	...values.insuranceCorrespondence,
];

export const buildApprovePayload = (values: IAccidentReviewSchema): IApproveAccidentReportPayload => ({
	violationTypeId: values.violationTypeId,
	overrideReason: values.overrideReason?.trim() || null,
	documents: [
		...values.repairEstimate.map(({ keyFile }) => ({
			category: VEHICLE_ACCIDENT_PHOTO_CATEGORY.REPAIR_ESTIMATE,
			keyFile,
		})),
		...values.insuranceCorrespondence.map(({ keyFile }) => ({
			category: VEHICLE_ACCIDENT_PHOTO_CATEGORY.INSURANCE_CORRESPONDENCE,
			keyFile,
		})),
	],
});
