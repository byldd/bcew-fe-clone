"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ITeamDetails } from "@/module/team/types";
import { toFormattedDate } from "@/lib/utils/date";
import { DATE_FORMAT } from "@/types/date";
import EditTeamTrigger from "@/module/team/components/edit-team-trigger";

interface Props {
	team: ITeamDetails;
}

export default function TeamOverviewCard({ team }: Props) {
	return (
		<Card className="rounded-3xl border border-brand-dark10 bg-white !p-7">
			<CardHeader className="mb-4 p-0">
				<CardTitle className="flex items-center justify-between text-xl font-semibold">
					Team Overview
					<EditTeamTrigger team={team} />
				</CardTitle>
			</CardHeader>

			<CardContent className="p-0">
				<div className="grid grid-cols-1 gap-x-6 gap-y-4 text-xs sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6">
					<div>
						<p className="mb-2 text-xs font-medium text-brand-dark50">Creation Date</p>

						<p className="text-xs font-semibold text-brand-dark">
							{toFormattedDate(team.createdAt, DATE_FORMAT.MM_SLASH_DD_YYYY)}
						</p>
					</div>

					<div>
						<p className="mb-2 text-xs font-medium text-brand-dark50">Total Members</p>

						<p className="text-xs font-semibold text-brand-dark">{team.users.length}</p>
					</div>

					<div>
						<p className="mb-2 text-xs font-medium text-brand-dark50">Pause Allowed</p>

						<p className="text-xs font-semibold text-brand-dark">{team.isPauseAllowed ? "Yes" : "No"}</p>
					</div>

					<div>
						<p className="mb-2 text-xs font-medium text-brand-dark50">Start Time</p>

						<p className="text-xs font-semibold text-brand-dark">
							{toFormattedDate(team.dayStartTime, DATE_FORMAT.HH_MM_AA_PM)}
						</p>
					</div>

					<div>
						<p className="mb-2 text-xs font-medium text-brand-dark50">End Time</p>

						<p className="text-xs font-semibold text-brand-dark">
							{toFormattedDate(team.dayEndTime, DATE_FORMAT.HH_MM_AA_PM)}
						</p>
					</div>
				</div>
			</CardContent>
		</Card>
	);
}
