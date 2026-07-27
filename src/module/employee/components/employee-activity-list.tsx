import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { IEmployeeActivityList } from "@/module/employee/types";
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { ChevronDown, ChevronUp } from "lucide-react";
import { useModal } from "@/hooks/useModal";
import { calculatePauseHours, extractUTCDayAndTime } from "@/module/schedule-management/time-logs-management/utils";
import { ViewPauseModal } from "@/module/schedule-management/time-logs-management/components/view-pause-modal";
import { ViewNoteModal } from "@/module/schedule-management/time-logs-management/components/view-note-modal";
import { activityTableHeaders } from "../constants";
import EmployeeStopDetails from "@/module/schedule-management/time-logs-management/components/employee-stop-details";
import { ACCESS_LEVEL } from "../enums";
import { toFormattedDate } from "@/lib/utils/date";
import { DATE_FORMAT } from "@/types/date";
import { useTypedTranslations } from "@/i18n/useTypedTranslations";
import { NAMESPACE } from "@/i18n/type";
import { useAdminPageAccessContext } from "@/module/admin/context/page-access";
import { useGetUserModuleAccess } from "@/module/profile/hooks/useProfile";
import { MODULE } from "@/utils/enums";
import { isProductionEnv } from "@/utils";

export const EmployeeActivityList = ({ employeeActivities }: IEmployeeActivityList) => {
	const [expandedRows, setExpandedRows] = useState<string[]>([]);
	const { Modal, closeModal, openModal } = useModal();
	const toggleRow = (date: string) => {
		setExpandedRows((prev) => (prev.includes(date) ? prev.filter((d) => d !== date) : [...prev, date]));
	};
	const tPeople = useTypedTranslations(NAMESPACE.PEOPLE_MANAGEMENT);

	const { pageAccess } = useAdminPageAccessContext();
	const { data: moduleAccessLevel } = useGetUserModuleAccess(MODULE.TIME_LOGS);

	const finalAccessLevel = isProductionEnv() ? moduleAccessLevel?.data.accessLevel : pageAccess?.accessLevel;

	const isTimeLogsEditAccess = finalAccessLevel === ACCESS_LEVEL?.WRITE;

	return (
		<div className="min-w-full overflow-x-auto rounded-3xl border bg-white">
			<div className="min-full overflow-x-auto">
				{employeeActivities?.length > 0 ? (
					<Table className="w-full">
						<TableHeader>
							<TableRow className="border-gray-200 bg-brand-bgLightgrey">
								{activityTableHeaders.map((header) => (
									<TableHead
										key={header}
										className="min-w-full overflow-x-auto text-nowrap border-r px-6 py-6 text-center"
									>
										{header}
									</TableHead>
								))}
							</TableRow>
						</TableHeader>
						<TableBody>
							{employeeActivities?.map((activity, idx) => {
								const {
									date,
									startTime,
									endTime,
									trucks,
									dailyJobAssignments,
									distanceTraveled,
									overrideStartTime,
									overrideEndTime,
									employeePauseTime,
								} = activity;

								const truckNumbers = trucks?.length ? trucks.map((t) => t.truckNumber).join(", ") : "--";

								const stops = dailyJobAssignments?.length ?? 0;

								return (
									<React.Fragment key={date}>
										<TableRow key={idx} className="border-b border-gray-100">
											<TableCell className="border-b border-r pl-4 text-center text-sm font-medium text-gray-900">
												{date ? toFormattedDate(date, DATE_FORMAT.MM_SLASH_DD_YYYY) : "-"}
											</TableCell>

											<TableCell className="border-b border-r text-center text-sm text-gray-900">{stops}</TableCell>
											<TableCell className="border-b border-r text-center text-sm font-medium text-brand-dark">
												<>
													{startTime ? extractUTCDayAndTime(startTime) : "--"}
													{" - "}
													{endTime ? extractUTCDayAndTime(endTime) : "--"}
												</>
											</TableCell>
											<TableCell className="border-b border-r text-center text-sm font-medium text-brand-dark">
												{employeePauseTime?.length ? (
													<>
														<p>{calculatePauseHours(employeePauseTime)}</p>
														<ViewPauseModal employeePauseTimes={employeePauseTime} gapBeetweenStops={[]} />
													</>
												) : (
													"--"
												)}
											</TableCell>
											<TableCell className="border-b border-r text-center text-sm font-medium text-brand-dark">
												{overrideStartTime || overrideEndTime ? (
													<>
														{overrideStartTime ? extractUTCDayAndTime(overrideStartTime) : "--"} -{" "}
														{overrideEndTime ? extractUTCDayAndTime(overrideEndTime) : "--"}
													</>
												) : (
													"--"
												)}
											</TableCell>
											<TableCell className="border-b border-r text-center text-sm font-medium text-brand-dark">
												<ViewNoteModal jobEmployeeNotes={activity} />
											</TableCell>
											<TableCell className="border-b border-r text-center text-sm text-gray-900">
												{truckNumbers}
											</TableCell>
											<TableCell className="border-b border-r text-center text-sm text-gray-900">
												{distanceTraveled ?? "--"}
											</TableCell>
											<TableCell className="border-b text-center">
												<Button variant="ghost" size="sm" className="h-6 w-6 p-0" onClick={() => toggleRow(date)}>
													{expandedRows.includes(date) ? (
														<ChevronUp className="h-4 w-4 text-gray-500" />
													) : (
														<ChevronDown className="h-4 w-4 text-gray-500" />
													)}
												</Button>
											</TableCell>
										</TableRow>
										{expandedRows.includes(date) && (
											<EmployeeStopDetails
												jobs={dailyJobAssignments}
												openModal={openModal}
												closeModal={closeModal}
												isTimeLogsEditAccess={isTimeLogsEditAccess}
											/>
										)}
									</React.Fragment>
								);
							})}
						</TableBody>
					</Table>
				) : (
					<div className="my-10 flex justify-center font-inter text-base text-brand-grey">
						{tPeople.noActivitiesFound}
					</div>
				)}
			</div>
			<Modal />
		</div>
	);
};
