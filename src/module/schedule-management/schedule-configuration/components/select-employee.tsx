import { useState } from "react";
import { Check, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Checkbox } from "@/components/ui/checkbox";
import { useTypedTranslations } from "@/i18n/useTypedTranslations";
import { NAMESPACE } from "@/i18n/type";
import { ICrewsResponse } from "@/module/crew/types";
import { ITeam } from "@/module/team/types";
import { Badge } from "@/components/ui/badge";
import { IGetUsersResponse } from "@/module/employee/types";
import { EMPLOYEE_PHASES } from "@/module/employee/constants";
import { formatSnakeCase } from "@/lib/utils/value-formatter";
import { se } from "date-fns/locale";

export const SelectEmployee = ({
	users,
	disabled = false,
	onChange,
	userValue = [],
	crews,
	teams,
	onChangeTeam,
	onChangeCrew,
	teamValue,
	crewValue,
	selectedPhase,
	onChangePhase,
}: {
	users: IGetUsersResponse["items"];
	disabled?: boolean;
	onChange: (value: string[]) => void;
	userValue: string[];
	crews: ICrewsResponse["items"];
	teams: Pick<ITeam, "name" | "id">[];
	onChangeTeam: (teamIds: string[]) => void;
	onChangeCrew: (crewIds: string[]) => void;
	teamValue: string[];
	crewValue: string[];
	selectedPhase: string[];
	onChangePhase: (phaseIds: string[]) => void;
}) => {
	const [crewSelectOpen, setCrewSelectOpen] = useState(false);
	const handleEmployeeToggle = (id: string) => {
		if (userValue?.includes(id)) {
			onChange(userValue?.filter((userId) => userId !== id));
		} else {
			onChange([...userValue, id]);
		}
	};

	const phaseOptions = Object.keys(EMPLOYEE_PHASES)?.map((key) => ({
		id: EMPLOYEE_PHASES[key as unknown as number] || "",
		name: formatSnakeCase(EMPLOYEE_PHASES[key as unknown as number]) || "",
	}));

	const filterUsers = users?.filter((user) => user.employee);

	const tschedule = useTypedTranslations(NAMESPACE.SCHEDULE);

	const handleTeamToggle = (selectedTeamId: string) => {
		const usersInTeam = filterUsers?.filter((user) => user.teamId === selectedTeamId);

		if (teamValue?.includes(selectedTeamId)) {
			onChangeTeam(teamValue?.filter((teamId) => teamId !== selectedTeamId));
			onChange(userValue?.filter((userId) => !usersInTeam?.some((user) => user.id === userId)));
		} else {
			onChangeTeam([...teamValue, selectedTeamId]);
			onChange(
				[...userValue, ...usersInTeam?.map((user) => user.id)]?.filter(
					(value, index, self) => self.indexOf(value) === index
				)
			);
		}
	};

	const handleCrewToggle = (selectedCrewId: string) => {
		const crew = crews.find((crew) => crew.id === selectedCrewId);
		const crewMembers = filterUsers?.filter((user) =>
			crew?.crewEmployees?.some((crewEmployee) => crewEmployee.employee.user.id === user.id)
		);

		if (crewValue?.includes(selectedCrewId)) {
			onChangeCrew(crewValue?.filter((crewId) => crewId !== selectedCrewId));
			onChange(userValue?.filter((userId) => !crewMembers?.some((user) => user.id === userId)));
		} else {
			onChangeCrew([...crewValue, selectedCrewId]);
			onChange(
				[...userValue, ...crewMembers?.map((user) => user.id)]?.filter(
					(value, index, self) => self.indexOf(value) === index
				)
			);
		}
	};

	const handlePhaseToggle = (selectedPhaseId: string) => {
		const usersInPhase = filterUsers?.filter((user) =>
			JSON.parse(user.phases || "[]")?.some((phase: string) => phase === selectedPhaseId)
		);

		const remainingSelectedPhase = selectedPhase?.filter((phaseId) => phaseId !== selectedPhaseId);

		if (selectedPhase?.includes(selectedPhaseId)) {
			// Remove phase
			onChangePhase(remainingSelectedPhase);
			onChange(
				userValue?.filter(
					(userId) =>
						!usersInPhase?.some(
							(user) =>
								user.id === userId &&
								!JSON.parse(user.phases || "[]")?.some((phase: string) => remainingSelectedPhase?.includes(phase))
						)
				)
			);
		} else {
			// Add phase
			onChangePhase([...selectedPhase, selectedPhaseId]);
			onChange(
				[...userValue, ...usersInPhase?.map((user) => user.id)]?.filter(
					(value, index, self) => self.indexOf(value) === index
				)
			);
		}
	};

	return (
		<div className="space-y-3">
			<Popover open={crewSelectOpen} onOpenChange={setCrewSelectOpen}>
				<PopoverTrigger asChild>
					<Button
						disabled={filterUsers?.length === 0 || disabled}
						variant="outline"
						role="combobox"
						aria-expanded={crewSelectOpen}
						className="h-10 w-full justify-between rounded-[10px] border-none bg-brand-bgLightgrey text-sm"
					>
						<span className="text-sm font-normal text-gray-500">{tschedule.searchByName}</span>
						<ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
					</Button>
				</PopoverTrigger>
				<PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0" align="start">
					<Command>
						<CommandInput placeholder="Search crew members" />
						<CommandList className="max-h-[300px] overflow-y-auto">
							<CommandEmpty>{tschedule.noCrewMemberFound}</CommandEmpty>

							<CommandGroup heading="Phases">
								{phaseOptions?.map((phase) => (
									<CommandItem key={phase.id} onSelect={() => handlePhaseToggle(phase.id)}>
										<Checkbox checked={selectedPhase?.includes(phase.id)} />
										<span>{phase.name}</span>
										{selectedPhase?.includes(phase.id) && <Check className="ml-auto h-4 w-4" />}
									</CommandItem>
								))}
							</CommandGroup>

							<CommandGroup heading="Teams">
								{teams?.map((team) => (
									<CommandItem key={team.id} onSelect={() => handleTeamToggle(team.id)}>
										<Checkbox checked={teamValue?.includes(team.id)} />
										<span>{team.name}</span>
										{teamValue?.includes(team.id) && <Check className="ml-auto h-4 w-4" />}
									</CommandItem>
								))}
							</CommandGroup>

							<CommandGroup heading="Crews">
								{crews?.map((crew) => (
									<CommandItem key={crew.id} onSelect={() => handleCrewToggle(crew.id)}>
										<Checkbox checked={crewValue?.includes(crew.id)} />
										<span>{crew.name}</span>
										{crewValue?.includes(crew.id) && <Check className="ml-auto h-4 w-4" />}
									</CommandItem>
								))}
							</CommandGroup>

							<CommandGroup heading="Members">
								{/* all */}
								<CommandItem
									onSelect={() =>
										userValue?.length === filterUsers?.length
											? onChange([])
											: onChange(filterUsers?.map((user) => user.id))
									}
									className="flex items-center space-x-2"
								>
									<Checkbox checked={userValue?.length === filterUsers?.length} />
									<span>{tschedule.all}</span>
									{userValue?.length === filterUsers?.length && <Check className="ml-auto h-4 w-4" />}
								</CommandItem>

								{filterUsers?.map((user) => (
									<CommandItem
										key={user.id}
										onSelect={() => handleEmployeeToggle(user.id)}
										className="flex items-center space-x-2"
									>
										<Checkbox checked={userValue?.includes(user.id)} />
										<span>{user.name}</span>
										{userValue?.includes(user.id) && <Check className="ml-auto h-4 w-4" />}
									</CommandItem>
								))}
							</CommandGroup>
						</CommandList>
					</Command>
				</PopoverContent>
			</Popover>

			<div className="flex max-h-[150px] flex-wrap gap-2 overflow-y-scroll">
				{userValue?.map((userId) => (
					<Badge key={userId}>{filterUsers?.find((user) => user.id === userId)?.name}</Badge>
				))}
			</div>
		</div>
	);
};
