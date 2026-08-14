"use client";

import { useSearchParams } from "next/navigation";
import SubContractorCrewLeaderSignInForm from "./sub-contractor-login";
import LoginPage from "./sign-in-form";
import { LOGIN_MODE } from "@/utils/enums";
import { AUTH_QUERY_PARAM } from "@/module/auth/utils/constants";

export default function LoginWrapper() {
	const searchParams = useSearchParams();
	const loginType = searchParams.get(AUTH_QUERY_PARAM.LOGIN) ?? LOGIN_MODE.USER;

	if (loginType === LOGIN_MODE.SUB_CONTRACTOR_CREW_LEADER) {
		return <SubContractorCrewLeaderSignInForm />;
	}

	return <LoginPage />;
}
