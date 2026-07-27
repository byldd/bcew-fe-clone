"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Trash2 } from "lucide-react";
import { BsArrowRightShort } from "react-icons/bs";
import { FaRegEdit } from "react-icons/fa";
import ViewNote from "./view-note";
import ReleaseNoteForm from "./release-note-form";
import { useDeleteReleaseNote, useGetReleaseNotesInfinite } from "../hooks/useReleaseNotes";
import { AUDIENCE, IReleaseNote, TAB_TYPE } from "../types/release-note";
import { toFormattedDate } from "@/lib/utils/date";
import { useSheet } from "@/hooks/useSheet";
import { useQueryClient } from "@tanstack/react-query";
import { openErrorToast, openSuccessToast } from "@/components/toast";
import { useTypedTranslations } from "@/i18n/useTypedTranslations";
import { NAMESPACE } from "@/i18n/type";
import { buildMatchList, countMatchesInNote } from "../utils/release-note";
import { Button } from "@/components/ui/button";
import { useSearchParams } from "next/navigation";
import { DATE_FORMAT } from "@/types/date";
import { usePermissions } from "../hooks/usePermission";
import { Spinner } from "@/components/ui/spinner";
import { useReleaseNoteTabParam } from "../hooks/useReleaseNoteTabParam";

interface AdminNotesProps {
	activeTab: TAB_TYPE;
	searchQuery: string;
	currentMatchIndex: number;
	onMatchIndexChange: (index: number) => void;
	onSearchStatsChange: (totalMatches: number) => void;
	searchNavigationVersion: number;
	totalMatches: number;
}

const TAB_AUDIENCE_MAP: Partial<Record<TAB_TYPE, AUDIENCE>> = {
	[TAB_TYPE.ADMIN]: AUDIENCE.ADMIN,
	[TAB_TYPE.TECHNICIAN]: AUDIENCE.TECHNICIAN,
};

