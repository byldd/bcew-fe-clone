"use client";
import { Table, TableCell, TableBody, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import React, { useMemo, useState } from "react";
import { useFormContext } from "react-hook-form";
import { ICreateDailyJobFormSchema, IUpdateDailyJobFormSchema } from "../utils/create-daily-job-form";
import { Button } from "@/components/ui/button";
import { PencilLine, Trash } from "lucide-react";
import { Label } from "@/components/ui/label";
import { CgAddR } from "react-icons/cg";
import { SelectField } from "@/components/ui/selectField";
import { IoMdCheckmark } from "react-icons/io";
import { AiOutlineClose } from "react-icons/ai";
import { FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form";
import { toFormattedDate } from "@/lib/utils/date";
import { FORM_MODE } from "@/types";
import { useScheduleContext } from "../context/schedule-context";
import { sortJobEmployee } from "../utils/job-card";
import { IJobMembersFieldProps } from "../types/card-props";
import { DATE_FORMAT } from "@/types/date";
import TimeInput from "@/components/ui/time-input";
import { IQcRepairJobFormSchema } from "../utils/qc-job-form-schema";
import StopNumberInput from "@/components/ui/stop-number-input";
import { getJobEmployeeOptions } from "../utils/filter-data";

import { useTypedTranslations } from "@/i18n/useTypedTranslations";
import { NAMESPACE } from "@/i18n/type";

const JobMembersField = ({
	mode,
	canAddNewMember = true,
	specialJob,
	readOnly = false,
	bcewJob,
}: IJobMembersFieldProps) => {
	const formContext = useFormContext<ICreateDailyJobFormSchema | IQcRepairJobFormSchema | IUpdateDailyJobFormSchema>();
	const { jobEmployeeAssignments, crewLeaderId, taskLeaderId, date } = formContext.watch();
	const { employees, weekendWorks } = useScheduleContext();
	const tjobCards = useTypedTranslations(NAMESPACE.JOB_CARDS);

	const errors = formContext.formState.errors.jobEmployeeAssignments;

	const employeeOptions = useMemo(() => {
		const options = getJobEmployeeOptions({
			employees,
			specialJob,
			weekendWorks,
			date: date,
			jobPhase: bcewJob?.schlin?.tsknum || bcewJob?.schlinExtended?.tsknum,
			workOrder: bcewJob?.srvinv?.ordnum,
		});

		return options?.map((option) => ({
			...option,
			disabled:
				option.disabled || jobEmployeeAssignments?.some((assignment) => assignment.employeeId === option.employeeId),
			value: option.employeeId,
			label: option.employeeName,
		}));
	}, [employees, specialJob, weekendWorks, date, jobEmployeeAssignments, bcewJob]);

	const [isAdding, setIsAdding] = useState(false);
	const [newMemberId, setNewMemberId] = useState("");

	const commitNewMember = () => {
		const member = employeeOptions.find((m) => m.employeeId === newMemberId);
		formContext.setValue("jobEmployeeAssignments", [
			...(jobEmployeeAssignments || []),
			{
				employeeId: newMemberId,
				stopNumber: null,
				employeeName: member?.label,
			},
		]);
		setIsAdding(false);
		setNewMemberId("");
	};

	const cancelNewMember = () => {
		setIsAdding(false);
		setNewMemberId("");
	};

	const removeMember = (index: number) => {
		if (jobEmployeeAssignments?.length === 1) {
			formContext.setValue("crewLeaderId", "");
			formContext.setValue("taskLeaderId", "");
		}
		formContext.setValue(
			"jobEmployeeAssignments",
			jobEmployeeAssignments?.filter((_, i) => i !== index)
		);
	};

	const onSelectMember = (index: number, member: { memberId: string; memberName: string }) => {
		formContext.setValue(
			"jobEmployeeAssignments",
			jobEmployeeAssignments?.map((assignment, i) =>
				i === index ? { ...assignment, employeeId: member.memberId, employeeName: member.memberName } : assignment
			)
		);
	};

	return (
		<div className="space-y-2">
			<Label>{tjobCards.crewMember}</Label>
			<div className="rounded-[8px] bg-brand-bgLightgrey px-2">
				<Table>
					<TableHeader>
						<TableRow>
							<TableHead>{tjobCards.crewMember}</TableHead>
							<TableHead>{tjobCards.stopNumber}</TableHead>
							<TableHead>{tjobCards.timeLogs}</TableHead>
							{mode === FORM_MODE.EDIT && <TableHead>{tjobCards.overrideTimeLogs}</TableHead>}

							<TableHead>{tjobCards.action}</TableHead>
						</TableRow>
					</TableHeader>
					<TableBody>
						{sortJobEmployee({
							jobEmployees: jobEmployeeAssignments || [],
							crewLeaderId,
							taskLeaderId,
						}).map((assignment, index) => (
							<TableRow key={`${index}-${assignment.employeeId}`} className="text-sm">
								<TableCell className="text-center text-sm">
									<MemberCell
										selectMember={{
											id: assignment.employeeId,
											name: assignment.employeeName,
										}}
										onSelectMember={(member) => onSelectMember(index, member)}
										error={errors?.[index]?.employeeId?.message}
										employeeOptions={employeeOptions}
										isCrewLeader={crewLeaderId === assignment.employeeId}
										readOnly={readOnly}
									/>
								</TableCell>
								<TableCell className="text-center">
									<StopNumberCell readOnly={readOnly} index={index} />
								</TableCell>
								<TableCell className="text-center">
									<TimeCell assignment={assignment} />
								</TableCell>

								{mode === FORM_MODE.EDIT && (
									<TableCell className="text-center">
										<OverrideTimeCell
											assignment={assignment}
											index={index}
											mode={mode}
											date={date}
											readOnly={readOnly}
										/>
									</TableCell>
								)}

								<TableCell className="text-center">
									<Button
										disabled={readOnly}
										size={"sm"}
										type="button"
										variant={"ghost"}
										onClick={() => removeMember(index)}
									>
										<Trash size={2} />
									</Button>
								</TableCell>
							</TableRow>
						))}
					</TableBody>
				</Table>
			</div>

			{canAddNewMember && !readOnly && (
				<>
					{!isAdding ? (
						<Button className="!mt-4" size="sm" type="button" variant="filled" onClick={() => setIsAdding(true)}>
							<CgAddR /> {tjobCards.addNewMember}
						</Button>
					) : (
						<div className="!mt-4 flex w-full items-end gap-2">
							<SelectField
								label={tjobCards.searchMember}
								options={employeeOptions}
								placeholder={tjobCards.selectMember}
								value={newMemberId}
								onValueChange={(val) => setNewMemberId(val)}
								style={{ width: "calc(100% - 40px)" }}
							/>

							<Button
								className="h-11 w-11"
								type="button"
								variant="filled"
								disabled={!newMemberId}
								onClick={commitNewMember}
							>
								<IoMdCheckmark />
							</Button>
							<Button className="h-11 w-11" type="button" variant="outline" onClick={cancelNewMember}>
								<AiOutlineClose />
							</Button>
						</div>
					)}
				</>
			)}
		</div>
	);
};

export default JobMembersField;

const MemberCell = ({
	selectMember,
	onSelectMember,
	error,
	employeeOptions,
	isCrewLeader,
	readOnly,
}: {
	selectMember: { id: string; name?: string | null };
	onSelectMember: ({ memberId, memberName }: { memberId: string; memberName: string }) => void;
	error: string | undefined;
	employeeOptions: { value: string; label: string; disabled?: boolean }[];
	isCrewLeader?: boolean;
	readOnly?: boolean;
}) => {
	const [isEditing, setIsEditing] = useState(false);
	const [draftMemberId, setDraftMemberId] = useState(selectMember.id);
	const tjobCards = useTypedTranslations(NAMESPACE.JOB_CARDS);

	const startEdit = () => {
		setDraftMemberId(selectMember.id);
		setIsEditing(true);
	};

	const confirmEdit = () => {
		if (draftMemberId) {
			const member = employeeOptions.find((m) => m.value === draftMemberId);
			if (member) {
				onSelectMember({ memberId: member.value, memberName: member.label });
			}
		}
		setIsEditing(false);
	};

	const cancelEdit = () => {
		setIsEditing(false);
	};

	return (
		<div>
			{!isEditing ? (
				<div className="flex items-center justify-center gap-2">
					<p>{selectMember.name || "_"}</p>
					{!isCrewLeader && !readOnly && (
						<PencilLine size={16} className="cursor-pointer text-brand-dark50" onClick={startEdit} />
					)}
				</div>
			) : (
				<div className="flex items-center justify-center gap-2">
					<SelectField
						options={employeeOptions}
						value={draftMemberId}
						onValueChange={(val) => setDraftMemberId(val)}
						placeholder={tjobCards.selectMember}
						className="h-7 w-44 rounded-sm bg-white"
					/>
					<Button
						className="h-6 w-6 rounded-sm p-0"
						type="button"
						variant="filled"
						disabled={!draftMemberId}
						onClick={confirmEdit}
					>
						<IoMdCheckmark />
					</Button>
					<Button className="h-6 w-6 rounded-sm p-0" type="button" variant="outline" onClick={cancelEdit}>
						<AiOutlineClose />
					</Button>
				</div>
			)}
			{error && <p className="text-red-500">{error}</p>}
		</div>
	);
};

const TimeCell = ({ assignment }: { assignment: ICreateDailyJobFormSchema["jobEmployeeAssignments"][number] }) => {
	return (
		<div className="flex items-center justify-center gap-1">
			<p>
				{assignment.startTime ? `${toFormattedDate(assignment.startTime, DATE_FORMAT.HH_MM_AA_PM)}` : "__"} -
				{assignment.endTime ? `${toFormattedDate(assignment.endTime, DATE_FORMAT.HH_MM_AA_PM)}` : "__"}
			</p>
		</div>
	);
};

const OverrideTimeCell = ({
	assignment,
	index,
	mode,
	date,
	readOnly,
}: {
	assignment: IUpdateDailyJobFormSchema["jobEmployeeAssignments"][number];
	index: number;
	mode: FORM_MODE;
	date: Date | string;
	readOnly?: boolean;
}) => {
	const formContext = useFormContext<IUpdateDailyJobFormSchema>();
	const [isEditing, setIsEditing] = useState(false);

	return (
		<div className="flex items-center justify-center gap-1">
			{isEditing ? (
				<div className="flex min-w-full space-x-4">
					<FormField
						control={formContext.control}
						name={`jobEmployeeAssignments.${index}.overrideStartTime`}
						render={({ field }) => {
							return (
								<FormItem className="w-full">
									<FormControl>
										<TimeInput onChange={field.onChange} value={field.value || ""} date={date} />
									</FormControl>
									<FormMessage />
								</FormItem>
							);
						}}
					/>
					<FormField
						control={formContext.control}
						name={`jobEmployeeAssignments.${index}.overrideEndTime`}
						render={({ field }) => {
							return (
								<FormItem className="w-full">
									<FormControl>
										<TimeInput onChange={field.onChange} value={field.value || ""} date={date} />
									</FormControl>
									<FormMessage />
								</FormItem>
							);
						}}
					/>

					<div className="flex items-center gap-2">
						<Button
							className="h-6 w-6 rounded-sm p-0"
							type="button"
							variant="outline"
							onClick={() => setIsEditing(false)}
						>
							<IoMdCheckmark />
						</Button>
					</div>
				</div>
			) : (
				<p>
					{assignment.overrideStartTime
						? `${toFormattedDate(assignment.overrideStartTime, DATE_FORMAT.HH_MM_AA_PM)}`
						: "__"}{" "}
					-
					{assignment.overrideEndTime
						? ` - ${toFormattedDate(assignment.overrideEndTime, DATE_FORMAT.HH_MM_AA_PM)}`
						: "__"}
				</p>
			)}

			{mode === FORM_MODE.EDIT && !readOnly && (
				<PencilLine size={16} className="cursor-pointer text-brand-dark50" onClick={() => setIsEditing(true)} />
			)}
		</div>
	);
};

const StopNumberCell = ({ readOnly, index }: { readOnly?: boolean; index: number }) => {
	const formContext = useFormContext<IUpdateDailyJobFormSchema>();
	const tjobCards = useTypedTranslations(NAMESPACE.JOB_CARDS);

	return (
		<div className="relative flex items-center gap-2 text-center">
			<FormField
				control={formContext.control}
				name={`jobEmployeeAssignments.${index}.stopNumber`}
				render={({ field }) => {
					return (
						<FormItem className="w-full">
							<FormControl>
								<StopNumberInput
									disabled={readOnly}
									value={field.value ?? undefined}
									onChange={(stopNumber) => field.onChange(stopNumber)}
									placeholder={tjobCards.placeholders.stopNumber}
									className="mx-auto"
								/>
							</FormControl>
							<FormMessage />
						</FormItem>
					);
				}}
			/>
		</div>
	);
};
