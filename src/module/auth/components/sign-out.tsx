"use client";

import { routes } from "@/config/routes";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import useAuthStore from "@/store/auth-store";
import { LOGIN_MODE } from "@/utils/enums";
import { AUTH_QUERY_PARAM } from "@/module/auth/utils/constants";
import { useAuthAPI } from "@/module/auth/hooks/useAuth";
export default function SignOutBtn() {
	const { user, subcontractorCrew } = useAuthStore((state) => state);
	const { useSignout } = useAuthAPI();
	const { signout } = useSignout();
	const router = useRouter();

	const handleSignOut = () => {
		if (!user && !subcontractorCrew) return;

		signout();

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
