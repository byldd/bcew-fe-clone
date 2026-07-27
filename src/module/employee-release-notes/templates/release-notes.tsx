"use client";
import React, { useState, useMemo } from "react";
import { useReleaseNoteDate } from "../hooks/useReleaseNoteDate";
import { useGetReleaseNotes } from "../hooks/useReleaseNotes";
import DateNavigator from "../components/date-navigator";
import ViewNote from "../components/view-note";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { FiSearch } from "react-icons/fi";
import { useDebounce } from "@/hooks/useDebounce";
import { buildMatchList } from "@/module/admin-release-notes/utils/release-note";
import { useSearchParams } from "next/navigation";
import BackButton from "@/components/common/back-button";

export const ReleaseNotePage = () => {
	const {
		selectedDate,
		formattedDate,
		apiDate,
		isCalendarOpen,
		setIsCalendarOpen,
		goToPrevDay,
		goToNextDay,
		handleDateSelect,
	} = useReleaseNoteDate();

	const [search, setSearch] = useState("");
	const debouncedSearch = useDebounce(search, 500);

	const [currentMatchIndex, setCurrentMatchIndex] = useState(0);
	const searchParams = useSearchParams();
	const dateParam = searchParams.get("date");

	const { data, isLoading } = useGetReleaseNotes({
		date: dateParam ? dateParam : apiDate,
	});

	const matchList = useMemo(
		() => (debouncedSearch.trim() && data?.items?.length ? buildMatchList(data.items, debouncedSearch) : []),
		[data?.items, debouncedSearch]
	);

	const totalMatches = matchList.length;
	const isSearchActive = debouncedSearch.trim().length > 0;

	// Reset index when search changes
	const handleSearchChange = (value: string) => {
		setSearch(value);
		setCurrentMatchIndex(0);
	};

	const handlePrev = () => setCurrentMatchIndex((prev) => Math.max(0, prev - 1));
	const handleNext = () => setCurrentMatchIndex((prev) => Math.min(totalMatches - 1, prev + 1));

	const getActiveOccurrenceForNote = (noteId: string): number => {
		const activeEntry = matchList[currentMatchIndex];
		if (!activeEntry || activeEntry.noteId !== noteId) return -1;
		return activeEntry.occurrenceOffset;
	};

	return (
		<div className="flex h-screen flex-col">
			{/* Header */}
			<div className="sticky top-0 z-10 bg-white">
				<div className="flex items-center justify-between px-3 py-4">
					<div className="flex items-center gap-1">
						<BackButton />
						<h1 className="flex cursor-pointer items-center gap-2 text-xl font-semibold text-gray-800">App Updates</h1>
					</div>

					<DateNavigator
						formattedDate={formattedDate}
						selectedDate={selectedDate}
						isCalendarOpen={isCalendarOpen}
						onOpenChange={setIsCalendarOpen}
						onDateSelect={handleDateSelect}
						onPrev={goToPrevDay}
						onNext={goToNextDay}
					/>
				</div>

				<div className="flex flex-col gap-4 px-5">
					{/* Search Box with inline prev/next */}
					<div className="flex items-center gap-1 rounded-[10px] border border-gray-200 bg-white px-1">
						{/* Icon + Input */}
						<div className="relative flex flex-1 items-center">
							<FiSearch size={16} className="pointer-events-none absolute left-2 text-brand-dark" />
							<input
								type="text"
								value={search}
								onChange={(e) => handleSearchChange(e.target.value)}
								placeholder="Search by word"
								className="h-10 w-full border-none bg-white pl-8 pr-2 text-sm outline-none"
							/>
						</div>

						{/* Match count + navigation */}
						{isSearchActive && (
							<div className="flex items-center gap-1 border-l border-gray-200 pl-2">
								<span className="whitespace-nowrap text-xs text-gray-400">
									{totalMatches > 0 ? null : (
										<span className="font-medium text-gray-600">
											{totalMatches} of {totalMatches}
										</span>
									)}
								</span>

								{totalMatches > 0 && (
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
								)}
							</div>
						)}
					</div>
					{search.trim().length > 0 && (
						<div className="mb-2 flex flex-col gap-1">
							<h1 className="text-sm font-medium text-gray-800">{`Showing result for '${search}'`}</h1>

							<span className="text-xs text-gray-400">
								{`${totalMatches} ${totalMatches === 1 ? "match" : "matches"} found`}
							</span>
						</div>
					)}
				</div>
			</div>

			{/* Notes List */}
			<div className="flex-1 overflow-y-auto px-4 py-4">
				{isLoading ? (
					<div className="flex min-h-[60vh] items-center justify-center">
						<p className="text-sm text-gray-400">Loading...</p>
					</div>
				) : !data?.items?.length ? (
					<div className="flex min-h-[60vh] items-center justify-center">
						<p className="text-sm text-gray-400">No app updates for this date.</p>
					</div>
				) : (
					<div className="flex flex-col gap-3">
						{data.items.map((note) => (
							<ViewNote
								key={note.id}
								releaseNote={note}
								searchQuery={debouncedSearch}
								activeOccurrenceIndex={getActiveOccurrenceForNote(note.id)}
							/>
						))}
					</div>
				)}
			</div>
		</div>
	);
};

export default ReleaseNotePage;
