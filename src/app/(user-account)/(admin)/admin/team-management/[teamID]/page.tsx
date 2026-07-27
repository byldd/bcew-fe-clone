import TeamDetails from "@/module/team/template/team-details";

export default async function TeamDetailsPage({ params }: { params: Promise<{ teamID: string }> }) {
	const { teamID } = await params;

	return <TeamDetails teamId={teamID} />;
}
