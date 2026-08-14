"use client";

import { Suspense } from "react";
import MissingItemRequestsTemplate from "@/module/material-management/missing-item-requests/templates/missing-item-requests-template";
import ForemanMissingItemRequestsTemplate from "@/module/material-management/missing-item-requests/templates/foreman-missing-item-requests-template";
import useAuthStore from "@/store/auth-store";
import { E_ROLES } from "@/utils/enums";

export default function MissingItemRequestsPage() {
	const { user } = useAuthStore((state) => state);
	const isForeman = user?.role?.name?.toLowerCase() === E_ROLES.FOREMAN.toLowerCase();

	return (
		<Suspense fallback={<div>Loading...</div>}>
			{isForeman ? (
				<ForemanMissingItemRequestsTemplate showBackButton />
			) : (
				<MissingItemRequestsTemplate showBackButton />
			)}
		</Suspense>
	);
}
