"use client";

import { useEffect, useRef, useState } from "react";
import { useClockAttendance } from "../hooks/useClockAttendance";
import { dateToUTCString, toFormattedDate } from "@/lib/utils/date";
import { DATE_FORMAT } from "@/types/date";
import { getErrorMessage } from "@/components/get-error-message";
import { openErrorToast, openSuccessToast } from "@/components/toast";
import { CLOCK_TYPE, ClockResult, IClockAttendanceResponse } from "@/module/matching-finger/types";
import {
	FingerprintSampleAcquiredEvent,
	FingerprintWebApi,
} from "@/module/warehouse-fingerprint/types/fingerprint-sdk";
import { isProductionEnv } from "@/utils";
import { Button } from "@/components/ui/button";
import { useGetUserData } from "@/module/profile/hooks/useProfile";
import { useModal } from "@/hooks/useModal";
import { AllocateTimeModal } from "../components/allocate-time-modal";
import { LiveClock } from "../components/live-clock";

export default function FingerprintMatch() {
	const [message, setMessage] = useState("Initializing...");
	const [isReady, setIsReady] = useState(false);
	const [isScanning, setIsScanning] = useState(false);
	const [result, setResult] = useState<ClockResult | null>(null);
	const [error, setError] = useState<string | null>(null);
	const [isMock, setIsMock] = useState(false);
	const { data } = useGetUserData();
	const user = data?.data?.user;

	const apiRef = useRef<FingerprintWebApi | null>(null);
	const processingRef = useRef(false);
	const acquisitionStartedRef = useRef(false);
	const clockAttendance = useClockAttendance();
	const clockAttendanceRef = useRef(clockAttendance);
	const { Modal: AllocateModal, openModal: openAllocateModal, closeModal: closeAllocateModal } = useModal();

	const handleClockResponse = (response: IClockAttendanceResponse) => {
		if (response.success) {
			setResult(response.data);
			setError(null);

			openSuccessToast(`Scan recorded successfully.`);

			setMessage(response.data.type === CLOCK_TYPE.IN ? "Clock In Successful" : "Clock Out Successful");

			if (response.data.allocation) {
				openAllocateModal({
					modalTitle: "Allocate Your Time",
					modalView: (
						<AllocateTimeModal
							technicianName={response.data.name}
							onClose={closeAllocateModal}
							date={response.data.allocation.date}
							employeeId={response.data.allocation.employeeId}
						/>
					),
					variant: "medium",
					showDefaultClose: false,
				});
			}

			return;
		}

		const errorMessage = response.message || "Attendance failed";
		setError(errorMessage);
		openErrorToast({ message: errorMessage });
	};

	// Mock scan handler for testing on local without actual fingerprint scanner
	const handleMockScan = async () => {
		if (processingRef.current) return;
		processingRef.current = true;

		try {
			setMessage("Processing fingerprint (mock)...");

			const response = await clockAttendanceRef.current.mutateAsync({
				template: "mock-template",
				time: dateToUTCString(new Date()),
			});

			handleClockResponse(response);
		} catch (err) {
			const msg = getErrorMessage(err as Error, "Attendance failed");
			setError(msg);
			openErrorToast({ message: msg });
		} finally {
			setTimeout(() => {
				setMessage("Place your finger on scanner");
				processingRef.current = false;
			}, 2000);
		}
	};

	const handleClockResponseRef = useRef(handleClockResponse);

	useEffect(() => {
		clockAttendanceRef.current = clockAttendance;
	}, [clockAttendance]);

	useEffect(() => {
		handleClockResponseRef.current = handleClockResponse;
	});

	useEffect(() => {
		if (result || error) {
			const timer = setTimeout(() => {
				setResult(null);
				setError(null);
				setMessage("Place your finger on scanner");
			}, 5000);

			return () => clearTimeout(timer);
		}
	}, [result, error]);

	useEffect(() => {
		let mounted = true;
		const isNonProd = isProductionEnv() === false;

		const waitForSdk = async () => {
			return new Promise<void>((resolve, reject) => {
				let attempts = 0;

				const interval = setInterval(() => {
					attempts++;

					if (typeof window !== "undefined" && window.Fingerprint && window.Fingerprint.WebApi) {
						clearInterval(interval);

						resolve();
					}

					if (attempts > 20) {
						clearInterval(interval);

						reject(new Error("Fingerprint SDK not loaded"));
					}
				}, 500);
			});
		};

		const startScanner = async (api: FingerprintWebApi) => {
			if (acquisitionStartedRef.current) return;

			try {
				acquisitionStartedRef.current = true;
				await api.startAcquisition(window.Fingerprint.SampleFormat.PngImage);
				if (!mounted) return;
				setMessage("Place your finger on scanner");
			} catch {
				acquisitionStartedRef.current = false;
				setMessage("Failed to start scanner");
			}
		};

		const stopScanner = async (api: FingerprintWebApi) => {
			if (!acquisitionStartedRef.current) return;
			await api.stopAcquisition();
			acquisitionStartedRef.current = false;
		};

		const initializeReader = async () => {
			try {
				setMessage("Loading fingerprint SDK...");
				await waitForSdk();
				if (!mounted) return;

				setMessage("Initializing scanner...");

				const api = new window.Fingerprint.WebApi();
				apiRef.current = api;

				api.onDeviceConnected = () => {
					if (!mounted) return;
					setIsReady(true);
					setMessage("Scanner connected");
				};

				api.onDeviceDisconnected = () => {
					if (!mounted) return;
					setIsReady(false);
					setIsScanning(false);
					acquisitionStartedRef.current = false;
					setMessage("Scanner disconnected");
					if (isNonProd) setIsMock(true);
				};

				api.onCommunicationFailed = () => {
					if (!mounted) return;
					setMessage("Cannot connect to reader service");
				};

				api.onAcquisitionStarted = () => {
					if (!mounted) return;
					setIsScanning(true);
				};

				api.onAcquisitionStopped = () => {
					if (!mounted) return;
					setIsScanning(false);
					acquisitionStartedRef.current = false;
				};

				api.onSamplesAcquired = async (event: FingerprintSampleAcquiredEvent) => {
					if (processingRef.current) return;
					processingRef.current = true;

					try {
						setMessage("Processing fingerprint...");
						await stopScanner(api);

						const samples = JSON.parse(event.samples);
						const base64 = window.btoa(window.Fingerprint.b64UrlToUtf8(samples[0]));
						const response = await clockAttendanceRef.current.mutateAsync({
							template: base64,
							time: dateToUTCString(new Date()),
						});

						handleClockResponseRef.current(response);
					} catch (error: unknown) {
						const msg = getErrorMessage(error as Error, "Attendance failed");
						setError(msg);
						openErrorToast({
							message: msg,
						});
					} finally {
						setTimeout(async () => {
							try {
								if (!mounted) return;

								setMessage("Place your finger on scanner");

								// IMPORTANT:
								// wait small cooldown before restart
								await new Promise((resolve) => setTimeout(resolve, 800));

								// restart scanner
								await startScanner(api);

								processingRef.current = false;
							} catch {
								processingRef.current = false;
								setMessage("Failed to restart scanner");
							}
						}, 2000);
					}
				};

				const devices = await api.enumerateDevices();

				if (!devices || devices.length === 0) {
					setMessage("No fingerprint scanner found");

					return;
				}

				if (!mounted) return;

				setIsReady(true);

				await startScanner(api);
			} catch (error: unknown) {
				const errorMessage = getErrorMessage(error as Error, "Scanner initialization failed");
				setMessage(errorMessage);
				openErrorToast({
					message: errorMessage,
				});
			}
		};

		const initializeMock = () => {
			setIsMock(true);
			setMessage("Click 'Test Scan' to simulate fingerprint");
			setIsReady(false);
			setIsScanning(false);
		};

		const shouldMock = async () => {
			if (!isNonProd) return false;
			try {
				await waitForSdk();
				if (!mounted) return true;

				const api = new window.Fingerprint.WebApi();
				const devices = await api.enumerateDevices();
				return !devices || devices.length === 0;
			} catch {
				return true;
			}
		};

		const init = async () => {
			const useMock = await shouldMock();
			if (!mounted) return;
			if (useMock) {
				initializeMock();
				return;
			}
			setIsMock(false);
			await initializeReader();
		};

		init();

		return () => {
			mounted = false;

			if (apiRef.current) {
				apiRef.current.stopAcquisition();
			}
		};
	}, []);

	return (
		<div className="w-[480px] rounded-2xl bg-white p-8 shadow-2xl">
			{/* Header */}
			<div className="mb-8 text-center">
				<h1 className="text-2xl font-bold text-gray-900">Warehouse Clock In/Out</h1>

				<LiveClock />
			</div>

			{/* Scanner Visual */}
			<div className="mb-8 flex flex-col items-center">
				<div
					className={`flex h-40 w-40 items-center justify-center rounded-full border-4 ${
						result
							? result.type === CLOCK_TYPE.IN
								? "border-green-400 bg-green-50"
								: "border-blue-400 bg-blue-50"
							: error
								? "border-red-400 bg-red-50"
								: isScanning
									? "animate-pulse border-yellow-400 bg-yellow-50"
									: "border-gray-200 bg-gray-50"
					}`}
				>
					<svg
						className={`h-20 w-20 ${
							result
								? result.type === CLOCK_TYPE.IN
									? "text-green-500"
									: "text-blue-500"
								: error
									? "text-red-400"
									: isScanning
										? "text-yellow-500"
										: "text-gray-300"
						}`}
						fill="currentColor"
						viewBox="0 0 24 24"
					>
						<path d="M17.81 4.47c-.08 0-.16-.02-.23-.06C15.66 3.42 14 3 12.01 3c-1.98 0-3.86.47-5.57 1.41-.24.13-.54.04-.68-.2-.13-.24-.04-.55.2-.68C7.82 2.52 9.86 2 12.01 2c2.13 0 3.99.47 6.03 1.52.25.13.34.43.21.67-.09.18-.26.28-.44.28zM3.5 9.72c-.1 0-.2-.03-.29-.09-.23-.16-.28-.47-.12-.7.99-1.4 2.25-2.5 3.75-3.27C9.98 4.04 14 4.03 17.15 6.07c1.5.89 2.75 2.08 3.79 3.52.16.23.1.54-.13.7-.23.16-.54.1-.7-.13-1-1.37-2.15-2.47-3.54-3.27-2.9-1.82-6.61-1.81-9.49.01-1.36.74-2.52 1.85-3.4 3.21-.08.14-.23.21-.38.21zm6.25 12.07c-.13 0-.26-.05-.35-.15-.87-.87-1.34-1.43-2.01-2.64-.69-1.23-1.05-2.73-1.05-4.34 0-2.97 2.54-5.39 5.66-5.39s5.66 2.42 5.66 5.39c0 .28-.22.5-.5.5s-.5-.22-.5-.5c0-2.42-2.09-4.39-4.66-4.39-2.57 0-4.66 1.97-4.66 4.39 0 1.44.32 2.77.93 3.85.64 1.15 1.08 1.64 1.85 2.42.19.2.19.51 0 .71-.11.1-.24.15-.37.15zm7.17-1.85c-1.19 0-2.24-.3-3.1-.89-1.49-1.01-2.38-2.65-2.38-4.39 0-.28.22-.5.5-.5s.5.22.5.5c0 1.41.72 2.74 1.94 3.56.71.48 1.54.71 2.54.71.24 0 .64-.03 1.04-.1.27-.05.53.13.58.41.05.27-.13.53-.41.58-.57.11-1.07.12-1.21.12zM14.91 22c-.04 0-.09-.01-.13-.02-1.59-.44-2.63-1.03-3.72-2.1-1.4-1.39-2.17-3.24-2.17-5.22 0-1.62 1.38-2.94 3.08-2.94 1.7 0 3.08 1.32 3.08 2.94 0 1.07.93 1.94 2.08 1.94s2.08-.87 2.08-1.94c0-3.77-3.25-6.83-7.25-6.83-2.84 0-5.44 1.58-6.61 4.03-.39.81-.59 1.76-.59 2.8 0 .78.07 2.01.67 3.61.1.26-.03.55-.29.64-.26.1-.55-.04-.64-.29-.49-1.31-.73-2.61-.73-3.96 0-1.2.23-2.29.68-3.24 1.33-2.79 4.28-4.59 7.51-4.59 4.55 0 8.25 3.51 8.25 7.83 0 1.62-1.38 2.94-3.08 2.94s-3.08-1.32-3.08-2.94c0-1.07-.93-1.94-2.08-1.94s-2.08.87-2.08 1.94c0 1.71.66 3.31 1.87 4.51.95.94 1.86 1.46 3.27 1.85.27.07.42.35.35.61-.05.23-.26.38-.47.38z" />
					</svg>
				</div>
			</div>

			{/* Result */}
			{result && (
				<div
					className={`mb-6 rounded-xl p-4 text-center ${
						result.type === CLOCK_TYPE.IN ? "border border-green-200 bg-green-50" : "border border-blue-200 bg-blue-50"
					}`}
				>
					<p className={`text-2xl font-bold ${result.type === CLOCK_TYPE.IN ? "text-green-700" : "text-blue-700"}`}>
						{(result.type === CLOCK_TYPE.IN || result.type === CLOCK_TYPE.OUT) && "✓ Scan Recorded"}
					</p>
					<p className="mt-1 text-lg font-medium text-gray-700">{result.name}</p>
					<p className="mt-1 text-sm text-gray-500">{toFormattedDate(result.timestamp, DATE_FORMAT.HH_MM_AA_PM)}</p>
					<p className="mt-2 text-xs text-gray-400">Awaiting next scan...</p>
				</div>
			)}

			{/* Footer */}
			{isMock && !!user && !isProductionEnv() && (
				<Button onClick={handleMockScan} className="mb-4 rounded bg-black px-4 py-2 text-white">
					Test Scan
				</Button>
			)}
			<div className="text-center text-xs text-gray-400">
				{isMock ? "Mock Mode" : isReady ? "Scanner Connected" : "Waiting for scanner connection..."}
			</div>

			<AllocateModal />
		</div>
	);
}
