"use client";

import { DataTable } from "@/components/shared/datatable/datatable";
import { ITeamUser } from "@/module/team/types";
import { useTeamMemberColumns } from "../hooks/useTeamMemberColumns";

interface Props {
	users: ITeamUser[];
	teamId: string;
}

export default function TeamMembersTable({ users, teamId }: Props) {
	const columns = useTeamMemberColumns(teamId);

	return <DataTable columns={columns} data={users} showGridLines stickyHeaderMode useSectionHeader={false} />;
}
