"use client";

import { routes } from "@/config/routes";
import { clearCookies } from "@/module/auth/utils/helpers";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import useAuthStore from "@/store/auth-store";
import { LOGIN_MODE } from "@/utils/enums";
import { AUTH_QUERY_PARAM } from "@/module/auth/utils/constants";

export default function SignOutBtn() {
	const { user, subcontractorCrew } = useAuthStore((state) => state);

	const router = useRouter();

	const handleSignOut = () => {
		if (!user && !subcontractorCrew) return;

		clearCookies();

		// Sub-contractor crew leaders
		if (subcontractorCrew) {
			const url = new URL(routes.signIn, window.location.origin);
			url.searchParams.set(AUTH_QUERY_PARAM.LOGIN, LOGIN_MODE.SUB_CONTRACTOR_CREW_LEADER);
			router.replace(url.toString());
			return;
		}

		// Regular users
		router.replace(routes.signIn);
	};

	return (
		<>
			<Button disabled={!user || !subcontractorCrew} onClick={() => void handleSignOut()}>
				Sign Out
			</Button>
		</>
	);
}
