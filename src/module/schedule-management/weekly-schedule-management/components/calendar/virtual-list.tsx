"use client";
import { useEffect, useState } from "react";
import { useRef } from "react";
import { cn } from "@/lib/utils/utils";
import { IVirtualizedListProps } from "../../types/calendar";
import { SCHEDULE_ROW_TYPE } from "../../constants/week-schedule";
import { useScheduleParams } from "../../hooks/useScheduleParams";

const VirtualizedList = ({
	bcewJobs,
	renderBcewJobRow,
	renderHeader,
	specialJobs,
	renderSpecialJob,
}: IVirtualizedListProps) => {
	const { getParams } = useScheduleParams();
	const { pdf } = getParams();

	const rowHeight = 180;
	const buffer = 5;
	const containerRef = useRef<HTMLDivElement>(null);
	const [scrollTop, setScrollTop] = useState(0);
	const [viewportHeight, setViewportHeight] = useState(0);
	const items = [
		...specialJobs?.map((specialJob) => {
			return {
				bcewJob: null,
				rowType: SCHEDULE_ROW_TYPE.SPECIAL_JOB,
				specialJob: specialJob,
			};
		}),
		...bcewJobs,
	];

	useEffect(() => {
		const handleResize = () => {
			if (containerRef.current) {
				setViewportHeight(containerRef.current.clientHeight);
			}
		};
		handleResize();
		window.addEventListener("resize", handleResize);
		return () => window.removeEventListener("resize", handleResize);
	}, []);

	const onScroll = (e: React.UIEvent<HTMLDivElement>) => {
		setScrollTop(e.currentTarget.scrollTop);
	};

	const totalHeight = items.length * rowHeight;

	useEffect(() => {
		containerRef.current?.scrollTo({ top: 0, behavior: "instant" });
	}, [totalHeight]);

	const startIndex = pdf ? 0 : Math.max(0, Math.floor(scrollTop / rowHeight) - buffer);
	const endIndex = pdf
		? items.length
		: Math.min(items.length, Math.ceil((scrollTop + viewportHeight) / rowHeight) + buffer);
	const visibleItems = items.slice(startIndex, endIndex);
	const topPadding = pdf ? 0 : startIndex * rowHeight;
	const bottomPadding = pdf ? 0 : totalHeight - topPadding - visibleItems.length * rowHeight;

	if (items.length === 0 && specialJobs.length === 0)
		return (
			<div className="flex h-full w-full items-center justify-center">
				<p className="text-sm text-brand-dark50">No jobs found</p>
			</div>
		);

	return (
		<div
			ref={pdf ? null : containerRef}
			onScroll={onScroll}
			className={cn(
				"scrollbar overflow-auto",
				pdf ? "max-h-full" : "max-h-[calc(100vh-240px)] sm:max-h-[calc(100vh-100px)]"
			)}
		>
			{renderHeader && <div className="sticky top-0 z-10 bg-brand-bgLightgrey50">{renderHeader}</div>}
			<div style={{ position: "relative" }} className={cn("min-h-full", ` ${pdf ? "h-full" : `h-[${totalHeight}px]`}`)}>
				<div style={{ height: topPadding }} />

				{visibleItems.map((item, i) => {
					if (item.rowType === SCHEDULE_ROW_TYPE.SPECIAL_JOB && "specialJob" in item) {
						return (
							<div key={`${item.specialJob.id}-${i}-${startIndex + i}`} className="mb-2 h-auto min-w-full">
								{renderSpecialJob(item.specialJob, i)}
							</div>
						);
					}
					if ("bcewJob" in item && item.bcewJob) {
						return (
							<div
								key={`${item?.bcewJob?.schlin?.idnum || item?.bcewJob?.srvinv?.idnum || item?.bcewJob?.schlinExtended?.id}-${item.rowType}-${i}-${startIndex + i}`}
								className="mb-2 h-auto min-w-full"
							>
								{renderBcewJobRow(item, startIndex + i)}
							</div>
						);
					}
				})}
				<div style={{ height: bottomPadding }} />
			</div>
		</div>
	);
};

export default VirtualizedList;
