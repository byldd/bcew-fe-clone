import { IEmergencyCallDirections, IEmergencyContact } from "../types";

export const ACCIDENT_EMERGENCY_CONTACTS: IEmergencyContact[] = [
	{ name: "Nolan Yeager", phone: "(267) 412-9532" },
	{ name: "Troy Tucker", phone: "(215) 519-1530" },
	{ name: "Darryl Dawson", phone: "(267) 278-3227" },
	{ name: "William Cummings", phone: "(445) 900-5301" },
	{ name: "Kevin Stretz", phone: "(267) 342-2839" },
];

export const ACCIDENT_DISCLAIMER_POINTS: string[] = [
	"Do not leave the scene of an accident without completing the steps.",
	"Employee is not authorized to speak to insurance companies, attorneys or other third-party entities regarding accidents without the approval of BCEW.",
];

export const ACCIDENT_POLICE_INSTRUCTION =
	"If this accident involved another vehicle, police must be called. Non-negotiable.";

export const EMERGENCY_CALL_DIRECTIONS: IEmergencyCallDirections = {
	intro: "Call the contacts below in the order listed. If the person does not answer:",
	steps: [
		"Send them a text message.",
		"Wait 5 minutes for a response.",
		"If there is still no response, call the next person on the list.",
	],
	closing: "Continue this process until someone answers.",
};
