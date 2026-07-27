import React from "react";
import { useAdminPageAccessContext } from "../context/page-access";
import { ACCESS_LEVEL } from "@/module/employee/enums";
import { MODULE } from "@/utils/enums";
import { useGetUserModuleAccess } from "@/module/profile/hooks/useProfile";
import { isProductionEnv } from "@/utils";

const WriteAccessWrapper = ({ children, moduleName }: { children: React.ReactNode; moduleName?: MODULE }) => {
	const { pageAccess } = useAdminPageAccessContext();

	const { data } = useGetUserModuleAccess(moduleName);

	const moduleAccessLevel = data?.data.accessLevel;
	const pageAccessLevel = pageAccess?.accessLevel;

	const finalAccessLevel = isProductionEnv() ? moduleAccessLevel : pageAccessLevel;

	if (finalAccessLevel == ACCESS_LEVEL.WRITE) {
		return children;
	}

	return null;
};

export default WriteAccessWrapper;
