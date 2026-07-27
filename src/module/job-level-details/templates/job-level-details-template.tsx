"use client";

import SectionHeader from "@/components/shared/section-header";
import { FiSearch } from "react-icons/fi";
import { useMemo, useState, useEffect } from "react";
import { Spinner } from "@/components/ui/spinner";

import { filterJobLevelDetailsTree } from "../utils/helpers";
import { useJobLevelDetailsProjects } from "../hooks/useJobLevelDetails";

import JobLevelDetails from "../components/job-level-details";
import StatusFilterDropdown from "../components/status-filter-dropdown";

import { useJobLevelDetailsParams } from "../hooks/useJobLevelDetailsParams";
import { SidebarNode, JOB_STATUS } from "@/module/builder-communication/types";
import { isProductionEnv } from "@/utils";

export default function JobLevelDetailsPage() {
	const [searchQuery, setSearchQuery] = useState("");
	const [selectedItem, setSelectedItem] = useState<SidebarNode | null>(null);

	const { getParams } = useJobLevelDetailsParams();
	const { status } = getParams();

	const { data: projects = [], isLoading } = useJobLevelDetailsProjects(status as JOB_STATUS);

	const search = searchQuery.trim();

	const filteredProjects = useMemo(() => {
		return filterJobLevelDetailsTree(projects, search);
	}, [projects, search]);

	useEffect(() => {
		setSelectedItem(null);
	}, [search, status]);

	if (isLoading) return <Spinner />;
	if (isProductionEnv()) {
		return <div>Job Level Details</div>;
	}

	return (
		<div className="space-y-4">
			<div className="mb-2 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
				<SectionHeader title="Job-Level Details" />

				<div className="flex items-center gap-2">
					<div className="relative flex-1 sm:flex-none">
						<FiSearch className="absolute left-3 top-1/2 -translate-y-1/2" />
						<input
							value={searchQuery}
							onChange={(e) => setSearchQuery(e.target.value)}
							placeholder="Search"
							className="h-10 w-full rounded-[10px] border-none bg-white pl-9 pr-3 shadow-sm sm:w-[200px]"
						/>
					</div>

					<StatusFilterDropdown />
				</div>
			</div>

			<JobLevelDetails
				projects={filteredProjects}
				selectedItem={selectedItem}
				setSelectedItem={setSelectedItem}
				searchQuery={searchQuery}
			/>
		</div>
	);
}
