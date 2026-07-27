import { ICrewWithDetails, IEmployeeNames } from "@/module/crew/types";
import { EmployeeClass } from "@/module/crew/types";

export function mapCrewEmployeesToForm(crew: ICrewWithDetails) {
	return crew.crewEmployees.map((ce) => ({
		id: ce.employee.id,
		EmployeeName: ce.employee.employeeName,
		EmployeeNumber: String(ce.employee.bcewEmployeeNumber),
	}));
}

export function filterElectricians(employees: IEmployeeNames[], selectedIds: string[]): IEmployeeNames[] {
	return employees
		.filter((emp) => emp.Class === EmployeeClass.Electrician)
		.filter((emp) => !selectedIds.includes(emp.id));
}

export function filterEmployeesForDropdown(
	employees: IEmployeeNames[],
	searchTerm: string,
	excludeId?: string
): IEmployeeNames[] {
	return employees
		.filter((emp) => emp.id !== excludeId) // Exclude selected leader if provided
		.filter((emp) => emp.EmployeeName.toLowerCase().includes(searchTerm.toLowerCase()));
}
