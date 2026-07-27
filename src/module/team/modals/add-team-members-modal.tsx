"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { openErrorToast, openSuccessToast } from "@/components/toast";
import { useTeamUsers, useUpdateTeamMembers } from "@/module/team/hooks/useTeams";
import { ITeamDetails } from "@/module/team/types";
import { useQueryClient } from "@tanstack/react-query";
import { useEffect, useMemo, useRef, useState } from "react";
import { RxCross2 } from "react-icons/rx";
import { Label } from "@radix-ui/react-label";

interface Props {
	team: ITeamDetails;
	onClose: () => void;
}

export default function AddTeamMembersModal({ team, onClose }: Props) {
	const queryClient = useQueryClient();

	const { data: users = [], isPending } = useTeamUsers(team.id);

	const mutation = useUpdateTeamMembers(team.id);

	const dropdownRef = useRef<HTMLDivElement>(null);

	const [searchTerm, setSearchTerm] = useState("");

	const [showDropdown, setShowDropdown] = useState(false);

	const [selectedUsers, setSelectedUsers] = useState<typeof users>([]);

	useEffect(() => {
		const handleClickOutside = (event: MouseEvent) => {
			if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
				setShowDropdown(false);
			}
		};

		document.addEventListener("mousedown", handleClickOutside);

		return () => document.removeEventListener("mousedown", handleClickOutside);
	}, []);

	const filteredUsers = useMemo(() => {
		const selectedIds = selectedUsers.map((user) => user.id);

		return users.filter(
			(user) => !selectedIds.includes(user.id) && user.name.toLowerCase().includes(searchTerm.toLowerCase())
		);
	}, [users, searchTerm, selectedUsers]);

	const handleAddMember = (user: (typeof users)[number]) => {
		setSelectedUsers((prev) => [...prev, user]);

		setSearchTerm("");
		setShowDropdown(false);
	};

	const handleRemoveMember = (userId: string) => {
		setSelectedUsers((prev) => prev.filter((user) => user.id !== userId));
	};

	const handleSubmit = () => {
		mutation.mutate(
			{
				userIds: selectedUsers.map((user) => user.id),
			},
			{
				onSuccess: () => {
					openSuccessToast("Members added successfully");
					queryClient.invalidateQueries({
						queryKey: ["team", team.id],
					});

					queryClient.invalidateQueries({
						queryKey: ["teams"],
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

	if (isPending) return null;

	return (
		<>
			<div className="p-1">
				<div className="space-y-6">
					<div className="relative" ref={dropdownRef}>
						<Label className="mb-1 block text-sm text-gray-700">Add Members</Label>

						<Input
							placeholder="Name here"
							className="w-full rounded-[10px] border-none bg-brand-bgLightgrey"
							value={searchTerm}
							onChange={(e) => {
								setSearchTerm(e.target.value);

								setShowDropdown(true);
							}}
							onFocus={() => setShowDropdown(true)}
						/>

						{showDropdown && (
							<div className="absolute z-20 mt-1 max-h-48 w-full overflow-y-auto rounded-md border bg-white p-1 shadow-md">
								{filteredUsers.length === 0 ? (
									<p className="p-2 text-sm text-gray-400">No users found</p>
								) : (
									filteredUsers.map((user) => (
										<div
											key={user.id}
											className="cursor-pointer rounded px-2 py-2 text-sm hover:bg-gray-100"
											onClick={() => handleAddMember(user)}
										>
											<div>{user.name}</div>

											<div className="text-xs text-brand-dark50">Current Team: {user.team?.name ?? "None"}</div>
										</div>
									))
								)}
							</div>
						)}

						{/* selected chips */}
						<div className="mt-3 flex flex-wrap gap-2">
							{selectedUsers.map((user) => (
								<span
									key={user.id}
									className="flex items-center gap-1 rounded-[10px] bg-brand-dark px-3 py-2 text-xs text-white"
								>
									{user.name}

									<Button
										type="button"
										variant="ghost"
										className="mb-0.5 ml-1 h-4 w-4 p-0 text-white hover:bg-transparent"
										onClick={() => handleRemoveMember(user.id)}
									>
										<RxCross2 />
									</Button>
								</span>
							))}
						</div>
					</div>

					<div className="mt-6 flex justify-between gap-2 border-t pt-6">
						<Button type="button" onClick={onClose} className="w-full" variant="outline">
							Cancel
						</Button>

						<Button
							type="button"
							className="w-full"
							variant="filled"
							onClick={handleSubmit}
							disabled={selectedUsers.length === 0}
							loading={mutation.isPending}
						>
							Done
						</Button>
					</div>
				</div>
			</div>
		</>
	);
}
