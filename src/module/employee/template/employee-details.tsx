"use client";

import { useEmployee } from "@/module/employee/hooks/useEmployee";

import React, { useState } from "react";

import EmployeeEditModalTrigger from "@/module/employee/components/employee-personal-info-edit-modal-trigger";
import EmployeePersonalInfoCard from "@/module/employee/components/employee-personal-info-card";
import EmployeeUserActivityCard from "@/module/employee/components/employee-user-activity-card";
import { EmployeeRolePermissionSection } from "../components/empolyee-roles-and-permissions-section";
import { Spinner } from "@/components/ui/spinner";
import ErrorMessageComponent from "@/components/get-error-message";
import StandardWorkingHoursCard from "../components/employee-standard-working-hours-card";
import SectionHeader from "@/components/shared/section-header";
import { useTypedTranslations } from "@/i18n/useTypedTranslations";
import { NAMESPACE } from "@/i18n/type";
import TemporaryCoverageTrigger from "@/module/employee/components/temporary-coverage-trigger";
import TemporaryCoverageBanner from "@/module/employee/components/temporary-coverage-banner";
import DeactivateTrigger from "@/module/employee/components/deactivate-trigger";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils/utils";
import { useDeactivateEmployee, useReactivateEmployee } from "@/module/employee/hooks/useEmployeeOffboarding";
import { ITemporaryCoverageResponse } from "@/module/employee/types";

interface Props {
	employeeID: string;
}
export default function EmployeeDetails({ employeeID }: Props) {
	const { data: employee, isPending, isError, error } = useEmployee(employeeID);
	const tPeople = useTypedTranslations(NAMESPACE.PEOPLE_MANAGEMENT);
	const [isDeactivated, setIsDeactivated] = useState(false);
	const [activeCoverage, setActiveCoverage] = useState<ITemporaryCoverageResponse | null>(null);

	const deactivateMutation = useDeactivateEmployee(employeeID);
	const reactivateMutation = useReactivateEmployee(employeeID);

	if (isPending) return <Spinner />;
	if (isError) return ErrorMessageComponent({ error });

	const handleConfirmDeactivate = () => {
		deactivateMutation.mutate(undefined, { onSettled: () => setIsDeactivated(true) });
	};

	const handleReactivate = () => {
		reactivateMutation.mutate(undefined, { onSettled: () => setIsDeactivated(false) });
	};

	return (
		<>
			{deactivateMutation.isPending && (
				<div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/20 backdrop-blur-sm">
					<div className="rounded-full bg-black px-6 py-3 text-sm font-medium text-white">Loading...</div>
				</div>
			)}
			<div className="overflow-x-hidden">
				<div className="mb-4">
					<SectionHeader
						title={tPeople.employeeDetails}
						showBackButton
						actions={
							isDeactivated ? (
								<Button
									className="h-9"
									variant="outline"
									loading={reactivateMutation.isPending}
									onClick={handleReactivate}
								>
									Reactivate
								</Button>
							) : (
								<>
									<TemporaryCoverageTrigger
										employeeId={employee.employeeId}
										employeeName={employee.fullName}
										onStartCoverage={setActiveCoverage}
									/>
									<DeactivateTrigger
										employeeId={employee.employeeId}
										employeeName={employee.fullName}
										onConfirmDeactivate={handleConfirmDeactivate}
									/>
								</>
							)
						}
					/>
				</div>
				<main className={cn("space-y-6", isDeactivated && "pointer-events-none opacity-60 grayscale-[30%]")}>
					{activeCoverage && (
						<TemporaryCoverageBanner
							employeeId={employee.employeeId}
							employeeName={employee.fullName}
							coveringEmployeeName={activeCoverage.coveringEmployeeName}
							onEndCoverage={() => setActiveCoverage(null)}
						/>
					)}
					{/* personal-info */}
					<EmployeePersonalInfoCard employee={employee} trigger={<EmployeeEditModalTrigger employee={employee} />} />
					<StandardWorkingHoursCard employeeUserId={employee?.employee?.userId} />
					{
						<>
							{/* Roles & Permission */}
							{employee?.employee?.userId && (
								<EmployeeRolePermissionSection userId={employee.employee.userId} employee={employee} />
							)}

							{/* User Activity */}
							<EmployeeUserActivityCard employeeId={employee.employeeId} />
						</>
					}
				</main>
			</div>
		</>
	);
}
