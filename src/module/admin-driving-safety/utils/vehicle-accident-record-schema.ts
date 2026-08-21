import { z } from "zod";
import { getImageSchema } from "@/module/schedule-management/weekly-schedule-management/utils/mark-not-ready-form";
import { ALLOWED_DOCUMENT_FILE_TYPES } from "@/utils/constants";
import { INVALID_LAT_LNG_MESSAGE, isValidLatLng } from "@/lib/utils/coordinates";

const propertyDamageSchema = z.object({
	anotherCompanyProperty: z.string().optional(),
	companyName: z.string().optional(),
	contactPersonName: z.string().optional(),
	contactPhoneNumber: z.string().optional(),
	otherInformation: z.string().optional(),
	builderProperty: z.string().optional(),
	homeownerProperty: z.string().optional(),
});

export const vehicleAccidentRecordSchema = z.object({
	employeeId: z.string().optional(),
	truckNumber: z.string().optional(),

	onJobSite: z.string().optional(),
	jobSiteType: z.string().optional(),
	anotherVehicleInvolved: z.string().optional(),
	numberOfVehicles: z.string().optional(),
	personStruck: z.string().optional(),

	accidentDate: z.date().optional(),
	accidentTime: z.string().optional(),
	location: z
		.string()
		.optional()
		.refine((value) => !value || value.trim() === "" || isValidLatLng(value), {
			message: INVALID_LAT_LNG_MESSAGE,
		}),
	nearestCrossStreet: z.string().optional(),
	speedLimit: z.coerce.number().optional(),
	weather: z.string().optional(),

	propertyDamage: propertyDamageSchema.optional(),

	policeContacted: z.string().optional(),
	policeDepartment: z.string().optional(),
	policeReportNumber: z.string().optional(),

	bcewVehicleTowed: z.string().optional(),
	towProviderName: z.string().optional(),
	towCostOnSpot: z.coerce.number().optional(),
	otherVehicleTowed: z.string().optional(),
	otherVehicleTowCost: z.coerce.number().optional(),
	vehicleImpounded: z.string().optional(),
	impoundLotCost: z.coerce.number().optional(),
	impoundReleaseCharges: z.coerce.number().optional(),

	drugScreenNeeded: z.string().optional(),
	medicalCareNeeded: z.string().optional(),
	medicalTreatmentLocation: z.string().optional(),
	medicalTreatmentLocationOther: z.string().optional(),

	violationTypeId: z.string().optional(),

	insuranceCorrespondence: z.array(getImageSchema(ALLOWED_DOCUMENT_FILE_TYPES)).optional(),
});

export type IVehicleAccidentRecordSchema = z.infer<typeof vehicleAccidentRecordSchema>;
