import { ITravelPayRequestsResponse, TRAVEL_PAY_REQUEST_SORT } from "../types";

export const gruopTravelPayDataByUserName = (data: ITravelPayRequestsResponse) => {
	const mapByUserName = new Map<string, ITravelPayRequestsResponse>();

	data.forEach((travelPay) => {
		const key = travelPay?.user?.name;
		const exist = mapByUserName.get(key);

		mapByUserName.set(key, !exist ? [travelPay] : [...exist, travelPay]);
	});

	const output: {
		userName: string;
		travelPays: ITravelPayRequestsResponse;
	}[] = [];

	mapByUserName.forEach((value, key) => {
		output?.push({
			userName: key,
			travelPays: value,
		});
	});

	return output;
};

export const applyFilterAndSort = ({
	data,
	search,
	sort,
}: {
	data: ITravelPayRequestsResponse;
	search: string;
	sort?: TRAVEL_PAY_REQUEST_SORT | null;
}) => {
	const filterSearch = data?.filter((item) => {
		if (search) {
			const searchParts = search.split(" ");
			return searchParts.every((part) => item.user.name.toLowerCase().includes(part.toLowerCase()));
		}
		return true;
	});

	if (sort === TRAVEL_PAY_REQUEST_SORT.NAME_ASC) {
		filterSearch?.sort((a, b) => a.user.name.localeCompare(b.user.name));
	}

	if (sort === TRAVEL_PAY_REQUEST_SORT.NAME_DESC) {
		filterSearch?.sort((a, b) => b.user.name.localeCompare(a.user.name));
	}

	return filterSearch;
};
