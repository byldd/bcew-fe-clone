import React, { useState, useEffect, useRef } from "react";
import { FileText } from "lucide-react";
import Image from "next/image";
import { getFileName, isImage } from "../../admin-release-notes/utils/release-note";
import { useTypedTranslations } from "@/i18n/useTypedTranslations";
import { NAMESPACE } from "@/i18n/type";
import ImageModal from "@/components/shared/image-upload/image-modal";
import { useModal } from "@/hooks/useModal";
import { toFormattedDate } from "@/lib/utils/date";
import { DATE_FORMAT } from "@/types/date";
import { IReleaseNote } from "@/module/admin-release-notes/types/release-note";
import { Button } from "@/components/ui/button";
import ReleaseNoteContent from "@/module/admin-release-notes/components/release-note-content";

interface ViewNoteProps {
	releaseNote: IReleaseNote;
	searchQuery?: string;
	activeOccurrenceIndex?: number;
}

const ViewNote = ({ releaseNote, searchQuery = "", activeOccurrenceIndex = -1 }: ViewNoteProps) => {
	const attachments = releaseNote.attachments ?? [];
	const tAdmin = useTypedTranslations(NAMESPACE.RELEASE_NOTE);
	const { openModal, closeModal, Modal } = useModal();
	const [isExpanded, setIsExpanded] = useState(false);

	const activeMarkRef = useRef<HTMLSpanElement | null>(null);
	const contentContainerRef = useRef<HTMLDivElement | null>(null);

	useEffect(() => {
		if (activeOccurrenceIndex >= 0) {
			setIsExpanded(true);
		}
	}, [activeOccurrenceIndex]);

	useEffect(() => {
		if (!searchQuery.trim()) {
			setIsExpanded(false);
		}
	}, [searchQuery]);

	const openImagePreview = (url: string) => {
		openModal({
			modalTitle: "Preview Image",
			modalView: <ImageModal imageUrl={url} onClose={closeModal} />,
			variant: "medium",
		});
	};

	return (
		<div className="overflow-hidden rounded-2xl border border-gray-200 bg-white">
			{/* Date */}
			<div className="border-b bg-[#FAFAFA] px-4 py-4">
				<p className="text-sm font-semibold text-brand-dark">
					{toFormattedDate(releaseNote.date, DATE_FORMAT.MM_SLASH_DD_YYYY)}
				</p>
			</div>

			<div className="flex flex-col gap-3 p-4">
				{/* Content — highlighted if search active, collapsed if not expanded */}
				<div
					ref={contentContainerRef}
					className={`w-full overflow-hidden break-words text-justify text-sm leading-relaxed text-brand-dark80 ${
						!isExpanded ? "line-clamp-3" : "max-h-[820px] overflow-y-auto"
					}`}
				>
					<ReleaseNoteContent
						content={releaseNote.content}
						searchQuery={searchQuery}
						activeOccurrenceIndex={activeOccurrenceIndex}
						activeRef={activeMarkRef}
						className="release-note-content whitespace-pre-line"
						scrollContainerRef={contentContainerRef}
					/>
				</div>

				{/* Read More / Less */}
				<Button
					onClick={() => setIsExpanded((prev) => !prev)}
					className="h-8 self-start rounded-[8px] border border-brand-dark50 text-xs font-normal text-brand-dark50"
				>
					{isExpanded ? "Read Less" : "Read More"}
				</Button>

				{/* Attachments — only when expanded */}
				{isExpanded && attachments.length > 0 && (
					<div className="space-y-1">
						<p className="whitespace-nowrap py-2 text-xs text-brand-dark50">
							{tAdmin.attachments} ({attachments.length})
						</p>

						<div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
							{attachments.map((file) => {
								const isImg = isImage(file.keyFile);
								const Wrapper = isImg ? "div" : "a";

								return (
									<Wrapper
										key={file.keyFile}
										{...(!isImg && {
											href: file.url,
											target: "_blank",
											rel: "noreferrer",
										})}
										onClick={isImg ? () => openImagePreview(file.url) : undefined}
										className="flex cursor-pointer items-center gap-2 rounded-lg border border-gray-200 bg-gray-50 px-2.5 py-2 transition hover:shadow-sm"
									>
										<div className="flex h-7 w-7 shrink-0 items-center justify-center overflow-hidden rounded border bg-white">
											{isImg ? (
												<Image
													src={file.url}
													alt={getFileName(file.keyFile)}
													width={28}
													height={28}
													className="object-cover"
												/>
											) : (
												<FileText className="h-3.5 w-3.5 text-gray-500" />
											)}
										</div>
										<div className="min-w-0">
											<p className="truncate text-xs font-medium text-brand-dark">{getFileName(file.keyFile)}</p>
										</div>
									</Wrapper>
								);
							})}
						</div>
					</div>
				)}

				<Modal />
			</div>
		</div>
	);
};

export default ViewNote;
