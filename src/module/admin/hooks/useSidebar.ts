import { useMutation, useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/api";
import { IGetAdminSidebarPages, IRolePagePermission, IUpdateUserPageOrderRequest } from "../types/sideb-bar-page";
import { IApiResponse } from "@/types";
import { useParams, usePathname } from "next/navigation";
import { useMemo } from "react";

export const useGetSideBarPages = () => {
	return useQuery({
		queryKey: ["admin-sidebar-pages"],
		queryFn: async () => {
			const { data } = await apiClient.get<IGetAdminSidebarPages>("/admin/role/pages");
			return data.data;
		},
	});
};

export const useGetPageAccess = ({ urlEndpoint }: { urlEndpoint: string }) => {
	return useQuery({
		queryKey: ["user-page-access", urlEndpoint],
		queryFn: async () => {
			const { data } = await apiClient.get<IApiResponse<IRolePagePermission>>(
				`/user/page/access?urlEndpoint=${urlEndpoint}`
			);
			return data.data;
		},
	});
};

export function useGetPageEndpoint() {
	const pathname = usePathname();
	const params = useParams();

	return useMemo(() => {
		let endpoint = pathname;

		const paramValues = Object.values(params ?? {})
			.flat()
			.filter(Boolean)
			.sort((a, b) => String(b).length - String(a).length);

		for (const value of paramValues) {
			const index = endpoint.indexOf(`/${value}`);

			if (index !== -1) {
				endpoint = endpoint.substring(0, index);
				break;
			}
		}

		return endpoint;
	}, [pathname, params]);
}

export const useUpdateSidebarOrder = () => {
	return useMutation({
		mutationFn: async (payload: IUpdateUserPageOrderRequest) => {
			return apiClient.put("/user/page/order", {
				payload,
			});
		},
	});
};
