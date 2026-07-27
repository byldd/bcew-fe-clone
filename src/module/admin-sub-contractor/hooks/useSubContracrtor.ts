import { apiClient } from "@/lib/api";
import { useQuery } from "@tanstack/react-query";
import { ISubContractorCrewQuery, ISubContractorCrewResponse, ISubContractorResponse } from "../types";

export const useSubContractors = () => {
	return useQuery({
		queryKey: ["subContractors"],
		queryFn: async () => {
			const { data } = await apiClient.get<{ data: ISubContractorResponse }>("/admin/sub-contractor");
			return data.data.items;
		},
	});
};

export const useSubContractorCrews = (id: string, query: ISubContractorCrewQuery) => {
	return useQuery({
		queryKey: ["subContractorCrews", id, query],
		enabled: !!id,
		queryFn: async () => {
			const { data } = await apiClient.get<{ data: ISubContractorCrewResponse }>(`/admin/sub-contractor/${id}/crews`, {
				params: query,
			});
			return data.data;
		},
	});
};
