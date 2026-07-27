import EmployeeActivityPage from "@/module/employee/template/employee-activity";

/**
 * Made async because `params` is now a Promise in Next.js 15.
 */
export default async function EmployeeActivity({ params }: { params: Promise<{ employeeID: string }> }) {
	const { employeeID } = await params;

	return <EmployeeActivityPage employeeID={employeeID} />;
}
