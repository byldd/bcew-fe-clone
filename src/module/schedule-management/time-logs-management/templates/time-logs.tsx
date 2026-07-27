"use client";
import React, { useEffect, useMemo, useState } from "react";
import DatePickModal from "@/module/schedule-management/time-logs-management/components/date-pick-modal";
import { timeLogsTableHeaders, ALL_EMPLOYEES_KEY } from "../utils/constants";
import { ChevronDown, ChevronUp, Info, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableHead, TableHeader, TableRow, TableCell } from "@/components/ui/table";
import { useRouter, useSearchParams } from "next/navigation";
import { routes } from "@/config/routes";
import { useTimeLogsParams } from "../hooks/useTimeLogsParams";
import { useTimeLogs } from "../hooks/useTimeLogs";
import { calculateTotalExtendedHours, calculateDayStartEndTimes } from "../utils";
import { useModal } from "@/hooks/useModal";
import ErrorMessageComponent from "@/components/get-error-message";

import { ACCESS_LEVEL } from "@/module/employee/enums";
import SectionHeader from "@/components/shared/section-header";
import { ViewNoteModal } from "../components/view-note-modal";
import { ViewPauseModal } from "../components/view-pause-modal";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { TimeLogHeaders } from "../utils/enums";
import EmployeeStopDetails from "../components/employee-stop-details";
import { dateToUTCString, toFormattedDate } from "@/lib/utils/date";
import { DATE_FORMAT } from "@/types/date";
import { ViewExtendedTimes } from "../components/view-extended-times";
import { Spinner } from "@/components/ui/spinner";
import { calculateDayHours, calculatePause } from "../utils/calculate-hours";
import LatenessDetectionButton from "@/module/schedule-management/lateness-detection/components/lateness-detection-button";
import { ViewMiddayStop } from "../components/view-midday-stop";
import { useTypedTranslations } from "@/i18n/useTypedTranslations";
import { NAMESPACE } from "@/i18n/type";
import { useAdminPageAccessContext } from "@/module/admin/context/page-access";
import { useGetUserModuleAccess } from "@/module/profile/hooks/useProfile";
import { MODULE } from "@/utils/enums";
import { isProductionEnv } from "@/utils";
import { useTeams } from "@/module/team/hooks/useTeams";
import { sortTeamsByDisplayOrder } from "@/module/schedule-management/roster-time-configuration/utils";
// import AttendanceRecordsButton from "../../lateness-detection/components/attendance-records-button";

