import React, { useState, useMemo } from "react";
import { IValidationErrors } from "../types/schedule-interface";
import { bcewJobCardId, C_SCHEDULE_PUBLISH_ERROR_TITLE } from "../constants/week-schedule";
import {
	DropdownMenu,
	DropdownMenuTrigger,
	DropdownMenuContent,
	DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { DropdownMenuArrow } from "@radix-ui/react-dropdown-menu";
import { SelectField } from "@/components/ui/selectField";
import { useScheduleParams } from "../hooks/useScheduleParams";
import { Calendar } from "@/components/ui/calendar";
import { useGetValidationErrors } from "../hooks/useSchedule";
import { X } from "lucide-react";
import { filterValidationError } from "../utils/filter-validation-error";
import { Spinner } from "@/components/ui/spinner";
import { useModal } from "@/hooks/useModal";
import { EditJobModal } from "../modals/edit-job-modal";

const ValidationSheet = ({ errors, onClose }: { errors?: IValidationErrors[] | undefined; onClose: () => void }) => {
	const [filterType, setFilterType] = useState<string | null>(null);
	const [showTypeFilter, setShowTypeFilter] = useState(false);
	const [showDateFilter, setShowDateFilter] = useState(false);
	const { openModal, closeModal, Modal } = useModal();

	const { getParams } = useScheduleParams();
	const { startDate: paramStartDate, endDate: paramEndDate } = getParams();

	const [dateRange, setDateRange] = useState<{ startDate: Date; endDate: Date }>({
		startDate: paramStartDate || null,
		endDate: paramEndDate || null,
	});
	const { data, isLoading } = useGetValidationErrors(
		{
			...dateRange,
		},
		!errors
	);

	const errorsToShow = useMemo(() => {
		if (!errors) {
			return data ?? [];
		}
		return errors ?? [];
	}, [data, errors]);

	const filteredErrors = useMemo(
		() =>
			/**
			 * Handling the filter logic based on task type in FE, because getting error from BE is heavy task
			 */
			filterValidationError({
				errorsToShow,
				filterType,
				dateRange,
				paramStartDate,
				paramEndDate,
			}),
		[errorsToShow, filterType, dateRange, paramStartDate, paramEndDate]
	);

	const activeFilterCount = filterType ? filteredErrors.length : 0;

	const typeOptions = Object.keys(C_SCHEDULE_PUBLISH_ERROR_TITLE).map((type) => {
		const label = C_SCHEDULE_PUBLISH_ERROR_TITLE[type as keyof typeof C_SCHEDULE_PUBLISH_ERROR_TITLE];
		return {
			label: label || type,
			value: type,
		};
	});

	const handleTakeAction = (error: IValidationErrors) => {
		if (error?.dailyJobId) {
			openModal({
				modalView: <EditJobModal dailyJobId={error.dailyJobId} closeModal={closeModal} />,
				modalTitle: error.jobSiteName,
				variant: "medium",
			});
		}
		if (error?.bcewScheduledJobId) {
			const element = document.getElementById(bcewJobCardId(error.bcewScheduledJobId));

			if (element) {
				element.scrollIntoView({ behavior: "smooth", block: "center" });
			}
		}
	};

	return (
		<div>
			<Modal />
			<div className="flex items-center gap-5">
				<div className="mb-2 flex flex-1 items-center justify-between">
					<p className="text-lg font-medium">
						Validation Errors <span className="text-brand-dark50">({errorsToShow.length})</span>
					</p>
					<DropdownMenu>
						<DropdownMenuTrigger asChild>
							<Button
								className="relative my-2 h-10 w-10 rounded-[10px] border border-brand-dark10 bg-white p-0 hover:bg-white"
								variant={"outline"}
							>
								<Image src={"/assets/svg/filter.svg"} alt={"filter"} width={25} height={25} />
								{activeFilterCount > 0 && (
									<span className="absolute -right-1 -top-1 flex h-4 min-w-[1rem] items-center justify-center rounded-full bg-red-500 text-xs font-bold text-white">
										{activeFilterCount}
									</span>
								)}
							</Button>
						</DropdownMenuTrigger>
						<DropdownMenuContent
							align="end"
							className="min-w-[300px] rounded-[10px] border-none p-2 shadow-[-4px_4px_12px_0px_#21212140]"
						>
							<DropdownMenuArrow className="fill-white" />
							<DropdownMenuLabel
								className="cursor-pointer text-sm font-medium"
								onClick={() => setShowTypeFilter((v) => !v)}
							>
								Filter by type
							</DropdownMenuLabel>
							{showTypeFilter && (
								<SelectField
									placeholder="Select type"
									options={typeOptions}
									value={filterType || ""}
									onValueChange={(val) => {
										setFilterType(val || null);
									}}
									className="mb-2 mt-1"
								/>
							)}
							{filterType && (
								<Button variant="outline" size="sm" className="h-11 w-full" onClick={() => setFilterType(null)}>
									Clear type filter
								</Button>
							)}
							<div className="mt-3 border-t border-gray-200 pt-3">
								<DropdownMenuLabel
									className="flex cursor-pointer items-center gap-2 text-sm font-medium"
									onClick={() => setShowDateFilter((v) => !v)}
								>
									Filter by Date
								</DropdownMenuLabel>
								{showDateFilter && (
									<div className="date-range-calender p-2">
										<Calendar
											mode="range"
											selected={{
												from: dateRange.startDate || undefined,
												to: dateRange.endDate || undefined,
											}}
											onSelect={(range) => {
												if (range?.from && range?.to) {
													setDateRange({ startDate: range.from, endDate: range.to });
												} else if (range?.from) {
													setDateRange({ startDate: range.from, endDate: paramEndDate });
												} else {
													setDateRange({ startDate: paramStartDate, endDate: paramEndDate });
												}
											}}
											className="w-full rounded-md border"
											numberOfMonths={1}
										/>
										{(dateRange.startDate || dateRange.endDate) && (
											<Button
												variant="outline"
												size="sm"
												className="mt-2 h-11 w-full"
												onClick={() => setDateRange({ startDate: paramStartDate, endDate: paramEndDate })}
											>
												Clear date filter
											</Button>
										)}
									</div>
								)}
							</div>
						</DropdownMenuContent>
					</DropdownMenu>
				</div>
				<X
					className="mb-4 h-6 w-6 cursor-pointer rounded-full border border-brand-dark50 bg-brand-dark p-1 text-white"
					onClick={onClose}
				/>
			</div>

			{isLoading ? (
				<Spinner />
			) : (
				<div className="space-y-2">
					{filteredErrors.map((error, idx) => (
						<div key={idx} className="border-b p-2">
							<p className="font-inter text-sm font-medium text-brand-black50">
								{C_SCHEDULE_PUBLISH_ERROR_TITLE[error.type || ""] || ""}
							</p>
							<p className="font-inter text-xs font-normal text-brand-black50">{error.message}</p>
							<div className="my-1 flex items-center justify-between">
								{(error?.dailyJobId || error?.bcewScheduledJobId) && (
									<Button
										onClick={() => handleTakeAction(error)}
										className="my-1 text-sm font-medium text-brand-dark underline underline-offset-4"
									>
										Take Action
									</Button>
								)}
							</div>
						</div>
					))}
				</div>
			)}
		</div>
	);
};

export default ValidationSheet;
