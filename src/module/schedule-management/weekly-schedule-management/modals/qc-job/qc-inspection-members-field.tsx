"use client";
import { Table, TableCell, TableBody, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import React, { useMemo, useState } from "react";
import { useFormContext } from "react-hook-form";
import { ICreateDailyJobFormSchema } from "@/module/schedule-management/weekly-schedule-management/utils/create-daily-job-form";
import { Button } from "@/components/ui/button";
import { PencilLine, Trash } from "lucide-react";
import { Label } from "@/components/ui/label";
import { CgAddR } from "react-icons/cg";
import { Option, SelectField } from "@/components/ui/selectField";
import { IoMdCheckmark } from "react-icons/io";
import { AiOutlineClose } from "react-icons/ai";
import { FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form";
import { toFormattedDate } from "@/lib/utils/date";
import { FORM_MODE } from "@/types";
import { useScheduleContext } from "../../context/schedule-context";
import { IQcInspectionJobFormSchema } from "../../utils/qc-job-form-schema";
import StopNumberInput from "@/components/ui/stop-number-input";
import TimeInput from "@/components/ui/time-input";
import { DATE_FORMAT } from "@/types/date";
import { getFormanOptions } from "../../utils/member-form";
import { useTypedTranslations } from "@/i18n/useTypedTranslations";
import { NAMESPACE } from "@/i18n/type";

const QCInspectionJobMembersField = ({ mode, readOnly = false }: { mode: FORM_MODE; readOnly?: boolean }) => {
	const formContext = useFormContext<IQcInspectionJobFormSchema>();
	const { jobEmployeeAssignments } = formContext.watch();
	const tjobCards = useTypedTranslations(NAMESPACE.JOB_CARDS);

	const errors = formContext.formState.errors.jobEmployeeAssignments;

	const { inspectionForeman } = useScheduleContext();

	const inspectionForemanOptions = useMemo(() => {
		return getFormanOptions(inspectionForeman);
	}, [inspectionForeman]);

	const [isAdding, setIsAdding] = useState(false);
	const [newMemberId, setNewMemberId] = useState("");

	const commitNewForeman = (newForemanId: string) => {
		const foreman = inspectionForemanOptions.find((m) => m.value === newForemanId);

		if (foreman) {
			formContext.setValue("jobEmployeeAssignments", [
				{
					employeeId: foreman?.value as string,
					employeeName: foreman?.label,
				},
			]);

			setIsAdding(false);
			setNewMemberId("");
		}
	};

	const cancelNewMember = () => {
		setIsAdding(false);
		setNewMemberId("");
	};

	const removeMember = (index: number) => {
		formContext.setValue(
			"jobEmployeeAssignments",
			jobEmployeeAssignments?.filter((_, i) => i !== index)
		);
	};

	return (
		<div className="space-y-1">
			<Label className="text-brand-dark60">{tjobCards.foreman}</Label>
			<div className="rounded-[10px] bg-brand-bgLightgrey px-4">
				<Table className="w-full text-sm">
					<TableHeader>
						<TableRow>
							<TableHead>{tjobCards.foreman}</TableHead>
							<TableHead>{tjobCards.stopNumber}</TableHead>
							<TableHead>{tjobCards.timeLogs}</TableHead>
							{mode === FORM_MODE.EDIT && <TableHead>{tjobCards.overrideTimeLogs}</TableHead>}

							<TableHead>{tjobCards.action}</TableHead>
						</TableRow>
					</TableHeader>
					<TableBody>
						{jobEmployeeAssignments?.map((assignment, index) => (
							<TableRow key={`${index}-${assignment.employeeId}`} className="text-sm">
								<TableCell className="text-sm">
									<MemberCell
										selectMember={{
											employeeId: assignment.employeeId,
											name: assignment.employeeName,
										}}
										onSelectForeman={(option) => commitNewForeman(option.value as string)}
										error={errors?.[index]?.employeeId?.message}
										foremanOptions={inspectionForemanOptions}
										readOnly={readOnly}
									/>
								</TableCell>
								<TableCell>
									<StopNumberCell index={index} readOnly={readOnly} />
								</TableCell>
								<TableCell>
									<TimeCell assignment={assignment} />
								</TableCell>
								<TableCell>
									<OverrideTimeCell assignment={assignment} index={index} mode={mode} readOnly={readOnly} />
								</TableCell>

								<TableCell>
									<Button
										disabled={readOnly}
										className="ml-4"
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

			{!jobEmployeeAssignments?.length && !readOnly && (
				<>
					{!isAdding ? (
						<Button className="!mt-4" size="sm" type="button" variant="filled" onClick={() => setIsAdding(true)}>
							<CgAddR /> {tjobCards.addNewMember}
						</Button>
					) : (
						<div className="!mt-4 flex w-full items-end gap-2">
							<SelectField
								label={tjobCards.searchMember}
								options={inspectionForemanOptions}
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
								onClick={() => commitNewForeman(newMemberId)}
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

export default QCInspectionJobMembersField;

const MemberCell = ({
	selectMember,
	onSelectForeman,
	error,
	foremanOptions,
	readOnly = false,
}: {
	selectMember: { employeeId: string; name?: string | null };
	onSelectForeman: (option: Option) => void;
	error: string | undefined;
	foremanOptions: Option[];
	readOnly?: boolean;
}) => {
	const [isEditing, setIsEditing] = useState(false);
	const tjobCards = useTypedTranslations(NAMESPACE.JOB_CARDS);

	const selectedForeman = foremanOptions.find((m) => m.value === selectMember.employeeId);
	const [draftForemanId, setDraftForemanId] = useState(selectedForeman?.value);

	const startEdit = () => {
		setDraftForemanId(selectedForeman?.value);
		setIsEditing(true);
	};

	const confirmEdit = () => {
		if (draftForemanId) {
			const newForeman = foremanOptions.find((m) => m.value === draftForemanId);
			if (newForeman) {
				onSelectForeman(newForeman);
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
				<div className="ml-4 flex items-center gap-2">
					<p>{selectedForeman?.label || "_"}</p>
					{!readOnly && <PencilLine size={16} className="cursor-pointer text-brand-dark50" onClick={startEdit} />}
				</div>
			) : (
				<div className="flex items-center gap-2">
					<SelectField
						options={foremanOptions}
						value={draftForemanId}
						onValueChange={(val) => setDraftForemanId(val)}
						placeholder={tjobCards.selectMember}
						className="h-7 w-44 rounded-sm bg-white"
					/>
					<Button
						className="h-6 w-6 rounded-sm p-0"
						type="button"
						variant="filled"
						disabled={!draftForemanId}
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
		<div className="ml-4 flex items-center gap-1">
			<p className="text-nowrap text-xs">
				{assignment.startTime ? `${toFormattedDate(assignment.startTime, DATE_FORMAT.HH_MM_AA_PM)}` : "__"} -
				{assignment.endTime ? `${toFormattedDate(assignment.endTime, DATE_FORMAT.HH_MM_AA_PM)}` : "__"}
			</p>
		</div>
	);
};

const StopNumberCell = ({ readOnly = false, index }: { readOnly?: boolean; index: number }) => {
	const formContext = useFormContext<IQcInspectionJobFormSchema>();
	const tjobCards = useTypedTranslations(NAMESPACE.JOB_CARDS);

	return (
		<div className="relative ml-4 flex items-center gap-2">
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

const OverrideTimeCell = ({
	assignment,
	index,
	mode,
	readOnly = false,
}: {
	assignment: IQcInspectionJobFormSchema["jobEmployeeAssignments"][number];
	index: number;
	mode: FORM_MODE;
	readOnly?: boolean;
}) => {
	const formContext = useFormContext<IQcInspectionJobFormSchema>();
	const [isEditing, setIsEditing] = useState(false);
	const jobDate = formContext.watch("date");
	return (
		<div className="ml-4 flex items-center gap-1">
			{isEditing ? (
				<div className="flex min-w-full">
					<FormField
						control={formContext.control}
						name={`jobEmployeeAssignments.${index}.overrideStartTime`}
						render={({ field }) => {
							return (
								<FormItem className="w-full">
									<FormControl>
										<TimeInput onChange={field.onChange} value={field.value || ""} date={jobDate} />
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
										<TimeInput onChange={field.onChange} value={field.value || ""} date={jobDate} />
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
					{assignment.overrideStartTime && assignment.overrideEndTime
						? `${toFormattedDate(assignment.overrideStartTime, DATE_FORMAT.HH_MM_AA_PM)} - ${toFormattedDate(assignment.overrideEndTime, DATE_FORMAT.HH_MM_AA_PM)}`
						: "_"}
				</p>
			)}

			{mode === FORM_MODE.EDIT && !readOnly && (
				<PencilLine size={16} className="cursor-pointer text-brand-dark50" onClick={() => setIsEditing(true)} />
			)}
		</div>
	);
};
