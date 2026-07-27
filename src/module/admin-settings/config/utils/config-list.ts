import { routes } from "@/config/routes";
import { IConfigGroup } from "../types/config";

export const CONFIG_GROUPS: IConfigGroup[] = [
	{
		groupLabel: "App Configuration",
		items: [
			{
				title: "Sidebar Navigation",
				description: "Configure the sidebar navigation.",
				url: routes.admin.pages,
			},
		],
	},

	{
		groupLabel: "Material management",
		items: [
			{
				title: "Material management",
				description: "What each role cannot order, by part class",
				url: "",
			},
		],
	},
	{
		groupLabel: "Attendance",
		items: [
			{
				title: "Lateness detection settings",
				description: "Banner threshold and detection buffer (minutes)",
				url: "",
			},
		],
	},
	{
		groupLabel: "Scheduling & teams",
		items: [
			{
				title: "Team definitions & Saturday rules",
				description: "Field, Washington Place, Leased Employees and Saturday defaults",
				url: "",
			},
			{
				title: "Project-to-team assignments",
				description: "Which team manages which project / schedule",
				url: "",
			},
		],
	},
];
