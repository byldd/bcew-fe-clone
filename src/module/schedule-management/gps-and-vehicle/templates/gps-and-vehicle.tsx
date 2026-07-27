"use client";
import React, { useState } from "react";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import { activeTabs } from "../utils/enums";
import { useDebounce } from "@/hooks/useDebounce";
import JobDetails from "../components/job-details";
import VehicleDetails from "../components/vehicle-details";
import SectionHeader from "@/components/shared/section-header";
import { useTypedTranslations } from "@/i18n/useTypedTranslations";
import { NAMESPACE } from "@/i18n/type";

const GPSTab = () => {
	const [activeTab, setActiveTab] = useState<activeTabs>(activeTabs.JOB);
	const [searchQuery, setSearchQuery] = useState("");
	const [currentPage, setCurrentPage] = useState(1);
	const [pageSize, setPageSize] = useState(10);
	const tTimeLogs = useTypedTranslations(NAMESPACE.TIME_LOGS);

	const debouncedSearch = useDebounce(searchQuery.trim().toLowerCase(), 300);

	return (
		<div className="space-y-2">
			<div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
				<div className="flex items-center gap-2">
					<SectionHeader title={tTimeLogs.gps} showBackButton />
				</div>

				<div className="search-bar">
					<Input
						icon={<Search className="h-4 w-4 text-muted-foreground" />}
						iconPosition="left"
						type="text"
						placeholder={tTimeLogs.searchByMemberNameOrVehicleNumber}
						value={searchQuery}
						onChange={(e) => setSearchQuery(e.target.value)}
						className="w-full bg-white sm:w-[350px]"
					/>
				</div>
			</div>

			<Tabs
				value={activeTab}
				onValueChange={(val) => {
					setActiveTab(val as activeTabs);
					setSearchQuery("");
					setCurrentPage(1);
				}}
			>
				<TabsList className="mb-8 inline-flex h-10 w-full items-center justify-start rounded-md bg-transparent p-1 text-muted-foreground">
					<div className="space-x-2">
						<TabsTrigger
							className="inline-flex items-center justify-center whitespace-nowrap rounded-[8px] border border-brand-dark10 px-3 py-2 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-brand-dark data-[state=inactive]:bg-white data-[state=active]:text-white data-[state=inactive]:text-brand-dark"
							value={activeTabs.JOB}
						>
							{tTimeLogs.jobDetails}
						</TabsTrigger>
						<TabsTrigger
							className="inline-flex items-center justify-center whitespace-nowrap rounded-[8px] border border-brand-dark10 px-3 py-2 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-brand-dark data-[state=inactive]:bg-white data-[state=active]:text-white data-[state=inactive]:text-brand-dark"
							value={activeTabs.VEHICLE}
						>
							{tTimeLogs.vehicleDetails}
						</TabsTrigger>
					</div>
				</TabsList>

				<TabsContent value={activeTabs.JOB}>
					<JobDetails
						searchQuery={debouncedSearch}
						currentPage={currentPage}
						pageSize={pageSize}
						setCurrentPage={setCurrentPage}
						setPageSize={setPageSize}
					/>
				</TabsContent>

				<TabsContent value={activeTabs.VEHICLE}>
					<VehicleDetails
						searchQuery={debouncedSearch}
						currentPage={currentPage}
						pageSize={pageSize}
						setCurrentPage={setCurrentPage}
						setPageSize={setPageSize}
					/>
				</TabsContent>
			</Tabs>
		</div>
	);
};

export default GPSTab;
