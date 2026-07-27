import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import React, { useState } from "react";
import { useFormContext } from "react-hook-form";
import { IUpdateDailyJobFormSchema } from "../utils/create-daily-job-form";
import { IJobEmployeeAssignment } from "../types/schedule-interface";
import { Label } from "@/components/ui/label";
import { PencilLine } from "lucide-react";
import { Button } from "@/components/ui/button";
import { IoMdCheckmark } from "react-icons/io";
import { AiOutlineClose } from "react-icons/ai";
import { openErrorToast } from "@/components/toast";
import { useScheduleContext } from "../context/schedule-context";

const OverTimeField = () => {
	const formContext = useFormContext<IUpdateDailyJobFormSchema>();
	const jobEmployeeAssignments = formContext.watch("jobEmployeeAssignments");
	const { employees } = useScheduleContext();

	const handleAction = (updateAssignment: IJobEmployeeAssignment, action: boolean) => {
		formContext.setValue(
			"jobEmployeeAssignments",
			jobEmployeeAssignments.map((assignment) => {
				if (assignment.id === updateAssignment.id) {
					if (!assignment.endTime) {
						openErrorToast({ message: "You must log hours before approving overtime." });
						return assignment;
					}
					return { ...assignment, isOverTimeApproved: action };
				}
				return assignment;
			})
		);
	};

	return (
		<div className="mt-4 space-y-1">
			<Label>Overtime</Label>
			<div className="rounded-[10px] bg-brand-bgLightgrey px-4">
				<Table>
					<TableHeader>
						<TableRow>
							<TableHead>Crew Member</TableHead>
							<TableHead>Number of hours</TableHead>
							<TableHead className="text-center">Reason</TableHead>
							<TableHead className="text-center">Action</TableHead>
						</TableRow>
					</TableHeader>
					<TableBody>
						{jobEmployeeAssignments
							?.filter((assignment) => assignment.overTimeHours || assignment.overTimeMinutes)
							.map((assignment, index) => {
								const crewMember = employees?.find((employee) => employee.id === assignment.employeeId);

								return (
									<TableRow key={`${assignment.employeeId}-${index}`} className="text-sm">
										<TableCell className="text-sm">{crewMember?.user?.name}</TableCell>
										<TableCell>
											{assignment.overTimeHours} hours {assignment.overTimeMinutes} minutes
										</TableCell>
										<TableCell className="line-clamp-2 max-w-56 text-center">
											{assignment.overTimeReason || "No reason provided"}
										</TableCell>
										<ActionCell assignment={{ ...assignment, id: assignment.id! }} handleAction={handleAction} />
									</TableRow>
								);
							})}
					</TableBody>
				</Table>
			</div>
		</div>
	);
};

export default OverTimeField;

const ActionCell = ({
	assignment,
	handleAction,
}: {
	assignment: IJobEmployeeAssignment;
	handleAction: (assignment: IJobEmployeeAssignment, action: boolean) => void;
}) => {
	const [edit, setEdit] = useState(false);
	return (
		<TableCell>
			{!edit ? (
				<div className="flex items-center justify-center gap-2 text-center">
					<p>{assignment.isOverTimeApproved ? "Approved" : "Not Approved"}</p>
					<PencilLine size={16} className="cursor-pointer text-brand-dark50" onClick={() => setEdit(true)} />
				</div>
			) : (
				<div className="flex items-center justify-center gap-2 text-center">
					<Button
						className="h-6 w-6 rounded-sm p-0"
						type="button"
						variant="filled"
						onClick={() => {
							handleAction(assignment, true);
							setEdit(false);
						}}
					>
						<IoMdCheckmark />
					</Button>
					<Button
						className="h-6 w-6 rounded-sm p-0"
						type="button"
						variant="outline"
						onClick={() => {
							handleAction(assignment, false);
							setEdit(false);
						}}
					>
						<AiOutlineClose />
					</Button>
				</div>
			)}
		</TableCell>
	);
};
