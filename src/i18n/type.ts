import common from "@/locales/en/common.json";
import schedule from "@/locales/en/schedule.json";
import jobCards from "@/locales/en/job-cards.json";
import employeeRoster from "@/locales/en/employee-roster.json";
import timeLogs from "@/locales/en/time-logs.json";
import travelPay from "@/locales/en/travel-pay.json";
import employee from "@/locales/en/employee.json";
import admin from "@/locales/en/admin.json";
import peopleManagement from "@/locales/en/people-management.json";
import subcontractor from "@/locales/en/subcontractor.json";
import builderCommunication from "@/locales/en/builder-communication.json";
import releaseNote from "@/locales/en/release-note.json";
export enum LANGUAGES {
	ENGLISH = "en",
	SPANISH = "es",
}

export type Messages = {
	common: typeof common;
	schedule: typeof schedule;
	jobCards: typeof jobCards;
	employeeRoster: typeof employeeRoster;
	timeLogs: typeof timeLogs;
	travelPay: typeof travelPay;
	peopleManagement: typeof peopleManagement;
	employee: typeof employee;
	admin: typeof admin;
	subcontractor: typeof subcontractor;
	builderCommunication: typeof builderCommunication;
	releaseNote: typeof releaseNote;
};

// these are files in locales folder for a language
export enum NAMESPACE {
	COMMON = "common",
	SCHEDULE = "schedule",
	JOB_CARDS = "jobCards",
	EMPLOYEE_ROSTER = "employeeRoster",
	TIME_LOGS = "timeLogs",
	TRAVEL_PAY = "travelPay",
	PEOPLE_MANAGEMENT = "peopleManagement",
	EMPLOYEE = "employee",
	ADMIN = "admin",
	SUBCONTRACTOR = "subcontractor",
	BUILDER_COMMUNICATION = "builderCommunication",
	RELEASE_NOTE = "releaseNote",
}
