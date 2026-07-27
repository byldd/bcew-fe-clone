"use client";

import { Button } from "@/components/ui/button";
import { SelectField } from "@/components/ui/selectField";
import { openErrorToast, openSuccessToast } from "@/components/toast";
import { useTeams, useUpdateTeamMembers } from "@/module/team/hooks/useTeams";
import { useQueryClient } from "@tanstack/react-query";
import { useState } from "react";

interface Props {
	userId: string;
	userName: string;
	currentTeamId: string;
	onClose: () => void;
}

// for removing team member, we need to select another team to move the member, if there is no other team then we can not remove the member from the team, because there is no place to move the member
export default function RemoveTeamMemberModal({ userId, userName, currentTeamId, onClose }: Props) {
	const queryClient = useQueryClient();

	const [selectedTeamId, setSelectedTeamId] = useState("");

	const { data: teams = [], isPending } = useTeams();

	const mutation = useUpdateTeamMembers(selectedTeamId);

	const availableTeams = teams.filter((team) => team.id !== currentTeamId);

	const handleSubmit = () => {
		if (!selectedTeamId) {
			return openErrorToast({
				message: "Please select team",
			});
		}

		mutation.mutate(
			{
				userIds: [userId],
			},
			{
				onSuccess: () => {
					openSuccessToast(`${userName} removed from team successfully`);
					queryClient.invalidateQueries({
						queryKey: ["teams"],
					});

					queryClient.invalidateQueries({
						queryKey: ["team", currentTeamId],
					});

					onClose();
				},

				onError: (error) => {
					openErrorToast({
						error,
					});
				},
			}
		);
	};

	return (
		<div className="space-y-6">
			<p className="text-sm text-brand-dark50">
				This will remove the selected member from the team. you can add the member again anytime.
			</p>

			<SelectField
				label="Please select team"
				placeholder="Select team"
				options={availableTeams.map((team) => ({
					label: team.name,
					value: team.id,
				}))}
				value={selectedTeamId}
				onValueChange={setSelectedTeamId}
				disabled={isPending}
			/>

			<div className="flex gap-2 pt-2">
				<Button className="w-full" variant="outline" onClick={onClose}>
					Cancel
				</Button>

				<Button
					className="w-full"
					variant="filled"
					onClick={handleSubmit}
					loading={mutation.isPending}
					disabled={!selectedTeamId}
				>
					Remove
				</Button>
			</div>
		</div>
	);
}
