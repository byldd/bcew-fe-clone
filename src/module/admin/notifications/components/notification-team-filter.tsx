"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { useTeams } from "@/module/team/hooks/useTeams";
import { useNotificationParam } from "../hook/useNotificationParam";
import { useUpdateNotificationPreferenceDebounced } from "../hook/useUpdateNotificationPreferenceDebounced";
import { NOTIFICATION_VIEW } from "../types/type";

const NotificationTeamFilter = () => {
	const { data: teams } = useTeams();
	const { getParams, setParams } = useNotificationParam();

	const { teamId } = getParams();

	const updatePreference = useUpdateNotificationPreferenceDebounced();

	if (!teams || teams.length === 0) return null;

	return (
		<div className="flex items-center gap-2">
			{/* ALL */}
			<Button
				className="h-10"
				variant={!teamId ? "filled" : "outline"}
				onClick={() => {
					setParams({ teamId: null });
					updatePreference({ teamId: NOTIFICATION_VIEW.ALL });
				}}
			>
				All
			</Button>

			{/* TEAMS */}
			{teams.map((team) => (
				<Button
					key={team.id}
					className="h-10"
					variant={team.id === teamId ? "filled" : "outline"}
					onClick={() => {
						setParams({ teamId: team.id });
						updatePreference({ teamId: team.id });
					}}
				>
					{team.name}
				</Button>
			))}
		</div>
	);
};

export default NotificationTeamFilter;
