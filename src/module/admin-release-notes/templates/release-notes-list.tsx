"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import SectionHeader from "@/components/shared/section-header";
import { FiSearch } from "react-icons/fi";
import { ChevronLeft, ChevronRight } from "lucide-react";
import AdminNotes from "../components/admin-notes";
import ReleaseNoteForm from "../components/release-note-form";
import { useSheet } from "@/hooks/useSheet";
import { TAB_TYPE } from "../types/release-note";
import { useTypedTranslations } from "@/i18n/useTypedTranslations";
import { NAMESPACE } from "@/i18n/type";
import { usePermissions } from "../hooks/usePermission";
import { ReleaseNoteTab, useReleaseNoteTabParam } from "../hooks/useReleaseNoteTabParam";

export default function AdminReleaseNotesPage() {
	const { isAdminNone, isEmployeeRead } = usePermissions();
	const defaultTab: ReleaseNoteTab = isAdminNone && isEmployeeRead ? TAB_TYPE.TECHNICIAN : TAB_TYPE.ALL;
	const [searchQuery, setSearchQuery] = useState("");
	const [currentMatchIndex, setCurrentMatchIndex] = useState(0);
	const [totalMatches, setTotalMatches] = useState(0);
	const [searchNavigationVersion, setSearchNavigationVersion] = useState(0);
	const { Sheet, openSheet, closeSheet } = useSheet();
	const tAdmin = useTypedTranslations(NAMESPACE.RELEASE_NOTE);
	const { isEmployeeWrite, isAdminWrite } = usePermissions();

	const tabs = [
		{ label: tAdmin.allNotes, value: TAB_TYPE.ALL },
		{ label: tAdmin.adminNotes, value: TAB_TYPE.ADMIN },
		{ label: tAdmin.technicianNotes, value: TAB_TYPE.TECHNICIAN },
	];
	const filteredTabs = isAdminNone && isEmployeeRead ? tabs.filter((tab) => tab.value === TAB_TYPE.TECHNICIAN) : tabs;
	const { activeTab, setActiveTab } = useReleaseNoteTabParam({
		defaultTab,
		allowedTabs: filteredTabs.map((tab) => tab.value),
	});

	const handleAddNewNote = () => {
		openSheet({
			sheetTitle: tAdmin.addNewNote,
			sheetView: <ReleaseNoteForm onClose={closeSheet} releaseNote={null} />,
			side: "right",
		});
	};

	const handleSearchChange = (value: string) => {
		setSearchQuery(value);
		setCurrentMatchIndex(0);
		setSearchNavigationVersion((prev) => prev + 1);
	};

	const handlePrev = () => {
		setCurrentMatchIndex((prev) => {
			const nextIndex = Math.max(0, prev - 1);
			if (nextIndex !== prev) {
				setSearchNavigationVersion((version) => version + 1);
			}

			return nextIndex;
		});
	};

	const handleNext = () => {
		setCurrentMatchIndex((prev) => {
			const nextIndex = Math.min(totalMatches - 1, prev + 1);
			if (nextIndex !== prev) {
				setSearchNavigationVersion((version) => version + 1);
			}

			return nextIndex;
		});
	};

	const isSearchActive = searchQuery.trim().length > 0;

	return (
		<div className="flex h-screen flex-col overflow-hidden">
			<div className="space-y-4">
				<div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
					<SectionHeader title={tAdmin.releaseNotes} showBackButton />

					<div className="flex items-center gap-2">
						{/* Search Box with Navigation — horizontally scrollable on very narrow screens */}
						<div className="no-scrollbar overflow-x-auto">
							<div className="flex min-w-max items-center gap-1 rounded-[10px] bg-white px-2">
								{/* Search Icon + Input */}
								<div className="relative flex items-center">
									<FiSearch size={16} className="absolute left-2 text-brand-dark" />
									<input
										type="text"
										value={searchQuery}
										onChange={(e) => handleSearchChange(e.target.value)}
										placeholder={tAdmin.searchByWord}
										className="h-10 w-[200px] rounded-[10px] border-none bg-transparent pl-8 pr-2 text-sm outline-none"
									/>
								</div>

								{/* Match Count + Navigation — only show when search is active */}
								{isSearchActive && (
									<div className="flex items-center gap-1 border-l border-gray-200 pl-2">
										{totalMatches > 0 ? (
											<>
												<button
													onClick={handlePrev}
													disabled={currentMatchIndex === 0}
													className="flex h-6 w-6 items-center justify-center rounded transition hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-30"
												>
													<ChevronLeft className="h-4 w-4 text-gray-600" />
												</button>

												<span className="whitespace-nowrap text-xs font-medium text-gray-600">
													{currentMatchIndex + 1} of {totalMatches}
												</span>

												<button
													onClick={handleNext}
													disabled={currentMatchIndex === totalMatches - 1}
													className="flex h-6 w-6 items-center justify-center rounded transition hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-30"
												>
													<ChevronRight className="h-4 w-4 text-gray-600" />
												</button>
											</>
										) : (
											<span className="whitespace-nowrap text-xs font-medium text-gray-600">
												{totalMatches} of {totalMatches}
											</span>
										)}
									</div>
								)}
							</div>
						</div>

						{(isAdminWrite || isEmployeeWrite) && (
							<Button onClick={handleAddNewNote} variant="filled" className="w-fit">
								{tAdmin.addNewNote}
							</Button>
						)}
					</div>
				</div>

				{/* Tabs */}
				<div className="no-scrollbar overflow-x-auto">
					<div className="flex min-w-max items-center gap-2">
						{filteredTabs.map((tab) => (
							<button
								key={tab.value}
								onClick={() => setActiveTab(tab.value, true)}
								className={`rounded-[8px] border px-5 py-2 text-sm font-medium transition ${
									activeTab === tab.value
										? "bg-brand-dark text-white"
										: "bg-white text-brand-dark hover:bg-brand-dark10"
								}`}
							>
								{tab.label}
							</button>
						))}
					</div>
				</div>
			</div>

			{/* Tab Content */}
			<AdminNotes
				activeTab={activeTab}
				searchQuery={searchQuery}
				currentMatchIndex={currentMatchIndex}
				onMatchIndexChange={setCurrentMatchIndex}
				onSearchStatsChange={(total) => setTotalMatches(total)}
				searchNavigationVersion={searchNavigationVersion}
				totalMatches={totalMatches}
			/>

			<Sheet />
		</div>
	);
}
