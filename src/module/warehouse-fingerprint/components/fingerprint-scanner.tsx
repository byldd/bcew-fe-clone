"use client";

import { useEffect } from "react";
import { MdOutlineFingerprint } from "react-icons/md";

interface Props {
	message: string;
	isCapturing: boolean;
	isCompleted: boolean;
	progressPercentage: number;
}

const FP_SCAN_KEYFRAMES = `
@keyframes fp-scan-line {
  0%   { transform: translateY(-68px); opacity: 1; }
  100% { transform: translateY(68px);  opacity: 1; }
}
@keyframes fp-ring-pulse {
  0%, 100% { box-shadow: 0 0 0 0px rgba(59,130,246,0.45); }
  50%       { box-shadow: 0 0 0 9px rgba(59,130,246,0);    }
}
`;

export default function FingerprintScanner({ message, isCapturing, isCompleted, progressPercentage }: Props) {
	const scannerState = isCompleted ? "success" : isCapturing ? "scanning" : "idle";

	useEffect(() => {
		const styleId = "fp-scanner-keyframes";
		if (!document.getElementById(styleId)) {
			const styleEl = document.createElement("style");
			styleEl.id = styleId;
			styleEl.textContent = FP_SCAN_KEYFRAMES;
			document.head.appendChild(styleEl);
		}
	}, []);

	const stateMessage =
		scannerState === "success"
			? "Fingerprint Captured"
			: scannerState === "scanning"
				? "Scanning… don't move your finger"
				: message;

	return (
		<>
			{scannerState === "scanning" && (
				<style>{`
					/* Scan line travels from top to bottom of the circle using translateY.
					   translateY(-68px) = top edge of 144px circle, +68px = bottom edge.  */
					@keyframes fp-scan {
						0%   { transform: translateY(-68px); opacity: 0; }
						8%   { opacity: 1; }
						80%  { transform: translateY(68px);  opacity: 1; }
						92%  { transform: translateY(68px);  opacity: 0; }
						93%  { transform: translateY(-68px); opacity: 0; }
						100% { transform: translateY(-68px); opacity: 0; }
					}

					/* Outer ring pulses outward like a sonar ping */
					@keyframes fp-ring {
						0%   { box-shadow: 0 0 0 0   rgba(59,130,246,0.45); }
						60%  { box-shadow: 0 0 0 10px rgba(59,130,246,0);   }
						100% { box-shadow: 0 0 0 0   rgba(59,130,246,0);   }
					}

					/* Icon gently dims and brightens */
					@keyframes fp-icon-breathe {
						0%, 100% { opacity: 1;    }
						50%       { opacity: 0.55; }
					}
				`}</style>
			)}

			<div className="flex flex-col items-center justify-center py-4">
				{/* ── Scanner circle ──────────────────────────────────────────── */}
				<div
					className={`relative flex h-36 w-36 items-center justify-center overflow-hidden rounded-full border-2 transition-all duration-300 ${
						scannerState === "success"
							? "border-[#0CC312] bg-[#0CC3120A]"
							: scannerState === "scanning"
								? "border-[#3B82F6] bg-[#3B82F60A]"
								: "border-brand-dark60 bg-[#1515150A]"
					}`}
					style={scannerState === "scanning" ? { animation: "fp-ring 1.6s ease-out infinite" } : undefined}
				>
					{/* Fingerprint icon */}
					<MdOutlineFingerprint
						className={`h-20 w-20 ${
							scannerState === "success"
								? "text-[#0CC312]"
								: scannerState === "scanning"
									? "text-[#3B82F6]"
									: "text-brand-dark60"
						}`}
						style={scannerState === "scanning" ? { animation: "fp-icon-breathe 1.6s ease-in-out infinite" } : undefined}
					/>

					{/* Scan line — centred then moved with translateY so overflow:hidden clips it cleanly */}
					{scannerState === "scanning" && (
						<div
							className="absolute left-0 right-0 h-[2px]"
							style={{
								top: "50%",
								marginTop: "-1px",
								background: "linear-gradient(90deg, transparent, #3B82F6 20%, #93C5FD 50%, #3B82F6 80%, transparent)",
								boxShadow: "0 0 8px 3px rgba(59,130,246,0.7), 0 0 18px 6px rgba(59,130,246,0.3)",
								animation: "fp-scan 2s cubic-bezier(0.45,0,0.55,1) infinite",
							}}
						/>
					)}
				</div>

				{/* ── Status text ─────────────────────────────────────────────── */}
				<p
					className={`mt-6 text-sm font-medium ${
						scannerState === "success"
							? "text-[#0CC312]"
							: scannerState === "scanning"
								? "text-[#3B82F6]"
								: "text-brand-dark80"
					}`}
				>
					{stateMessage}
				</p>

				<p className="mt-1 text-xs text-brand-dark60">
					Place your finger flat on the sensor. Hold still for 2 seconds.
				</p>

				{/* ── Progress bar ─────────────────────────────────────────────── */}
				<div className="mt-3 h-1.5 w-full max-w-sm overflow-hidden rounded-full bg-gray-200">
					<div
						className={`h-full rounded-full transition-all duration-500 ${
							scannerState === "success"
								? "bg-[#0CC312]"
								: scannerState === "scanning"
									? "bg-[#3B82F6]"
									: "bg-brand-dark60"
						}`}
						style={{ width: `${progressPercentage}%` }}
					/>
				</div>

				<p className="mt-2 text-sm font-medium text-gray-600">{progressPercentage}%</p>
			</div>
		</>
	);
}