const TimeLogs = () => {
	const [expandedRows, setExpandedRows] = useState<number[]>([]);
	const [searchTerm, setSearchTerm] = useState<string>("");
	const { Modal, closeModal, openModal } = useModal();

	const tCommon = useTypedTranslations(NAMESPACE.COMMON);
	const tTimeLogs = useTypedTranslations(NAMESPACE.TIME_LOGS);
	const tSchedule = useTypedTranslations(NAMESPACE.SCHEDULE);
	const tEmployeeRoster = useTypedTranslations(NAMESPACE.EMPLOYEE_ROSTER);

	const { pageAccess } = useAdminPageAccessContext();
	const { data: moduleAccessLevel } = useGetUserModuleAccess(MODULE.TIME_LOGS);

	const accessLevel = isProductionEnv() ? moduleAccessLevel?.data.accessLevel : pageAccess?.accessLevel;

	const isTimeLogsEditAccess = accessLevel === ACCESS_LEVEL?.WRITE;

	const router = useRouter();

	const handleToggleRow = (idx: number) =>
		setExpandedRows((prev) => (prev.includes(idx) ? prev.filter((i) => i !== idx) : [...prev, idx]));

	const handleGPSButtonClick = () => {
		router.push(routes.admin.gpsTab);
	};

	const { getParams, setParams } = useTimeLogsParams();

	const { startDate, userName, activeTeam } = getParams();

	const { data: teams } = useTeams();

	const { data, isPending, isError, error, refetch } = useTimeLogs({
		startDate: dateToUTCString(startDate),
	});

	const filteredData = useMemo(() => {
		if (!data) return data;

		const term = searchTerm.toLowerCase() || userName?.toLowerCase();
		const isTeamFiltered = !!activeTeam && activeTeam !== ALL_EMPLOYEES_KEY;

		return data.filter((row) => {
			if (isTeamFiltered && row.team?.id !== activeTeam) return false;
			if (!term) return true;

			const employeeMatch = row?.employeeName?.toLowerCase().includes(term);
			const jobMatch = row?.jobs?.some((job) => job?.shtnme?.toLowerCase().includes(term));
			return employeeMatch || jobMatch;
		});
	}, [data, searchTerm, userName, activeTeam]);
	const searchParams = useSearchParams();

	const paramEmployeeId = searchParams.get("employeeId");

	useEffect(() => {
		// scroll to empoyeeId
		const element = document.getElementById(`${paramEmployeeId}`);
		if (element) {
			element.scrollIntoView({ behavior: "smooth", block: "start" });
		}
	}, [paramEmployeeId, data]);

	if (isError) return ErrorMessageComponent({ error });

	return (
		<div className="mb-4 flex flex-col gap-3">
			<div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between lg:flex-nowrap lg:justify-between">
				<div className="flex items-center gap-4">
					<SectionHeader title={tCommon.timeLogs} />
					<DatePickModal />
				</div>
				<div className="no-scrollbar overflow-x-auto">
					<div className="flex min-w-max items-center justify-end gap-2">
						<LatenessDetectionButton />

						{/* <AttendanceRecordsButton /> */}

						<div className="search-bar flex gap-2 py-1">
							<Input
								className="h-10 w-[220px] bg-white"
								icon={<Search className="h-4 w-4 text-muted-foreground" />}
								iconPosition="left"
								type="text"
								placeholder={tSchedule.searchByEmployeeName}
								value={searchTerm}
								onChange={(e) => setSearchTerm(e.target.value)}
							/>
							<Button variant="filled" onClick={handleGPSButtonClick} className="h-10 w-[70px]">
								{tTimeLogs.gps}
							</Button>
						</div>
					</div>
				</div>
			</div>

			{teams && teams.length > 0 && (
				<div className="no-scrollbar overflow-x-auto">
					<div className="flex min-w-max items-center gap-2">
						<Button
							variant={!activeTeam || activeTeam === ALL_EMPLOYEES_KEY ? "filled" : "outline"}
							onClick={() => setParams({ activeTeam: ALL_EMPLOYEES_KEY })}
						>
							{tEmployeeRoster.allEmployees}
						</Button>

						{sortTeamsByDisplayOrder(teams).map((team) => (
							<Button
								key={team.id}
								variant={team.id === activeTeam ? "filled" : "outline"}
								onClick={() => setParams({ activeTeam: team.id })}
							>
								{team.name}
							</Button>
						))}
					</div>
				</div>
			)}

			<div className="overflow-x-auto rounded-3xl border border-[#D9D9D9] bg-white">
				<Table className="min-w-[1100px] border-collapse">
					<TableHeader className="sticky top-0 z-10 h-[75px] bg-brand-bgLightgrey [&_tr]:border-b [&_tr]:border-[#D9D9D9]">
						{" "}
						<TableRow className="hover:bg-transparent">
							{timeLogsTableHeaders.map((header) => (
								<TableHead
									key={header}
									className="items-center justify-center gap-4 text-nowrap border-r border-[#D9D9D9] text-center text-sm font-semibold text-brand-dark50 last:border-r-0"
								>
									{header === TimeLogHeaders.TRUCK_ASSIGNED ? (
										<Popover>
											<PopoverTrigger asChild>
												<div className="flex cursor-pointer items-center gap-1">
													<span>{header}</span>
													<Info size={14} className="hover:text-brand-dark100 text-brand-dark50" />
												</div>
											</PopoverTrigger>
											<PopoverContent
												align="start"
												sideOffset={6}
												className="w-auto rounded-[10px] border border-gray-200 bg-white px-3 py-2 text-gray-800 shadow-md"
											>
												<div className="space-y-1 text-sm leading-tight text-brand-grey">
													<p className="flex justify-between gap-4">
														<span className="font-normal text-brand-grey">{tTimeLogs.truckAssignedStartOfTheDay}</span>
														<span className="text-center font-semibold text-brand-dark">--</span>
													</p>

													<p className="flex justify-between gap-4">
														<span className="font-normal text-brand-grey">{tTimeLogs.truckAssignedEndOfTheDay}</span>
														<span className="text-center font-semibold text-brand-dark">--</span>
													</p>
												</div>
											</PopoverContent>
										</Popover>
									) : (
										header
									)}
								</TableHead>
							))}
						</TableRow>
					</TableHeader>
					{isPending ? (
						<TableBody className="[&_tr]:border-b [&_tr]:border-[#D9D9D9]">
							<TableRow>
								<TableCell colSpan={999} className="py-20 text-center">
									<Spinner />
								</TableCell>
							</TableRow>
						</TableBody>
					) : (
						<TableBody className="[&_tr]:border-b [&_tr]:border-[#D9D9D9]">
							{filteredData &&
								filteredData.map((row, rowIndex) => {
									const {
										employeeName = "--",
										jobs = [],
										employeeDayTimes,
										trucks = [],
										employeeExtendedRequests,
										rosterTimes,
										employeeMiddayRequests,
										employeeId,
										trackTimeByGPS,
									} = row;

									const { toatPauseTaken, gapBeetweenStops } = calculatePause({
										stops: row?.jobs,
										pauses: employeeDayTimes?.employeePauseTime,
									});

									const { employeePauseTime = [] } = employeeDayTimes ?? {};

									const { empDayStartTime, empDayEndTime } = calculateDayStartEndTimes(employeeDayTimes, jobs);

									const firstTruck = trucks[0];
									const lastTruck = trucks[trucks.length - 1];

									const dayTime = {
										...employeeDayTimes,
										dayStartTime: empDayStartTime,
										dayEndTime: empDayEndTime,
									};

									const { hours: dayHours } = calculateDayHours({
										employeeDayTime: dayTime,
										stops: row?.jobs,
										pauses: employeeDayTimes?.employeePauseTime,
									});

									return (
										<React.Fragment key={rowIndex}>
											<TableRow
												className={`h-16 cursor-pointer hover:bg-gray-50 ${paramEmployeeId == employeeId ? "bg-gray-300" : ""}`}
												id={`${employeeId}`}
											>
												<TableCell className="border-r border-[#D9D9D9] text-center text-sm font-medium text-brand-dark last:border-r-0">
													{employeeName}
												</TableCell>
												<TableCell className="border-r border-[#D9D9D9] text-center text-sm font-medium text-brand-dark last:border-r-0">
													{jobs.length || "--"}
												</TableCell>
												<TableCell className="border-r border-[#D9D9D9] text-center text-sm font-medium text-brand-dark last:border-r-0">
													{empDayStartTime && empDayEndTime ? (
														<>
															{`${toFormattedDate(empDayStartTime, DATE_FORMAT.HH_MM_AA_PM)} - ${toFormattedDate(empDayEndTime, DATE_FORMAT.HH_MM_AA_PM)}`}
														</>
													) : (
														<>
															{empDayStartTime
																? toFormattedDate(empDayStartTime, DATE_FORMAT.HH_MM_AA_PM) + " - --"
																: "--"}
														</>
													)}
												</TableCell>
												<TableCell className="border-r border-[#D9D9D9] text-center text-sm font-medium text-brand-dark last:border-r-0">
													{toatPauseTaken ? (
														<>
															<p>{toatPauseTaken}</p>
															<ViewPauseModal
																employeePauseTimes={employeePauseTime}
																gapBeetweenStops={gapBeetweenStops}
															/>
														</>
													) : (
														"--"
													)}
												</TableCell>
												<TableCell className="border-r border-[#D9D9D9] text-center text-sm font-medium text-brand-dark last:border-r-0">
													{employeeExtendedRequests ? (
														<Button variant="ghost" className="h-8 rounded-[8px] text-sm">
															{calculateTotalExtendedHours(rosterTimes)}
														</Button>
													) : (
														"--"
													)}
													<ViewExtendedTimes
														employeeExtendedRequests={employeeExtendedRequests}
														rosterTimes={rosterTimes}
													/>
												</TableCell>
												<TableCell className="border-r border-[#D9D9D9] text-center text-sm font-medium text-brand-dark last:border-r-0">
													{employeeMiddayRequests ? (
														<Button variant="ghost" className="h-8 rounded-[8px] text-sm">
															{employeeMiddayRequests.length}{" "}
															{employeeMiddayRequests.length === 0 || employeeMiddayRequests.length === 1
																? "Request"
																: "Requests"}
														</Button>
													) : (
														"--"
													)}
													<ViewMiddayStop employeeMiddayRequests={employeeMiddayRequests} />
												</TableCell>
												<TableCell className="border-r border-[#D9D9D9] text-center text-sm font-medium text-brand-dark last:border-r-0">
													<p>{dayHours}</p>
												</TableCell>
												<TableCell className="border-r border-[#D9D9D9] text-center text-sm font-medium text-brand-dark last:border-r-0">
													<ViewNoteModal jobEmployeeNotes={row.employeeDayTimes} />
												</TableCell>
												<TableCell className="border-r border-[#D9D9D9] text-center text-sm font-medium text-brand-dark last:border-r-0">
													{firstTruck?.truckNumber ?? "--"} - {lastTruck?.truckNumber ?? "--"}
												</TableCell>
												<TableCell className="border-r border-[#D9D9D9] text-center text-sm font-medium text-brand-dark last:border-r-0">
													{firstTruck?.Odometer_reading ?? "--"}
												</TableCell>
												<TableCell className="border-r border-[#D9D9D9] text-center text-sm font-medium text-brand-dark last:border-r-0">
													<div className="item-center flex pl-4">
														{/* <FaRegEdit
															className={`mt-2 ${!isTimeLogsEditAccess ? "cursor-not-allowed opacity-50" : "cursor-pointer"}`}
															onClick={() => {
																if (isTimeLogsEditAccess) {
																	openModal({
																		modalTitle: tTimeLogs.editDetails,
																		modalView: (
																			<EditDetailModal onClose={closeModal} onSave={refetch} dailyJobEmployee={row} />
																		),
																	});
																}
															}}
														/> */}
														<Button variant="ghost" size="sm" onClick={() => handleToggleRow(rowIndex)}>
															{expandedRows.includes(rowIndex) ? (
																<ChevronUp className="h-5 w-5 text-brand-dark" />
															) : (
																<ChevronDown className="h-5 w-5 text-brand-dark" />
															)}
														</Button>
													</div>
												</TableCell>
											</TableRow>

											{expandedRows.includes(rowIndex) && (
												<EmployeeStopDetails
													jobs={jobs}
													isTimeLogsEditAccess={isTimeLogsEditAccess}
													employeeName={employeeName}
													openModal={openModal}
													closeModal={closeModal}
													refetch={refetch}
													employeeDayTimes={employeeDayTimes}
													trackTimeByGPS={trackTimeByGPS}
													rosterTime={rosterTimes}
												/>
											)}
										</React.Fragment>
									);
								})}
						</TableBody>
					)}
				</Table>
			</div>
			<Modal />
		</div>
	);
};

export default TimeLogs;
