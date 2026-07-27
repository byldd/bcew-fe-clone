import { toDate } from "@/lib/utils/date";
import { env } from "@/env.mjs";
import { ENV } from "@/utils/enums";

const getPaginatedData = <T extends object>(data: T[], page: number, size: number) => {
	const start = (page - 1) * size;
	const end = start + size;
	return data.slice(start, end);
};

const handlePastDateOperations = (jobDate: Date | string | undefined, currentDate: Date | string | undefined) => {
	if (!jobDate || !currentDate) return false;

	const job = toDate(jobDate);
	const current = toDate(currentDate);

	return current > job;
};

const isProductionEnv = () => {
	return env?.NEXT_PUBLIC_ENV === ENV.PRODUCTION;
};

const isStagingEnv = () => {
	return env?.NEXT_PUBLIC_ENV === ENV.STAGING;
};

const isDevelopmentEnv = () => {
	return env?.NEXT_PUBLIC_ENV === ENV.DEVELOPMENT;
};

export { getPaginatedData, handlePastDateOperations, isProductionEnv, isStagingEnv, isDevelopmentEnv };
