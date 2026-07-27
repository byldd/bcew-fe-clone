"use client";

import ErrorMessageComponent from "@/components/get-error-message";
import { Spinner } from "@/components/ui/spinner";
import { useTeam } from "@/module/team/hooks/useTeams";
import TeamMembersTable from "@/module/team/components/team-members-table";
import TeamOverviewCard from "@/module/team/components/team-overview-card";
import AddTeamMembersTrigger from "@/module/team/components/add-team-members-trigger";
import SectionHeader from "@/components/shared/section-header";

interface Props {
	teamId: string;
}

export default function TeamDetails({ teamId }: Props) {
	const { data: team, isPending, isError, error } = useTeam(teamId);

	if (isPending) return <Spinner />;

	if (isError)
		return ErrorMessageComponent({
			error,
		});

	if (!team) return null;

	return (
		<div className="min-h-screen w-full space-y-6 bg-white">
			{/* Header + Add Members */}
			<div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
				<SectionHeader title={team.name} showBackButton />
				<AddTeamMembersTrigger team={team} />
			</div>

			<main className="space-y-6">
				<TeamOverviewCard team={team} />
				<TeamMembersTable users={team.users} teamId={team.id} />
			</main>
		</div>
	);
}
