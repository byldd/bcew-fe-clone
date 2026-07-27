import { NAMESPACE } from "@/i18n/type";
import { useTypedTranslations } from "@/i18n/useTypedTranslations";
import TimeVariance from "@/module/schedule-management/time-variance/templates/time-variance";
import { Suspense } from "react";

const Page = () => {
	const tEmployee = useTypedTranslations(NAMESPACE.EMPLOYEE);
	return (
		<Suspense fallback={<div>{tEmployee.loading}</div>}>
			<TimeVariance />
		</Suspense>
	);
};

export default Page;
