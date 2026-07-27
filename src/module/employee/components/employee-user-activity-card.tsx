"use client";

import { Card, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useUserActivity } from "@/module/employee/hooks/useEmployee";
import { useRouter } from "next/navigation";
import { routes } from "@/config/routes";
import { EmployeeActivityList } from "@/module/employee/components/employee-activity-list";
import { useTypedTranslations } from "@/i18n/useTypedTranslations";
import { NAMESPACE } from "@/i18n/type";

interface EmployeeUserActivityCardProps {
	employeeId: string;
}

export default function EmployeeUserActivityCard({ employeeId }: EmployeeUserActivityCardProps) {
	const { data: employeeActivities, isLoading, isError, error } = useUserActivity(employeeId);

	const router = useRouter();

	const handleSeeAllClick = () => {
		router.push(routes.admin.employeeActivity(employeeId));
	};
	const tPeople = useTypedTranslations(NAMESPACE.PEOPLE_MANAGEMENT);

	return (
		<Card className="rounded-3xl border border-brand-dark10 bg-white !p-7">
			<CardTitle className="mb-4 flex items-center justify-between font-inter text-xl font-semibold text-brand-dark">
				<div>
					{tPeople.userActivity} <span className="text-base text-brand-dark50">(Last 7 days)</span>
				</div>
				<Button onClick={handleSeeAllClick} variant={"ghost"} className="text-lg underline">
					{tPeople.seeAll}
				</Button>
			</CardTitle>
			{isLoading ? (
				<div>{tPeople.loadingEmployeeActivities}</div>
			) : isError ? (
				<div>{error?.message || tPeople.somethingWentWrong}</div>
			) : (
				<EmployeeActivityList employeeId={employeeId} employeeActivities={employeeActivities?.data?.items ?? []} />
			)}
		</Card>
	);
}
