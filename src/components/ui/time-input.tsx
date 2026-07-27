import { dateToUTCString, setTime, toDate, toFormattedDate } from "@/lib/utils/date";
import { DATE_FORMAT } from "@/types/date";
import React, { useEffect, useRef, useState } from "react";
import { FiClock } from "react-icons/fi";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "./button";
import { IoIosArrowDown, IoIosArrowUp } from "react-icons/io";

enum Period {
	AM = "AM",
	PM = "PM",
}

const TimeInput = ({
	onChange,
	value = "",
	date,
	minuteStep = 15,
	disabled = false,
	placeholder = "--:--",
}: {
	onChange?: (value: string) => void;
	value?: Date | string;
	date: Date | string;
	minuteStep?: number;
	disabled?: boolean;
	placeholder?: string;
}) => {
	const [isOpen, setIsOpen] = useState(false);

	const selectedTime = value ? toFormattedDate(value, DATE_FORMAT.HH_MM_AA_PM) : "";

	const getTimeValues = () => {
		if (!value) return { hour: 12, minute: 0, period: Period.AM };
		const dateObj = toDate(value);
		const hours24 = dateObj.getHours();
		const minutes = dateObj.getMinutes();
		const period: Period = hours24 >= 12 ? Period.PM : Period.AM;
		const hours12 = hours24 === 0 ? 12 : hours24 > 12 ? hours24 - 12 : hours24;
		return { hour: hours12, minute: minutes, period };
	};

	const { hour: initHour, minute: initMinute, period: initPeriod } = getTimeValues();

	const [hourInput, setHourInput] = useState<string>(initHour.toString().padStart(2, "0"));
	const [minuteInput, setMinuteInput] = useState<string>(initMinute.toString().padStart(2, "0"));
	const [period, setPeriod] = useState<Period>(initPeriod);

	const [, setStep] = useState<"hour" | "minute" | "period">("hour");

	const hourRef = useRef<HTMLInputElement | null>(null);
	const minuteRef = useRef<HTMLInputElement | null>(null);
	const periodRef = useRef<HTMLButtonElement | null>(null);

	useEffect(() => {
		if (isOpen) {
			setHourInput(initHour.toString().padStart(2, "0"));
			setMinuteInput(initMinute.toString().padStart(2, "0"));
			setPeriod(initPeriod);
			setStep("hour");
			setTimeout(() => hourRef.current?.focus(), 50);
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [isOpen]);

	const digitsOnly = (s: string) => s.replace(/\D/g, "");

	const handleHourChange = (raw: string) => {
		const s = digitsOnly(raw).slice(0, 2); // max 2 digits
		setHourInput(s);
		const n = parseInt(s, 10);

		if (!isNaN(n)) {
			if (
				s.length >= 2 ||
				(n >= 1 && n <= 9 && s.length === 1 && n >= 1 && n <= 9 && s.length === 1 && n >= 1 && n <= 9 && false)
			) {
			}
			if (s.length >= 2) {
				if (n >= 1 && n <= 12) {
					setTimeout(() => {
						setStep("minute");
						minuteRef.current?.focus();
					}, 0);
				} else {
					const clamp = Math.max(1, Math.min(12, n || 12));
					setHourInput(clamp.toString().padStart(2, "0"));
					setTimeout(() => {
						setStep("minute");
						minuteRef.current?.focus();
					}, 0);
				}
			}
		}
	};

	const finalizeHour = () => {
		const n = parseInt(digitsOnly(hourInput || "0"), 10);
		const valid = !isNaN(n) && n >= 1 && n <= 12;
		if (!valid) {
			setHourInput("12");
		} else {
			setHourInput(n.toString().padStart(2, "0"));
		}
		setStep("minute");
		minuteRef.current?.focus();
		commitChange();
	};

	const handleMinuteChange = (raw: string) => {
		const s = digitsOnly(raw).slice(0, 2);
		setMinuteInput(s);
		if (s.length >= 2) {
			finalizeMinute(s);
		}
	};

	const snapMinute = (m: number) => {
		if (m <= 7) return 0;
		if (m <= 22) return 15;
		if (m <= 37) return 30;
		if (m <= 52) return 45;
		return 60; // overflow case
	};

	const finalizeMinute = (s?: string) => {
		const str = s ?? digitsOnly(minuteInput || "0");
		let n = parseInt(str || "0", 10);
		if (isNaN(n)) n = 0;

		n = Math.max(0, Math.min(59, n));

		let h = parseInt(hourInput || "12", 10);
		if (isNaN(h)) h = 12;

		// ONLY SNAP when step is 15
		if (minuteStep === 15) {
			const snapped = snapMinute(n);

			// HANDLE OVERFLOW
			if (snapped === 60) {
				const newHour = h >= 12 ? 1 : h + 1;

				setHourInput(newHour.toString().padStart(2, "0"));
				setMinuteInput("00");

				setStep("period");
				setTimeout(() => periodRef.current?.focus(), 0);

				commitChange(0, undefined, newHour);
				return;
			}

			setMinuteInput(snapped.toString().padStart(2, "0"));

			setStep("period");
			setTimeout(() => periodRef.current?.focus(), 0);

			commitChange(snapped, undefined, h);
			return;
		}

		// NO SNAPPING (free input mode)
		setMinuteInput(n.toString().padStart(2, "0"));

		setStep("period");
		setTimeout(() => periodRef.current?.focus(), 0);

		commitChange(n, undefined, h);
	};

	const commitChange = (minuteOverride?: number, periodOverride?: Period, hourOverride?: number) => {
		const hRaw = hourOverride ?? parseInt(digitsOnly(hourInput || "0"), 10);
		const mRaw = typeof minuteOverride === "number" ? minuteOverride : parseInt(digitsOnly(minuteInput || "0"), 10);

		const validHour = !isNaN(hRaw) && hRaw >= 1 && hRaw <= 12 ? hRaw : 12;
		const validMinute = !isNaN(mRaw) && mRaw >= 0 && mRaw <= 59 ? mRaw : 0;

		const currentPeriod = periodOverride ?? period;

		const hours24 =
			currentPeriod === Period.AM ? (validHour === 12 ? 0 : validHour) : validHour === 12 ? 12 : validHour + 12;

		const timeString = `${hours24.toString().padStart(2, "0")}:${validMinute.toString().padStart(2, "0")}`;

		const newTime = dateToUTCString(setTime(toDate(date), timeString));

		onChange?.(newTime);
	};

	const onHourKeyDown: React.KeyboardEventHandler<HTMLInputElement> = (e) => {
		if (e.key === "Enter") {
			e.preventDefault();
			finalizeHour();
		}
	};

	const onMinuteKeyDown: React.KeyboardEventHandler<HTMLInputElement> = (e) => {
		if (e.key === "Enter") {
			e.preventDefault();
			finalizeMinute();
		}
	};

	useEffect(() => {
		setHourInput(initHour.toString().padStart(2, "0"));
		setMinuteInput(initMinute.toString().padStart(2, "0"));
		setPeriod(initPeriod);
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [value]);

	const incHour = () => {
		let h = parseInt(hourInput || "12", 10);
		if (h >= 12) return;
		h = h + 1;
		setHourInput(h.toString().padStart(2, "0"));
		commitChange(undefined, undefined, h);
	};

	const decHour = () => {
		let h = parseInt(hourInput || "12", 10);
		if (h <= 1) return;
		h = h - 1;
		setHourInput(h.toString().padStart(2, "0"));
		commitChange(undefined, undefined, h);
	};

	const incMinute = () => {
		let m = parseInt(minuteInput || "0", 10);
		if (m + minuteStep >= 60) return;
		m = m + minuteStep;
		setMinuteInput(m.toString().padStart(2, "0"));
		commitChange(m);
	};

	const decMinute = () => {
		let m = parseInt(minuteInput || "0", 10);
		if (m - minuteStep < 0) return;
		m = m - minuteStep;
		setMinuteInput(m.toString().padStart(2, "0"));
		commitChange(m);
	};

	const togglePeriodArrow = () => {
		const newPeriod = period === Period.AM ? Period.PM : Period.AM;
		setPeriod(newPeriod);
		commitChange(undefined, newPeriod);
	};

	return (
		<div className="">
			<Popover open={isOpen} onOpenChange={(open) => !disabled && setIsOpen(open)}>
				<PopoverTrigger asChild>
					<div
						className={`relative flex h-10 min-w-full items-center rounded-[10px] px-2 py-1.5 ${disabled ? "cursor-not-allowed bg-gray-200 opacity-60" : "cursor-pointer bg-brand-bgLightgrey"}`}
					>
						<input
							readOnly
							type="text"
							value={selectedTime}
							placeholder={placeholder}
							disabled={disabled}
							className={`w-full border-none bg-transparent text-sm outline-none ${
								disabled ? "cursor-not-allowed" : "cursor-pointer"
							}`}
						/>

						<FiClock size={18} className={`absolute right-2 ${disabled ? "text-gray-400" : "text-brand-dark"}`} />
					</div>
				</PopoverTrigger>

				<PopoverContent
					align="start"
					sideOffset={6}
					className="w-fit rounded-[8px] bg-white px-2 py-0 shadow-md"
					onOpenAutoFocus={(e) => e.preventDefault()}
				>
					<div className="flex items-center gap-3">
						{/* Hour */}
						<div className="flex flex-col items-center">
							<Button onClick={decHour} className="!px-0 !py-0 text-brand-dark">
								<IoIosArrowUp />
							</Button>

							<input
								ref={hourRef}
								className="w-10 bg-transparent text-center font-inter text-sm text-brand-dark outline-none"
								value={hourInput}
								onChange={(e) => handleHourChange(e.target.value)}
								onKeyDown={onHourKeyDown}
								onBlur={finalizeHour}
								maxLength={2}
							/>

							<Button onClick={incHour} className="!px-0 !py-0 text-brand-dark">
								<IoIosArrowDown />
							</Button>
						</div>

						<span className="text-lg font-semibold text-brand-dark">:</span>

						{/* Minute */}
						<div className="flex flex-col items-center">
							<Button onClick={decMinute} className="!px-0 !py-0 text-brand-dark">
								<IoIosArrowUp />
							</Button>

							<input
								ref={minuteRef}
								className="w-10 bg-transparent text-center font-inter text-sm text-brand-dark outline-none"
								value={minuteInput}
								onChange={(e) => handleMinuteChange(e.target.value)}
								onKeyDown={onMinuteKeyDown}
								onBlur={() => finalizeMinute()}
								maxLength={2}
							/>

							<Button onClick={incMinute} className="!px-0 !py-0 text-brand-dark">
								<IoIosArrowDown />
							</Button>
						</div>

						{/* AM / PM */}
						<div className="flex flex-col items-center">
							<span className="mt-10 w-10 text-center font-inter text-sm text-brand-dark">{period}</span>

							<Button onClick={togglePeriodArrow} className="!px-0 !py-0 text-brand-dark">
								<IoIosArrowDown />
							</Button>
						</div>
					</div>
				</PopoverContent>
			</Popover>
		</div>
	);
};

export default TimeInput;
