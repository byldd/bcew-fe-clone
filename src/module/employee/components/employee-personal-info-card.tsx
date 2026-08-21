"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { IEmployeeDetailsResponse } from "../types";
import { getMonthsSinceDate, getYearsSinceDate, toFormattedDate } from "@/lib/utils/date";
import { DATE_FORMAT } from "@/types/date";
import { useTypedTranslations } from "@/i18n/useTypedTranslations";
import { NAMESPACE } from "@/i18n/type";
interface EmployeePersonalInfoCardProps {
	employee: IEmployeeDetailsResponse;
	trigger?: React.ReactNode;
}

export default function EmployeePersonalInfoCard({ employee, trigger }: EmployeePersonalInfoCardProps) {
	const tPeople = useTypedTranslations(NAMESPACE.PEOPLE_MANAGEMENT);
	return (
		<Card className="rounded-3xl border border-brand-dark10 bg-white !p-7">
			<CardHeader className="mb-4 p-0">
				<CardTitle className="flex items-center justify-between text-xl font-semibold">
					{tPeople.personalInformation}
					{trigger}
				</CardTitle>
			</CardHeader>
			<CardContent className="py-2">
				<div className="grid grid-cols-1 gap-x-6 gap-y-4 text-xs sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6">
					<div>
						<p className="mb-2 text-xs font-medium text-brand-dark50">{tPeople.fullName}</p>
						<p className="text-xs font-semibold text-brand-dark">{employee.fullName}</p>
					</div>
					<div>
						<p className="mb-2 text-xs font-medium text-brand-dark50">{tPeople.emailId}</p>
						<p className="break-all text-xs font-semibold text-brand-dark">{employee.emailID}</p>
					</div>
					<div>
						<p className="mb-2 text-xs font-medium text-brand-dark50">{tPeople.phone}</p>
						<p className="text-xs font-semibold text-brand-dark">{employee.phone}</p>
					</div>
					<div>
						<p className="mb-2 text-xs font-medium text-brand-dark50">{tPeople.jobRole}</p>
						<p className="text-xs font-semibold text-brand-dark">{employee?.employee?.user?.role?.name || "-"}</p>
					</div>
					<div>
						<p className="mb-2 text-xs font-medium text-brand-dark50">{tPeople.department}</p>
						<p className="text-xs font-semibold text-brand-dark">{employee.department}</p>
					</div>
					<div>
						<p className="mb-2 text-xs font-medium text-brand-dark50">{tPeople.team}</p>
						<p className="text-xs font-semibold text-brand-dark">{employee?.employee?.user?.team?.name || "--"}</p>
					</div>
					<div>
						<p className="mb-2 text-xs font-medium text-brand-dark50">{tPeople.crewName}</p>
						<p className="text-xs font-semibold text-brand-dark">{employee.crew?.name || "-"}</p>
					</div>
					<div>
						<p className="mb-2 text-xs font-medium text-brand-dark50">{tPeople.crewLeader}</p>
						<p className="text-xs font-semibold text-brand-dark">{employee?.crew?.crewLeader?.employeeName || "-"}</p>
					</div>
					<div>
						<p className="mb-2 text-xs font-medium text-brand-dark50">{tPeople.hireDate}</p>
						<div className="text-xs font-semibold text-brand-dark">
							{employee?.joiningDate ? toFormattedDate(employee.joiningDate, DATE_FORMAT.MM_SLASH_DD_YYYY) : "-"}
						</div>
					</div>
					<div>
						<p className="mb-2 text-xs font-medium text-brand-dark50">{tPeople.numberOfMonths}</p>
						<p className="text-xs font-semibold text-brand-dark">{getMonthsSinceDate(employee.joiningDate)}</p>
					</div>
					<div>
						<p className="mb-2 text-xs font-medium text-brand-dark50">{tPeople.numberOfYears}</p>
						<p className="text-xs font-semibold text-brand-dark">{getYearsSinceDate(employee.joiningDate)}</p>
					</div>
					<div>
						<p className="mb-2 text-xs font-medium text-brand-dark50">{tPeople.expectedOutput}</p>
						<p className="text-xs font-semibold text-brand-dark">{"-"}</p>
					</div>
				</div>
			</CardContent>
		</Card>
	);
}