const AdminNotes = ({
	activeTab,
	searchQuery,
	currentMatchIndex,
	onMatchIndexChange,
	onSearchStatsChange,
	searchNavigationVersion,
	totalMatches,
}: AdminNotesProps) => {
	const observerTarget = useRef<HTMLDivElement | null>(null);
	const notesListRef = useRef<HTMLDivElement | null>(null);
	const noteItemRefs = useRef<Record<string, HTMLDivElement | null>>({});
	const [selected, setSelected] = useState<IReleaseNote | null>(null);
	const { Sheet, openSheet, closeSheet } = useSheet();
	const queryClient = useQueryClient();
	const { mutate: deleteReleaseNote } = useDeleteReleaseNote();
	const searchParams = useSearchParams();
	const dateParam = searchParams.get("date");
	const { isEmployeeWrite, isAdminWrite } = usePermissions();
	const { clearDateParam } = useReleaseNoteTabParam({
		defaultTab: activeTab,
		allowedTabs: [TAB_TYPE.ALL, TAB_TYPE.ADMIN, TAB_TYPE.TECHNICIAN],
	});

	const audienceFilter = TAB_AUDIENCE_MAP[activeTab];

	const { data, fetchNextPage, hasNextPage, isFetchingNextPage } = useGetReleaseNotesInfinite({
		audience: audienceFilter,
		pageSize: 10,
	});

	const notes = useMemo(() => {
		return data?.pages?.flatMap((page) => page.items || []) ?? [];
	}, [data]);
	const tAdmin = useTypedTranslations(NAMESPACE.RELEASE_NOTE);

	const matchList = useMemo(
		() => (searchQuery.trim() && notes?.length ? buildMatchList(notes, searchQuery) : []),
		[notes, searchQuery]
	);

	const activeEntry = matchList[currentMatchIndex] ?? null;
	const activeNoteIndex = activeEntry?.noteIndex ?? 0;
	const activeOccurrenceInNote = activeEntry?.occurrenceOffset ?? -1;
	const prevTabRef = useRef<TAB_TYPE | null>(null);
	const prevScrollTargetRef = useRef<{ noteId: string | null; searchQuery: string; activeNoteIndex: number | null }>({
		noteId: null,
		searchQuery: "",
		activeNoteIndex: null,
	});

	useEffect(() => {
		if (prevTabRef.current === null) {
			prevTabRef.current = activeTab;
			return;
		}

		if (prevTabRef.current !== activeTab) {
			prevTabRef.current = activeTab;
			setSelected(null);
			onMatchIndexChange(0);
		}
	}, [activeTab, onMatchIndexChange]);

	useEffect(() => {
		onMatchIndexChange(0);
	}, [onMatchIndexChange, searchQuery]);

	useEffect(() => {
		const currentTarget = observerTarget.current;
		if (!currentTarget) return;
		const scrollContainer = currentTarget.parentElement;

		const observer = new IntersectionObserver(
			(entries) => {
				const entry = entries[0];
				if (!entry) return;
				if (entry.isIntersecting && hasNextPage && !isFetchingNextPage) {
					fetchNextPage();
				}
			},
			{
				root: scrollContainer,
				threshold: 0.1,
				rootMargin: "0px 0px 50px 0px",
			}
		);

		observer.observe(currentTarget);

		return () => {
			observer.disconnect();
		};
	}, [hasNextPage, isFetchingNextPage, fetchNextPage]);

	useEffect(() => {
		if (!notes?.length) {
			setSelected(null);
			onSearchStatsChange(0);
			return;
		}

		if (searchQuery.trim()) {
			onSearchStatsChange(matchList.length);

			const firstNoteIndex = matchList[0]?.noteIndex ?? 0;
			setSelected(notes[firstNoteIndex] || notes[0] || null);
			return;
		}

		if (dateParam) {
			const matchedNote = notes.find((note) => {
				return toFormattedDate(note.date, DATE_FORMAT.MM_SLASH_DD_YYYY) === dateParam;
			});

			setSelected(matchedNote || null);
			onSearchStatsChange(0);
			return;
		}
		onSearchStatsChange(0);
		setSelected((prevSelected) => {
			if (prevSelected) {
				const existingSelected = notes.find((note) => note.id === prevSelected.id);
				if (existingSelected) {
					return existingSelected;
				}
			}

			return notes[0] || null;
		});
	}, [dateParam, matchList, notes, onSearchStatsChange, searchQuery]);

	// When currentMatchIndex changes (user clicks prev/next), switch to correct note
	useEffect(() => {
		if (!notes?.length || !activeEntry) return;
		setSelected(notes[activeNoteIndex] ?? null);
	}, [activeEntry, activeNoteIndex, notes]);

	useEffect(() => {
		if (!notes.length) return;

		const targetNote = searchQuery.trim() ? notes[activeNoteIndex] : selected;
		if (!targetNote) return;

		const previousTarget = prevScrollTargetRef.current;
		const hasTargetChanged =
			previousTarget.noteId !== targetNote.id ||
			previousTarget.searchQuery !== searchQuery ||
			previousTarget.activeNoteIndex !== (searchQuery.trim() ? activeNoteIndex : null);

		if (!hasTargetChanged) {
			return;
		}

		prevScrollTargetRef.current = {
			noteId: targetNote.id,
			searchQuery,
			activeNoteIndex: searchQuery.trim() ? activeNoteIndex : null,
		};

		const targetElement = noteItemRefs.current[targetNote.id];
		const container = notesListRef.current;
		if (!targetElement || !container) return;

		const containerRect = container.getBoundingClientRect();
		const targetRect = targetElement.getBoundingClientRect();
		const nextScrollTop =
			container.scrollTop + (targetRect.top - containerRect.top) - container.clientHeight / 2 + targetRect.height / 2;

		container.scrollTo({
			top: Math.max(0, nextScrollTop),
			behavior: "smooth",
		});
	}, [activeNoteIndex, notes, searchQuery, selected]);

	const openFormSheet = (releaseNote?: IReleaseNote | null) => {
		openSheet({
			sheetTitle: releaseNote ? tAdmin.editNote : tAdmin.addNewNote,
			sheetView: <ReleaseNoteForm releaseNote={releaseNote} onClose={closeSheet} />,
			side: "right",
		});
	};

	const handleDelete = (note: IReleaseNote) => {
		deleteReleaseNote(note.id, {
			onSuccess: () => {
				openSuccessToast(`Production notes for ${toFormattedDate(note.date)} successfully deleted.`);
				queryClient.invalidateQueries({ queryKey: ["release-notes-infinite"] });
				setSelected(null);
				clearDateParam();
			},
			onError: (error) => {
				openErrorToast({ error });
			},
		});
	};

	const isInvalidDate =
		!!dateParam && !notes.some((note) => toFormattedDate(note.date, DATE_FORMAT.MM_SLASH_DD_YYYY) === dateParam);

	return (
		<div className="mt-4 flex min-h-0 flex-1 flex-col gap-4 overflow-hidden sm:flex-row">
			<div className="flex w-full flex-shrink-0 flex-col rounded-xl border bg-white sm:w-[180px]">
				<div className="px-4 py-4">
					<p className="text-base font-medium text-brand-dark60">{tAdmin.date}</p>
				</div>

				{/* Scrollable Area (IMPORTANT) */}
				<div ref={notesListRef} className="max-h-[160px] flex-1 space-y-2 overflow-y-auto px-2 sm:max-h-none">
					{isInvalidDate ? (
						<p className="px-4 py-3 text-sm text-gray-400">No date found</p>
					) : notes.length === 0 ? (
						<p className="px-4 py-3 text-sm text-gray-400">{tAdmin.noNotesFound}</p>
					) : (
						notes.map((note, index) => {
							const matchCount = searchQuery.trim() ? countMatchesInNote(note.content, searchQuery) : 0;

							return (
								<div
									key={note.id}
									ref={(element) => {
										noteItemRefs.current[note.id] = element;
									}}
									onClick={() => {
										setSelected(note);

										if (searchQuery.trim()) {
											const firstMatchInNote = matchList.findIndex((e) => e.noteIndex === index);
											if (firstMatchInNote !== -1) {
												onMatchIndexChange(firstMatchInNote);
											}
										}
									}}
									className={`flex w-full cursor-pointer items-center justify-between rounded-[8px] px-2 py-2 transition ${
										selected?.id === note.id ? "bg-brand-dark10 font-medium" : "hover:bg-brand-dark10"
									}`}
								>
									<span className="text-sm text-brand-dark">
										{toFormattedDate(note.date)}{" "}
										{searchQuery.trim() && matchCount > 0 && (
											<span className="mb-0.5 ml-1 text-[10px] font-medium text-yellow-700">{matchCount}</span>
										)}
									</span>

									<BsArrowRightShort className="h-5 w-5 font-semibold text-gray-400" />
								</div>
							);
						})
					)}

					{/* Observer INSIDE scroll area */}
					<div ref={observerTarget} className="h-10 w-full">
						{isFetchingNextPage && (
							<div className="flex justify-center py-2">
								<Spinner />
							</div>
						)}
					</div>
				</div>
			</div>

			{/* RIGHT PANEL */}
			<div className="flex min-h-0 w-full flex-1 flex-col overflow-hidden rounded-xl border bg-white">
				{selected ? (
					<div className="flex w-full flex-col justify-between gap-2 px-6 py-2">
						<div className="flex w-full items-center justify-between gap-2">
							<h2 className="text-base font-semibold text-brand-dark">{tAdmin.releaseNotes}</h2>

							{(isAdminWrite || (isEmployeeWrite && selected?.audience === AUDIENCE.TECHNICIAN)) && (
								<div className="mb-4 flex justify-end">
									<Button
										onClick={() => handleDelete(selected)}
										className="flex h-8 w-6 items-center justify-center rounded-lg text-red-400 transition hover:bg-red-50 hover:text-red-500"
									>
										<Trash2 className="h-4 w-4" />
									</Button>

									<Button
										onClick={() => openFormSheet(selected)}
										className="flex h-8 w-6 items-center justify-center rounded-lg text-brand-dark transition hover:bg-gray-100 hover:text-gray-600"
									>
										<FaRegEdit className="h-4 w-4" />
									</Button>
								</div>
							)}
						</div>

						<ViewNote
							releaseNote={selected}
							searchQuery={searchQuery}
							activeOccurrenceIndex={activeOccurrenceInNote}
							searchNavigationVersion={searchNavigationVersion}
							totalMatches={totalMatches}
						/>
					</div>
				) : (
					<div className="flex h-full items-center justify-center text-sm text-brand-dark50">
						{searchQuery.trim()
							? "No release notes found for this search"
							: isInvalidDate
								? "No release notes found for this date."
								: "Select a date to view release notes"}
					</div>
				)}
			</div>

			<Sheet />
		</div>
	);
};

export default AdminNotes;
