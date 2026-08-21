"use client";

import React, { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import SectionHeader from "@/components/shared/section-header";
import { tabParams } from "./utils/enums";
import MiddayStopRequests from "./components/midday-stop-requests";
import ExtendedTimeRequests from "./components/extended-time-requests";
import FingerprintApprovalRequests from "./components/fingerprint-approval-requests";
import TimeRequestFilterTrigger from "./components/time-request-filter-trigger";
import { Input } from "@/components/ui/input";
import { useTypedTranslations } from "@/i18n/useTypedTranslations";
import { NAMESPACE } from "@/i18n/type";
import { getBcewWeekRange } from "@/lib/utils/date";
import DateRangePickModal, { DATE_PICK_APPLY_TO } from "@/components/common/date-range-modal";
import { useTimeRequestsParams } from "./hooks/useTimeRequestsParams.ts";

const TimeRequests = () => {
	const { getParams, setParams } = useTimeRequestsParams();
	const { date, tab, status, type } = getParams();
	const { weekStart, weekEnd } = getBcewWeekRange(date);

	const tTimeLogs = useTypedTranslations(NAMESPACE.TIME_LOGS);
	const tSchedule = useTypedTranslations(NAMESPACE.SCHEDULE);
	const [search, setSearch] = useState("");

	const filters = {
		search,
		requestStatus: status,
		requestType: type,
	};

	return (
		<>
			<div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
				<div className="flex items-center gap-4">
					<SectionHeader title={tTimeLogs.timeRequest} showBackButton />

					<DateRangePickModal
						startDate={weekStart}
						dayRange={6}
						endDate={weekEnd}
						selectApplyTo={DATE_PICK_APPLY_TO.END_DATE}
						onChange={(startDate, endDate) => setParams({ date: endDate })}
						onMoveBack={(startDate) => setParams({ date: startDate })}
						onMoveForward={(startDate, endDate) => setParams({ date: endDate })}
					/>
				</div>

				<div className="flex min-w-max items-center gap-2">
					<Input
						type="text"
						className="w-[220px]"
						placeholder={tSchedule.searchByEmployeeName}
						value={search}
						onChange={(e) => setSearch(e.target.value)}
					/>

					<TimeRequestFilterTrigger
						requestStatus={status}
						requestType={type}
						onApply={(filters) =>
							setParams({
								status: filters.requestStatus,
								type: filters.requestType,
							})
						}
					/>
				</div>
			</div>

			<Tabs value={tab} onValueChange={(val) => setParams({ tab: val })}>
				<TabsList className="my-3 inline-flex h-10 w-full items-center justify-start rounded-md bg-transparent p-1 text-muted-foreground">
					<div className="no-scrollbar overflow-x-auto">
						<div className="flex min-w-max gap-2">
							<TabsTrigger
								className="inline-flex items-center justify-center whitespace-nowrap rounded-[8px] border border-brand-dark10 px-3 py-2 text-sm font-medium transition-all data-[state=active]:bg-brand-dark data-[state=inactive]:bg-white data-[state=active]:text-white data-[state=inactive]:text-brand-dark"
								value={tabParams.EXTENDED_TIME}
							>
								{tTimeLogs.extendedTimeRequest}
							</TabsTrigger>

							<TabsTrigger
								className="inline-flex items-center justify-center whitespace-nowrap rounded-[8px] border border-brand-dark10 px-3 py-2 text-sm font-medium transition-all data-[state=active]:bg-brand-dark data-[state=inactive]:bg-white data-[state=active]:text-white data-[state=inactive]:text-brand-dark"
								value={tabParams.MIDDAY_STOP}
							>
								{tTimeLogs.newJobRequest}
							</TabsTrigger>

							<TabsTrigger
								className="inline-flex items-center justify-center whitespace-nowrap rounded-[8px] border border-brand-dark10 px-3 py-2 text-sm font-medium transition-all data-[state=active]:bg-brand-dark data-[state=inactive]:bg-white data-[state=active]:text-white data-[state=inactive]:text-brand-dark"
								value={tabParams.FINGERPRINT_APPROVAL}
							>
								Fingerprint Approval
							</TabsTrigger>
						</div>
					</div>
				</TabsList>

				<TabsContent value={tabParams.EXTENDED_TIME}>
					<ExtendedTimeRequests startDate={weekStart} endDate={weekEnd} filters={filters} />
				</TabsContent>

				<TabsContent value={tabParams.MIDDAY_STOP}>
					<MiddayStopRequests startDate={weekStart} endDate={weekEnd} filters={filters} />
				</TabsContent>

				<TabsContent value={tabParams.FINGERPRINT_APPROVAL}>
					<FingerprintApprovalRequests startDate={weekStart} endDate={weekEnd} filters={filters} />
				</TabsContent>
			</Tabs>
		</>
	);
};

export default TimeRequests;
