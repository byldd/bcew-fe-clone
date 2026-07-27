"use client";

import SectionHeader from "@/components/shared/section-header";
import { FiSearch } from "react-icons/fi";
import { useMemo, useState, useEffect } from "react";
import { Spinner } from "@/components/ui/spinner";
import { useIsMobile } from "@/hooks/use-mobile";
import SidebarToggleButton from "@/components/shared/sidebar/sidebar-toggle-button";
import { PanelLeftClose, PanelLeftOpen } from "lucide-react";

import { filterBuilderCommsTree } from "../utils/helpers";
import { useBuilderCommsProjects } from "../hooks/useBuilder";

import BuilderCommsTabs from "../components/builder-comms-tabs";
import ImageGalleryTab from "../components/image-gallery-tab";
import StatusFilterDropdown from "../components/status-filter-dropdown";

import { BUILDER_COMMS_TAB, JOB_STATUS, SidebarNode } from "../types";
import { useBuilderCommsParams } from "../hooks/useAdminProjectListWithImagesAndNotesParams";

export default function BuilderCommsPage() {
	const [searchQuery, setSearchQuery] = useState("");
	const [activeTab, setActiveTab] = useState<BUILDER_COMMS_TAB>(BUILDER_COMMS_TAB.IMAGE_GALLERY);
	const [selectedItem, setSelectedItem] = useState<SidebarNode | null>(null);

	const [sidebarOpen, setSidebarOpen] = useState(true);

	const isMobile = useIsMobile();

	const { getParams } = useBuilderCommsParams();
	const { status } = getParams();

	const { data: builders = [], isLoading } = useBuilderCommsProjects(status as JOB_STATUS);

	const search = searchQuery.trim();

	const filteredBuilders = useMemo(() => {
		return filterBuilderCommsTree(builders, search);
	}, [builders, search]);

	useEffect(() => {
		setSelectedItem(null);
	}, [search, status]);

	useEffect(() => {
		if (!isMobile) setSidebarOpen(false);
	}, [isMobile]);

	if (isLoading) return <Spinner />;

	return (
		<div className="space-y-2">
			<div className="flex items-center justify-between gap-4">
				<SectionHeader title="Builder Communications" className="mb-2" />

				<SidebarToggleButton
					onClick={() => setSidebarOpen((prev) => !prev)}
					icon={sidebarOpen ? <PanelLeftClose size={20} /> : <PanelLeftOpen size={20} />}
					className="relative z-[80] shrink-0 lg:hidden"
				/>
			</div>

			<div className="flex items-center gap-2 md:justify-end md:gap-4">
				<div className="relative flex-1 md:flex-none">
					<FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-brand-dark50" />
					<input
						value={searchQuery}
						onChange={(e) => {
							setSearchQuery(e.target.value);
							if (isMobile) setSidebarOpen(true);
						}}
						placeholder="Search"
						className="h-10 w-full rounded-[10px] !border-none bg-white pl-9 pr-3 shadow-sm md:w-[200px] lg:w-[280px]"
					/>
				</div>

				<StatusFilterDropdown />
			</div>

			{/* Tabs */}
			<BuilderCommsTabs
				activeTab={activeTab}
				onChange={setActiveTab}
				tabs={[{ id: BUILDER_COMMS_TAB.IMAGE_GALLERY, label: "Image Gallery" }]}
			/>

			{/* Content */}
			<ImageGalleryTab
				builders={filteredBuilders}
				selectedItem={selectedItem}
				setSelectedItem={setSelectedItem}
				searchQuery={searchQuery}
				sidebarOpen={sidebarOpen}
				onCloseSidebar={() => setSidebarOpen(false)}
			/>
		</div>
	);
}
