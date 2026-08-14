export enum DATE_FORMAT {
	MM_DD_YYYY = "MM-dd-yyyy",
	MM_SLASH_DD_YYYY = "MM/dd/yyyy",
	MM_SLASH_DD = "MM/dd",
	YYYY_MM_DD = "yyyy-MM-dd",
	YYYY_MM_DD_HH_MM_SS = "yyyy-MM-dd HH:mm:ss",
	DD_MM_YYYY_HH_MM_SS = "dd-MM-yyyy HH:mm:ss",
	MM_DD_YYYY_HH_MM_SS = "MM-dd-yyyy HH:mm:ss",
	HH_MM_SS = "HH:mm:ss", //24 hours format
	HH_MM = "HH:mm", //24 hours format
	HH_MM_AA_PM = "hh:mm aa", //12 hours format
	DATE = "d",
	WEEK_DAY = "EEE", // Short weekday (e.g., Mon, Tue)
	FULL_WEEK_DAY = "EEEE", // Full weekday (e.g., Monday, Saturday)
	HALF_WEEK_DAY = "EE", // Half weekday (e.g., Mon, Tue)
	FULL_MONTH = "MMMM",
	DATE_AND_TIME = "MM/dd/yyyy hh:mm aa",
	DATE_AND_TIME_SECONDS = "MM/dd/yyyy hh:mm:ss aa",
	MMM = "MMM",
	MMM_D = "MMM d",
	DD_MMM = "d MMM",
}
