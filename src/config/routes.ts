export const routes = {
	root: "/",
	signUp: "/signup",
	signIn: "/signin",
	matchFingerprint: "/match-finger",
	forgotPassword: "/forgot-password",
	terms: "/terms",
	privacyPolicy: "/privacy",
	system: {
		signIn: "/system/signin",
		genericErrorLogs: "/system/error-logs/generic",
		emailErrorLogs: "/system/error-logs/email",
	},
	superAdmin: {
		companies: "/super-admin/companies",
		inviteCompanies: "/super-admin/invite-companies",
	},
	admin: {
		root: "/admin",
		notification: "/admin/notifications",
		legacy: "/admin/legacy",
		dashboard: "/admin/dashboard",
		products: "/admin/products",
		createProduct: "/admin/products/create",
		productDetails: (id: string) => `/admin/products/${id}`,
		editProduct: (id: string) => `/admin/products/${id}/edit`,
		subscriptions: "/admin/subscriptions",
		teams: "/admin/team-management",
		teamDetails: (id: string) => `/admin/team-management/${id}`,
		adminDetails: (id: string) => `/admin/dashboard?companyRef=${id}`,
		crew: "/admin/crew",
		employees: "/admin/employees",
		employeesDetails: (id: string) => `/admin/employees/${id}`,
		employeeActivity: (id: string) => `/admin/employees/${id}/activity`,
		roles: "/admin/role-management",
		roleDetails: (id: string) => `/admin/role-management/${id}`,
		subContractor: "/admin/sub-contractor",
		weeklySchedule: "/admin/schedule-management/weekly-schedule",
		configuration: "/admin/schedule-management/configuration",
		scheduleHistory: "/admin/schedule-management/weekly-schedule/schedule-history",
		roster: "/admin/schedule-management/employee-time-config",
		jobsAndPhases: "/admin/schedule-management/jobs-and-phases",
		timeLogs: "/admin/schedule-management/time-logs",
		attendanceRecords: "/admin/schedule-management/attendance-records",
		gpsTab: "/admin/schedule-management/time-logs/gps-vehicle",
		latenessDetection: "/admin/schedule-management/time-logs/lateness-detection",
		timeVariance: "/admin/schedule-management/time-variance",
		technicalIssues: "/admin/technical-issues",
		travelPay: "/admin/travel-pay",
		timeRequests: "/admin/schedule-management/time-requests",
		timeRequestsMDTR: "/admin/schedule-management/time-requests?tab=midday-stop",
		releaseNotes: "/admin/release-notes",
		builderComms: "/admin/builder-communication",
		jobLevelDetails: "/admin/job-level-details",
		jobLevelPullList: "/admin/job-level-details/pull-list",
		jobMaterialSelection: ({
			jobDailyRecordId,
			jobnum,
			tsknum,
		}: {
			jobDailyRecordId: string;
			jobnum?: number;
			tsknum?: number;
		}) => {
			const params = new URLSearchParams({ jobDailyRecordId });
			if (jobnum !== undefined) params.set("jobnum", String(jobnum));
			if (tsknum !== undefined) params.set("tsknum", String(tsknum));
			return `/admin/job-level-details/material-selection?${params.toString()}`;
		},
		storageUnitReport: "/admin/storage-unit-report",
		materialRequests: "/admin/material-requests",
		missingItemRequests: "/admin/missing-item-requests",
		gpsExceptionEvents: "/admin/gps-exception-events",
		warehouseFingerprint: "/admin/warehouse-fingerprint",
		projectMap: "/admin/project-management/map",
		payroll: "/admin/schedule-management/payroll",
		config: "/admin/setting/config",
		pages: "/admin/setting/config/pages",
		drivingSafetyPolicies: "/admin/driving-safety/policies",
		drivingSafetyIncidentReports: "/admin/driving-safety/incident-reports",
		drivingSafetyAccidentReview: (id: string) => `/admin/driving-safety/incident-reports/${id}`,
	},
	subContractorAdminDesktop: {
		dashboard: "/admin/sub-contractor/dashboard",
		weeklySchedule: "/admin/sub-contractor/schedule-management/weekly-schedule",
		crew: "/admin/sub-contractor/crew",
		technicalIssues: "/admin/sub-contractor/technical-issues",
		notification: "/admin/sub-contractor/notifications",
	},
	user: {
		dashboard: "/user/dashboard",
		products: "/user/products",
		productDetails: (id: string) => `/user/products/${id}`,
	},
	account: {
		profileSettings: "/profile/profile-settings",
		changePassword: "/profile/profile-settings/password",
	},
	profile: {
		dashboard: "/profile",
		shop: "/profile/shop",
	},
	employee: {
		root: "/employee",
		dashboard: "/employee/dashboard",
		vehicleHistory: "/employee/vehicle-history",
		job: (id: string) => `/employee/job/${id}`,
		materialSelection: (assignmentId: string, recnum?: string, tsknum?: string) => {
			const params = new URLSearchParams();
			if (recnum !== undefined) params.set("recnum", String(recnum));
			if (tsknum !== undefined) params.set("tsknum", String(tsknum));
			const query = params.toString();
			return `/employee/job/${assignmentId}/material-selection${query ? `?${query}` : ""}`;
		},
		pullList: (assignmentId: string) => `/employee/job/${assignmentId}/pull-list`,
		notification: "/employee/notification",
		selfScheduling: "/employee/self-scheduling",
		technicalIssue: "/employee/technical-issue",
		middayStop: "/employee/midday-stop",
		travelPay: "/employee/travel-pay",
		releaseNotes: "/employee/release-notes",
		missingItemRequests: "/employee/missing-item-requests",
		materialRequests: "/employee/material-requests",
		foremanMissingItemRequests: "/employee/missing-item-requests-management",
		foremanMaterialRequestNote: (pullListItemId: string) =>
			`/employee/material-requests/${pullListItemId}/foreman-note`,
		history: "/employee/history",
		reportJobSiteInjury: "/employee/report-job-site-injury",
		newJobSiteInjuryReport: "/employee/report-job-site-injury/new",
		reportVehicleBreakdown: "/employee/report-vehicle-breakdown",
		newVehicleBreakdownReport: "/employee/report-vehicle-breakdown/new",
		reportVehicleAccident: "/employee/report-vehicle-accident",
		newVehicleAccidentReport: "/employee/report-vehicle-accident/new",
		safetyMyRecords: "/employee/safety/my-records",
		vehicleDocuments: (truckNumber: string) =>
			`/employee/safety/vehicle-documents?truckNumber=${encodeURIComponent(truckNumber)}`,
		crateManagement: "/employee/crate-management",
		crateManagementScanReceive: "/employee/crate-management/scan-receive",
		safetyPolicies: "/employee/safety/policies",
	},
	subContractor: {
		adminRoot: "/sub-contractor/admin",
		crewLeaderRoot: "/sub-contractor/crew-leader",
		adminDashboard: "/sub-contractor/admin/dashboard",
		crewLeaderDashboard: "/sub-contractor/crew-leader/dashboard",
		adminAllCrews: "/sub-contractor/admin/all-crews",
		crewLeaderAllCrews: "/sub-contractor/crew-leader/all-crews",
		adminJob: (id: string) => `/sub-contractor/admin/job/${id}`,
		crewLeaderJob: (id: string) => `/sub-contractor/crew-leader/job/${id}`,
		adminNotification: "/sub-contractor/admin/notification",
		crewLeaderNotification: "/sub-contractor/crew-leader/notification",
		adminTechnicalIssue: "/sub-contractor/admin/technical-issue",
		crewLeaderTechnicalIssue: "/sub-contractor/crew-leader/technical-issue",
		adminMaterialSelection: (jobDailyRecordId: string) =>
			`/sub-contractor/admin/job/${jobDailyRecordId}/material-selection`,
		crewLeaderMaterialSelection: (jobDailyRecordId: string) =>
			`/sub-contractor/crew-leader/job/${jobDailyRecordId}/material-selection`,
		adminMissingItemRequests: "/sub-contractor/admin/missing-item-requests",
		crewLeaderMissingItemRequests: "/sub-contractor/crew-leader/missing-item-requests",
	},
	bcew: {
		warehousePhoto: (picpath: string) =>
			`https://bcewonline.com:444/Portal/secure/Site/Warehouse/${encodeURI(picpath)}`,
		todoPhoto: (path: string) => `/api/legacy-portal/Secure/Site/ToDo/${encodeURI(path)}`,
		workOrder: (WorkOrderNum: number) =>
			`https://bcewonline.com:444/portal/secure/Site/WorkOrders/Work%20Order%20Details.aspx?WorkOrderNum=${WorkOrderNum}`,
		fieldFiles: (jobRecNum: number) =>
			` https://bcewonline.com:444/Portal/secure/Site/ToDo/FieldFiles.aspx?Job=${jobRecNum}`,
		pullList: (jobNumber: string | number, taskNum: string | number) =>
			`https://bcewonline.com:444/Portal/secure/Site/Pull%20Lists.aspx?Job=${jobNumber}&TaskNum=${taskNum}&Epull=1`,
		attendance: "https://bcewonline.com:444/Portal/secure/Site/Attendance/Attendance.aspx",
		requestForTimeoff: "https://bcewonline.com:444/Portal/secure/Site/RequestforTimeoff.aspx",
		safetyPolicy: "https://bcewonline.com:444/Portal/secure/Site/Safety%20Management/Safety%20Management.aspx",
		safetyIncidents:
			"https://bcewonline.com:444/Portal/secure/Site/Safety%20Management/Safety%20Management%20Review.aspx",
		vehicleRegistrationPdf: (truckNumber: string) =>
			`https://bcewonline.com:444/Portal/Secure/Site/Registration%20and%20Insurance/${encodeURIComponent(truckNumber)}%20Registration.PDF`,
		fleetInsurancePdf:
			"https://bcewonline.com:444/Portal/Secure/Site/Registration%20and%20Insurance/Fleet%20Insurance%20Auto%20ID%20Card.PDF",
	},
};
