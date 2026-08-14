import { YES_NO } from "../enums";

type QuickAnswers = {
	onJobSite?: string;
	anotherVehicleInvolved?: string;
	personStruck?: string;
};

export type AccidentSectionVisibility = {
	truckInfo: boolean;
	employeeInfo: boolean;
	otherVehicle: boolean;
	personInvolved: boolean;
	police: boolean;
	followUp: boolean;
	insuranceDocs: boolean;
};

export const getAccidentSectionVisibility = (answers: QuickAnswers): AccidentSectionVisibility => {
	const onJobSite = answers.onJobSite === YES_NO.YES;
	const anotherVehicle = answers.anotherVehicleInvolved === YES_NO.YES;
	const personStruck = answers.personStruck === YES_NO.YES;

	return {
		// BCEW vehicle + employee info are always hidden on the technician side — the
		// technician already knows these details. Kept for reuse on the admin side.
		truckInfo: false,
		employeeInfo: false,
		otherVehicle: anotherVehicle,
		personInvolved: personStruck,
		police: true,
		// Follow-up (company / builder / homeowner property) always shows on a job site.
		// Off-site it shows only in the all-No case (no other vehicle and no person struck).
		followUp: onJobSite || (!anotherVehicle && !personStruck),
		insuranceDocs: true,
	};
};
