import { apiClient } from "@/lib/api";
import { IApiResponse } from "@/types";
import { useMutation } from "@tanstack/react-query";

export const useUpdateNavOrder = () => {
	return useMutation({
		mutationKey: ["update-nav-order"],
		mutationFn: async (order: string[]) => {
			const { data } = await apiClient.put<IApiResponse<null>>("/user/nav-order", { order });
			return data;
		},
	});
};
