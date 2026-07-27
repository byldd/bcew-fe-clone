import RoleDetails from "@/module/employee/template/RoleDetails";

export default async function RoleDetailsPage({ params }: { params: Promise<{ roleID: string }> }) {
	const { roleID } = await params;

	return <RoleDetails roleID={roleID} />;
}
