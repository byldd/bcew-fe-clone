import { ILegacyAccidentDetail, IRawLegacyAccidentDetail } from "../types";
import { LEGACY_ACCIDENT_STATUS_INCIDENT, LEGACY_ACCIDENT_STATUS_LABEL } from "./constants";
import { INCIDENT_REPORT_STATUS, LEGACY_ACCIDENT_STATUS } from "./enums";

const trimOrNull = (value: string | null): string | null => (value?.trim() ? value.trim() : null);

// The legacy report_status code (1–5) drives both the display label and the incident
// status used for filtering. Unknown/0 codes fall back to the initial "Active and Saved".
export const resolveLegacyStatus = (reportStatus: number | null): { status: INCIDENT_REPORT_STATUS; label: string } => {
	const code = (reportStatus ?? 0) as LEGACY_ACCIDENT_STATUS;
	return {
		status: LEGACY_ACCIDENT_STATUS_INCIDENT[code] ?? INCIDENT_REPORT_STATUS.PENDING,
		label: LEGACY_ACCIDENT_STATUS_LABEL[code] ?? LEGACY_ACCIDENT_STATUS_LABEL[LEGACY_ACCIDENT_STATUS.ACTIVE_AND_SAVED],
	};
};

export const mapLegacyAccidentDetail = (raw: IRawLegacyAccidentDetail): ILegacyAccidentDetail => {
	const { status, label } = resolveLegacyStatus(raw.report_status);
	return {
		id: raw.id.trim(),
		employeeName: trimOrNull(raw.emp_nme),
		employeeAddress: trimOrNull(raw.emp_add),
		employeePhone: trimOrNull(raw.emp_phn),
		employeeLicense: trimOrNull(raw.emp_lic),
		truckNumber: trimOrNull(raw.eqpmnt_recnum),
		vin: trimOrNull(raw.eqpmnt_vin),
		licensePlate: trimOrNull(raw.eqpmnt_lic),
		vehicleDamage: trimOrNull(raw.eqpmnt_dam),
		location: trimOrNull(raw.acc_loc),
		crossStreet: trimOrNull(raw.cross_st),
		accidentDate: raw.acc_dte,
		weather: trimOrNull(raw.weather),
		policeContacted: trimOrNull(raw.pol_cont),
		policeDepartment: trimOrNull(raw.pol_dept),
		policeReportNumber: trimOrNull(raw.pol_rep_num),
		witnessName: trimOrNull(raw.wit_nme),
		witnessAddress: trimOrNull(raw.wit_add),
		witnessPhone: trimOrNull(raw.wit_phn),
		drugScreen: trimOrNull(raw.drug_scr),
		medicalTreatment: trimOrNull(raw.med_treat),
		medicalTreatmentLocation: trimOrNull(raw.med_treat_loc),
		injuryReport: trimOrNull(raw.injury_report),
		vehicleTowed: raw.veh_tow,
		status,
		statusLabel: label,
		otherVehicles: raw.FM_OtherVehiclesTable.map((vehicle) => ({
			id: vehicle.ID.trim(),
			year: trimOrNull(vehicle.Year),
			makeModel: trimOrNull(vehicle.MakeModel),
			vin: trimOrNull(vehicle.VIN),
			damage: trimOrNull(vehicle.Damage),
			driverName: trimOrNull(vehicle.oth_drv_nme),
			driverLicense: trimOrNull(vehicle.oth_drv_lic),
			driverPhone: trimOrNull(vehicle.oth_drv_phn),
			insuranceCompany: trimOrNull(vehicle.oth_drv_ins_cmp),
			insuranceNumber: trimOrNull(vehicle.oth_drv_ins_num),
			vehicleTowed: vehicle.oth_veh_tow,
		})),
	};
};
