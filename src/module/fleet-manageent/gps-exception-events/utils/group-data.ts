import { IGetGpsExceptionEventsResponse, IGpsExceptionEventByUser } from "../types/gps-exception-event";

export const gruopGpsExceptionEventsByUserName = (
	data: IGetGpsExceptionEventsResponse["data"]
): IGpsExceptionEventByUser[] => {
	const mapByUserName = new Map<string, IGetGpsExceptionEventsResponse["data"]>();

	data.forEach((event) => {
		const key = event?.employee?.user?.name;
		if (!key) return;
		const exist = mapByUserName.get(key);
		mapByUserName.set(key, !exist ? [event] : [...exist, event]);
	});

	const output: {
		userName: string;
		events: IGetGpsExceptionEventsResponse["data"];
	}[] = [];

	mapByUserName.forEach((value, key) => {
		output?.push({
			userName: key,
			events: value,
		});
	});

	return output;
};
