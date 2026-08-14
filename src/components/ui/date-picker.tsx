"use client";

import * as React from "react";
import { CalendarIcon, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { toDate, toFormattedDate } from "@/lib/utils/date";
import { cn } from "@/lib/utils/utils";
import { Matcher } from "react-day-picker";
import { DayPicker } from "react-day-picker";
import { getWeekRange } from "@/module/schedule-management/weekly-schedule-management/utils";
import { useTypedTranslations } from "@/i18n/useTypedTranslations";
import { NAMESPACE } from "@/i18n/type";
import { DATE_FORMAT } from "@/types/date";

export function DatePicker({
	className,
	iconClassName = "h-5 w-5",

	disabled,
	value,
	onChange,
	disabledDate,
	onClear,
	placeholder,
	alwaysShowLabel,
	...props
}: React.ComponentProps<typeof DayPicker> & {
	buttonVariant?: React.ComponentProps<typeof Button>["variant"];
	disabled?: boolean;
	placeholder?: string;
	value?: Date | string;
	onChange?: (value: Date) => void;
	disabledDate?: Matcher;
	onClear?: () => void;
	alwaysShowLabel?: boolean;
	iconClassName?: string;
}) {
	const [open, setOpen] = React.useState(false);
	const tCommon = useTypedTranslations(NAMESPACE.COMMON);

	const hasSingleSelection = (!props.mode || props.mode === "single") && !!value;
	const hasRangeSelection = props.mode === "range" && !!(props.selected?.from || props.selected?.to);
	const hasSelection = hasSingleSelection || hasRangeSelection;

	// When onClear is wired up and nothing is selected, show icon-only button
	const iconOnlyMode = !!onClear && !hasSelection && !alwaysShowLabel;

	return (
		<div className="relative flex gap-2">
			<Popover open={open} onOpenChange={setOpen}>
				<PopoverTrigger asChild>
					<Button
						disabled={disabled}
						variant="outline"
						className={cn(
							"flex h-10 rounded-[8px] bg-brand-bgLightgrey text-sm outline-none focus:ring-0",
							iconOnlyMode ? "w-9 justify-center p-0" : "w-full justify-between px-3 py-2",
							className
						)}
					>
						{!iconOnlyMode && (
							<div>
								{(!props.mode || props?.mode == "single") && (
									<>
										{value ? (
											toFormattedDate(value)
										) : (
											<span className="mt-0.5 text-xs font-normal text-brand-lightgrey">
												{placeholder ?? tCommon.pickDate}
											</span>
										)}
									</>
								)}
								{props?.mode == "range" && (
									<>
										{props.selected?.from && props.selected?.to ? (
											props.selected.from.toDateString() === props.selected.to.toDateString() ? (
												toFormattedDate(props.selected.from, DATE_FORMAT.DD_MMM)
											) : (
												getWeekRange(props.selected.from, props.selected.to)
											)
										) : props.selected?.from ? (
											toFormattedDate(props.selected.from)
										) : (
											<span className="mt-0.5 text-xs font-normal text-brand-lightgrey">
												{placeholder ?? tCommon.pickDateRange}
											</span>
										)}
									</>
								)}
							</div>
						)}

						{onClear && hasSelection ? (
							<span
								role="button"
								tabIndex={0}
								className="ml-1 flex items-center rounded-full p-0.5 hover:bg-brand-dark10"
								onClick={(e) => {
									e.stopPropagation();
									onClear();
								}}
								onKeyDown={(e) => {
									if (e.key === "Enter" || e.key === " ") {
										e.stopPropagation();
										onClear();
									}
								}}
							>
								<X className="h-3.5 w-3.5" />
							</span>
						) : (
							<CalendarIcon className={iconClassName} />
						)}
					</Button>
				</PopoverTrigger>
				<PopoverContent
					className="z-[9999] w-auto overflow-visible rounded-[10px] bg-white p-0"
					align="start"
					collisionPadding={8}
					avoidCollisions
					style={{
						maxHeight: "min(var(--radix-popover-content-available-height), 320px)",
					}}
				>
					{props.mode && props.mode != "single" && <Calendar {...props} />}
					{(!props.mode || props.mode == "single") && (
						<Calendar
							mode="single"
							selected={value ? toDate(value) : undefined}
							onSelect={(date) => {
								setOpen(false);
								if (date) {
									onChange?.(date);
								}
							}}
							initialFocus
							disabled={disabledDate}
						/>
					)}
				</PopoverContent>
			</Popover>
		</div>
	);
}
