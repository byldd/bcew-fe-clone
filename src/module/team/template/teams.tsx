"use client";

import { DataTable } from "@/components/shared/datatable/datatable";
import ErrorMessageComponent from "@/components/get-error-message";
import CreateNewTeamTrigger from "@/module/team/components/create-new-team-trigger";
import { useTeams } from "@/module/team/hooks/useTeams";
import { useTeamColumns } from "@/module/team/utils/columns";
import { ITeam } from "@/module/team/types";
import { useRouter } from "next/navigation";
import { routes } from "@/config/routes";
import SectionHeader from "@/components/shared/section-header";

export default function Teams() {
	const columns = useTeamColumns();
	const router = useRouter();

	const { data = [], isPending, isError, error } = useTeams();

	if (isError) {
		return ErrorMessageComponent({ error });
	}

	const handleRowClick = (team: ITeam) => {
		router.push(routes.admin.teamDetails(team.id));
	};

	return (
		<div className="min-h-screen w-full space-y-3 bg-white">
			{/* Header + Controls */}
			<div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
				<SectionHeader title="Team Management" />
				<CreateNewTeamTrigger />
			</div>

			{/* Table */}
			<DataTable
				showGridLines
				stickyHeaderMode
				columns={columns}
				data={data}
				onClick={handleRowClick}
				isLoading={isPending}
				useSectionHeader={false}
			/>
		</div>
	);
}
