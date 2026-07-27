import { NAMESPACE } from "@/i18n/type";
import { useTypedTranslations } from "@/i18n/useTypedTranslations";
import React from "react";

const ScheduleManageMent = () => {
	const tCommon = useTypedTranslations(NAMESPACE.COMMON);
	return <div>{tCommon.scheduleManagement}</div>;
};

export default ScheduleManageMent;
