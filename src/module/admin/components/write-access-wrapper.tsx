import React from "react";
import { useAdminPageAccessContext } from "../context/page-access";
import { ACCESS_LEVEL } from "@/module/employee/enums";
import { MODULE } from "@/utils/enums";

const WriteAccessWrapper = ({ children }: { children: React.ReactNode; moduleName?: MODULE }) => {
	const { pageAccess } = useAdminPageAccessContext();

	const pageAccessLevel = pageAccess?.accessLevel;

	const finalAccessLevel = pageAccessLevel;

	if (finalAccessLevel == ACCESS_LEVEL.WRITE) {
		return children;
	}

	return null;
};

export default WriteAccessWrapper;
