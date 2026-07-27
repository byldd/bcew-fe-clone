export interface IEmergencyContact {
	name: string;
	phone: string;
}

export interface IForemanContact extends IEmergencyContact {
	jobSite: string;
}

export const jobSiteInjuryPrimaryContacts: IEmergencyContact[] = [
	{ name: "Troy Tucker", phone: "(215) 519-1530" },
	{ name: "Darryl Dawson", phone: "(267) 278-3227" },
];

export const jobSiteInjuryForemen: IForemanContact[] = [
	{ name: "Jason Szwak", phone: "(267) 755-8825", jobSite: "Franconia Square TH" },
	{ name: "Kevon James", phone: "(267) 750-0602", jobSite: "Franconia Square TH" },
	{ name: "Aldo Barragan", phone: "(267) 810-4041", jobSite: "Franconia Square TH" },
	{ name: "Brian Viehweger", phone: "(267) 406-1522", jobSite: "Franconia Square TH" },
	{ name: "Vincent Mackins", phone: "(267) 750-0600", jobSite: "Franconia Square TH" },
];

export const jobSiteInjuryJobSiteOptions = Array.from(
	new Set(jobSiteInjuryForemen.map((foreman) => foreman.jobSite))
).map((jobSite) => ({ label: jobSite, value: jobSite }));

export const vehicleBreakdownAuthorizedPerson: IEmergencyContact = {
	name: "Nolan Yeager",
	phone: "(267) 412-9532",
};
