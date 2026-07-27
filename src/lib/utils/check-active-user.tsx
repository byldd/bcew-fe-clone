"use client";

import { routes } from "@/config/routes";
import { clearCookies } from "@/module/auth/utils/helpers";
import { useGetUserData } from "@/module/profile/hooks/useProfile";
import useAuthStore from "@/store/auth-store";
import { loginParamKey } from "@/utils/constants";
import { LOGIN_MODE } from "@/utils/enums";
import { useRouter, usePathname } from "next/navigation";
import { useEffect, useCallback } from "react";

export default function CheckActiveStatus() {
	const { data: userData, isError, isLoading, isSuccess } = useGetUserData();
	const router = useRouter();
	const pathname = usePathname();
	const { setUser, setSubcontractorCrew } = useAuthStore((state) => state);

	const getLoginRouteForCurrentPage = useCallback(() => {
		if (pathname?.startsWith(routes.admin.root)) return routes.signIn;
		if (pathname?.startsWith(routes.employee.root)) return routes.signIn;
		if (pathname?.startsWith(routes.subContractor.adminRoot)) {
			return routes.signIn;
		}

		// Sub-contractor Crew Leader login
		if (pathname?.startsWith(routes.subContractor.crewLeaderRoot)) {
			return `${routes.signIn}?${loginParamKey}=${LOGIN_MODE.SUB_CONTRACTOR_CREW_LEADER}`;
		}

		return routes.signIn;
	}, [pathname]);

	useEffect(() => {
		if (isLoading) return;

		const isInvalid = !isSuccess || isError || (!userData?.data?.user && !userData?.data?.subContractorCrew);

		if (isInvalid) {
			clearCookies();
			router.replace(getLoginRouteForCurrentPage());
			return;
		}

		if (userData?.data?.user) {
			setUser(userData.data.user);
			setSubcontractorCrew(undefined);
		}
		if (userData?.data?.subContractorCrew) {
			setSubcontractorCrew(userData.data.subContractorCrew);
			setUser(undefined);
		}
	}, [userData, isLoading, isError, isSuccess, router, getLoginRouteForCurrentPage, setUser, setSubcontractorCrew]);

	return null;
}
