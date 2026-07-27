"use client";

import { EmployeeActivityList } from "@/module/employee/components/employee-activity-list";
import UserActivityDatePick from "@/module/employee/components/employee-user-activity-date-pick";
import { useUserActivity } from "@/module/employee/hooks/useEmployee";
import { useUserActivityParams } from "@/module/employee/hooks/useUserActivityParams";
import SectionHeader from "@/components/shared/section-header";
import ErrorMessageComponent from "@/components/get-error-message";

interface EmployeeActivity {
	employeeID: string;
}

const EmployeeActivity = ({ employeeID }: EmployeeActivity) => {
	const { startDate, endDate } = useUserActivityParams();

	const {
		data: employeeActivities,
		isLoading,
		isError,
		error,
	} = useUserActivity(employeeID, startDate?.toISOString(), endDate?.toISOString());

	return (
		<div>
			<div className="mb-6 flex flex-wrap items-center justify-between gap-3">
				<SectionHeader title="User Activities" showBackButton />
				<div className="flex items-center gap-2">
					<UserActivityDatePick />
				</div>
			</div>
			{isLoading ? (
				<div>Loading Employee Activities...</div>
			) : isError ? (
				<>{ErrorMessageComponent({ error })}</>
			) : (
				<EmployeeActivityList employeeId={employeeID} employeeActivities={employeeActivities?.data?.items ?? []} />
			)}
		</div>
	);
};

export default EmployeeActivity;
