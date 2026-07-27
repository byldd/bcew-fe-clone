"use client";

import { Button } from "@/components/ui/button";
import { routes } from "@/config/routes";
import { useRouter } from "next/navigation";
import { ACCESS_LEVEL } from "../enums";
import { useTypedTranslations } from "@/i18n/useTypedTranslations";
import { NAMESPACE } from "@/i18n/type";

export const RoleManagement = ({ accessLevel }: { accessLevel: ACCESS_LEVEL | undefined }) => {
	const router = useRouter();
	const tCommon = useTypedTranslations(NAMESPACE.COMMON);

	const handleRedirect = () => {
		router.push(routes.admin.roles);
	};
	return (
		<>
			{accessLevel === ACCESS_LEVEL.WRITE && (
				<div>
					<Button variant="filled" onClick={handleRedirect} className="h-10">
						{tCommon.roleManagement}
					</Button>
				</div>
			)}
		</>
	);
};
