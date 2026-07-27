"use client";
import React, { useMemo, useState } from "react";
import { ITaskFiltersModalProps } from "../types/schedule-interface";
import { Button } from "@/components/ui/button";
import { useModal } from "@/hooks/useModal";
import { useScheduleParams } from "../hooks/useScheduleParams";
import { Label } from "@/components/ui/label";
import { DatePicker } from "@/components/ui/date-picker";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import Image from "next/image";
import JobLabelField from "../components/job-label-field";
import { Switch } from "@/components/ui/switch";
import { useScheduleContext } from "../context/schedule-context";
import { SelectField } from "@/components/ui/selectField";
import { useTypedTranslations } from "@/i18n/useTypedTranslations";
import { NAMESPACE } from "@/i18n/type";

const TaskFiltersModal: React.FC<ITaskFiltersModalProps> = ({ onClose }) => {
	const { getParams, setParams, clearParams } = useScheduleParams();
	const { subcontractors, crews } = useScheduleContext();

	const subcontractorCrewOptions = useMemo(() => {
		const crewOptions: { label: string; value: string }[] = [];
		subcontractors?.forEach((subcontractor) => {
			subcontractor.crews.forEach((crew) => {
				crewOptions.push({
					label: crew.name,
					value: crew.id,
				});
			});
		});
		return crewOptions;
	}, [subcontractors]);

	const crewOptions = useMemo(() => {
		return crews?.map((crew) => ({
			label: crew.name,
			value: crew.crewLeaderId,
		}));
	}, [crews]);

	const {
		startDate: paramsStartDate,
		endDate: paramsEndDate,
		labelIds: paramsLabelIds,
		withAssignments: paramsWithAssignments,
		startInRange: paramsStartInRange,
		subcontractorCrewId: paramsSubcontractorCrewId,
		stopNotInSequence: paramsStopNotInSequence,
		crewLeaderId: paramsCrewLeaderId,
	} = getParams();

	const [labelIds, setLabelIds] = useState(paramsLabelIds);
	const [startDate, setStartDate] = useState(paramsStartDate ? new Date(paramsStartDate) : undefined);
	const [endDate, setEndDate] = useState(paramsEndDate ? new Date(paramsEndDate) : undefined);
	const [withAssignments, setWithAssignments] = useState(paramsWithAssignments);
	const [startInRange, setStartInRange] = useState(paramsStartInRange);
	const [subcontractorCrewId, setSubcontractorCrewId] = useState(paramsSubcontractorCrewId);
	const [stopNotInSequence, setStopNotInSequence] = useState(paramsStopNotInSequence);
	const [crewLeaderId, setCrewLeaderId] = useState(paramsCrewLeaderId);
	const tschedule = useTypedTranslations(NAMESPACE.SCHEDULE);
	const tCommon = useTypedTranslations(NAMESPACE.COMMON);

	const handleApply = () => {
		setParams({
			labelIds,
			startDate,
			endDate,
			withAssignments,
			startInRange,
			stopNotInSequence,
			subcontractorCrewId,
			crewLeaderId,
		});
		onClose();
	};

	const handleClearAll = () => {
		clearParams();
		onClose();
	};

	return (
		<div>
			<div className="mb-4 space-y-2">
				<Label className="text-sm font-medium text-brand-dark60">{tschedule.jobStatus}</Label>
				<JobLabelField
					onChange={(value) => {
						setLabelIds(value);
					}}
					value={labelIds ?? []}
				/>

				<SelectField
					placeholder={tschedule.selectSubcontractorCrew}
					label={tschedule.subcontractorCrew}
					options={subcontractorCrewOptions}
					value={subcontractorCrewId}
					onValueChange={(value) => setSubcontractorCrewId(value)}
				/>

				<SelectField
					placeholder={tschedule.selectHourlyCrew}
					label={tschedule.hourlyCrew}
					options={crewOptions}
					value={crewLeaderId}
					onValueChange={(value) => setCrewLeaderId(value)}
				/>
			</div>

			<div className="mb-4 flex items-center justify-between gap-2">
				<Label>{tschedule.jobsScheduledDuringSelectedDates}</Label>
				<Switch checked={withAssignments} onCheckedChange={() => setWithAssignments(!withAssignments)} />
			</div>

			<div className="mb-4 flex items-center justify-between gap-2">
				<Label>{tschedule.jobsStartingInSelectedDates}</Label>
				<Switch checked={startInRange} onCheckedChange={() => setStartInRange(!startInRange)} />
			</div>

			<div className="mb-4 flex items-center justify-between gap-2">
				<Label>{tschedule.jobsStopNumberNotInSequence}</Label>
				<Switch checked={stopNotInSequence} onCheckedChange={() => setStopNotInSequence(!stopNotInSequence)} />
			</div>

			<div className="mb-4 flex gap-4">
				<div className="w-1/2">
					<Label htmlFor="startDate" className="text-sm font-medium text-brand-dark60">
						{tCommon.startDate}
					</Label>
					<DatePicker value={startDate} onChange={setStartDate} />
				</div>
				<div className="w-1/2">
					<Label htmlFor="endDate" className="text-sm font-medium text-brand-dark60">
						{tCommon.endDate}
					</Label>
					<DatePicker value={endDate} onChange={setEndDate} />
				</div>
			</div>

			<div className="sticky bottom-0 z-10 flex items-center justify-end gap-2 bg-white pt-4">
				<Button onClick={handleClearAll} variant={"outline"} className="w-full">
					{tCommon.clearAll}
				</Button>
				<Button variant={"filled"} onClick={handleApply} className="w-full">
					{tCommon.apply}
				</Button>
			</div>
		</div>
	);
};

const TaskFiltersModalTrigger = () => {
	const { openModal, closeModal, Modal } = useModal();
	const tschedule = useTypedTranslations(NAMESPACE.SCHEDULE);
	const tCommon = useTypedTranslations(NAMESPACE.COMMON);
	return (
		<>
			<Tooltip>
				<TooltipTrigger asChild>
					<Button
						className="h-10 w-10 rounded-[10px] border border-brand-dark10 bg-white p-0 hover:bg-white 3xl:h-[80px] 3xl:w-[80px]"
						variant={"outline"}
						onClick={() =>
							openModal({
								variant: "medium",
								modalView: <TaskFiltersModal onClose={closeModal} />,
								modalTitle: tschedule.taskFilters,
								subHeader: tschedule.taskFiltersDescription,
							})
						}
					>
						<Image
							src={"/assets/svg/filter.svg"}
							alt={"filter"}
							width={28}
							height={28}
							className="3xl:h-[56px] 3xl:w-[56px]"
						/>
					</Button>
				</TooltipTrigger>
				<TooltipContent>
					<p>{tCommon.filter}</p>
				</TooltipContent>
			</Tooltip>
			<Modal />
		</>
	);
};

export default TaskFiltersModalTrigger;
