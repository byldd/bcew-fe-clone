import EmployeeDetails from "@/module/employee/template/employee-details";

/**
 * Made async because `params` is now a Promise in Next.js 15.
 */
export default async function EmployeeDetailsPage({ params }: { params: Promise<{ employeeID: string }> }) {
	const { employeeID } = await params;

	return <EmployeeDetails employeeID={employeeID} />;
}
