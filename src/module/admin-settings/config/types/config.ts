export interface IConfigGroup {
	groupLabel: string;
	items: IConfigItem[];
}

export interface IConfigItem {
	title: string;
	description: string;
	url: string;
}
