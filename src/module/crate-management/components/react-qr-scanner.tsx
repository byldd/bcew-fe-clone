"use client";

import { useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import type { IDetectedBarcode, IScannerError } from "@yudiel/react-qr-scanner";
import { BarcodeDetector } from "barcode-detector/ponyfill";
import { Loader2, RotateCcw, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { extractCrateId } from "@/module/crate-management/utils/extract-crate-id";
import { ScanLine } from "@/module/crate-management/utils";

const Scanner = dynamic(() => import("@yudiel/react-qr-scanner").then((mod) => mod.Scanner), { ssr: false });

const MIN_SCANNING_DISPLAY_MS = 6000;

interface QRScannerProps {
	isActive: boolean;
	onScan: (crateId: string) => void;
}

export default function QRScanner({ isActive, onScan }: QRScannerProps) {
	const fileInputRef = useRef<HTMLInputElement>(null);
	const hasScannedRef = useRef(false);
	const cameraTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

	const [cameraError, setCameraError] = useState<string | null>(null);
	const [detectedCrateId, setDetectedCrateId] = useState<string | null>(null);
	const [fileScanError, setFileScanError] = useState<string | null>(null);
	const [filePreviewUrl, setFilePreviewUrl] = useState<string | null>(null);
	const [isScanningFile, setIsScanningFile] = useState(false);

	// Renders (and mounts) the camera only in the "idle" state — any error, success,
	// or file-scan takes over the box and the camera should be fully released.
	const isCameraRunning = isActive && !cameraError && !isScanningFile && !detectedCrateId && !fileScanError;

	const clearCameraTimeout = () => {
		if (cameraTimeoutRef.current) {
			clearTimeout(cameraTimeoutRef.current);
			cameraTimeoutRef.current = null;
		}
	};

	useEffect(() => {
		if (!isActive) return;
		setCameraError(null);
		setDetectedCrateId(null);
		setFileScanError(null);
		setFilePreviewUrl(null);
	}, [isActive]);

	useEffect(() => {
		if (!isCameraRunning) return;

		hasScannedRef.current = false;
		clearCameraTimeout();
		cameraTimeoutRef.current = setTimeout(() => {
			if (hasScannedRef.current) return;
			hasScannedRef.current = true;
			setFileScanError("Please scan a QR image.");
		}, MIN_SCANNING_DISPLAY_MS);

		return () => clearCameraTimeout();
	}, [isCameraRunning]);

	const handleScan = (detectedCodes: IDetectedBarcode[]) => {
		if (hasScannedRef.current) return;
		const rawValue = detectedCodes[0]?.rawValue;
		if (!rawValue) return;

		const crateId = extractCrateId(rawValue);
		hasScannedRef.current = true;
		clearCameraTimeout();

		if (!crateId) {
			setFileScanError("Please scan the correct QR code.");
			return;
		}

		setDetectedCrateId(crateId);
		onScan(crateId);
	};

	const handleCameraError = (_error: IScannerError) => {
		if (hasScannedRef.current) return;
		hasScannedRef.current = true;
		clearCameraTimeout();
		setCameraError("Camera access denied. Please allow camera access or use manual entry.");
	};

	const handleRetryCamera = () => {
		setFileScanError(null);
	};

	const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
		const file = event.target.files?.[0];
		event.target.value = "";
		if (!file) return;

		hasScannedRef.current = true;
		setCameraError(null);
		setFileScanError(null);
		setDetectedCrateId(null);
		setFilePreviewUrl(URL.createObjectURL(file));
		setIsScanningFile(true);

		const startedAt = Date.now();
		const waitForMinDisplayTime = async () => {
			const elapsed = Date.now() - startedAt;
			if (elapsed < MIN_SCANNING_DISPLAY_MS) {
				await new Promise((resolve) => setTimeout(resolve, MIN_SCANNING_DISPLAY_MS - elapsed));
			}
		};

		try {
			const detector = new BarcodeDetector({ formats: ["qr_code"] });
			const [result] = await detector.detect(file);
			const crateId = result ? extractCrateId(result.rawValue) : null;

			await waitForMinDisplayTime();

			if (!crateId) {
				setFileScanError("Please upload the correct QR code.");
				return;
			}

			setDetectedCrateId(crateId);
			onScan(crateId);
		} catch {
			await waitForMinDisplayTime();
			setFileScanError("Please upload a QR image.");
		} finally {
			setIsScanningFile(false);
		}
	};

	return (
		<div>
			<div className="relative h-64 w-full overflow-hidden rounded-2xl bg-black">
				{isCameraRunning && (
					<Scanner
						onScan={handleScan}
						onError={handleCameraError}
						constraints={{ facingMode: "environment" }}
						formats={["qr_code"]}
						sound={false}
						components={{ finder: false }}
						styles={{ container: { width: "100%", height: "100%", aspectRatio: "auto" } }}
					>
						<ScanLine />
						<div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
							<div className="mt-4 rounded-full bg-black/60 px-4 py-1">
								<span className="text-xs font-medium uppercase tracking-widest text-white">Align QR within frame</span>
							</div>
						</div>
					</Scanner>
				)}

				{cameraError && !isScanningFile && !filePreviewUrl && (
					<div className="absolute inset-0 flex items-center justify-center bg-black">
						<p className="px-6 text-center text-sm text-red-400">{cameraError}</p>
					</div>
				)}

				{!cameraError && isScanningFile && filePreviewUrl && (
					<div className="absolute inset-0">
						{/* eslint-disable-next-line @next/next/no-img-element */}
						<img src={filePreviewUrl} alt="Uploaded QR" className="h-64 w-full rounded-xl object-contain" />
						<ScanLine />
						<div className="pointer-events-none absolute inset-x-0 bottom-3 flex justify-center">
							<div className="flex items-center gap-1.5 rounded-full bg-black/60 px-4 py-1">
								<Loader2 className="h-3 w-3 animate-spin text-white" />
								<span className="text-xs font-medium uppercase tracking-widest text-white">Scanning image…</span>
							</div>
						</div>
					</div>
				)}

				{!cameraError && !isScanningFile && detectedCrateId && (
					<div className="absolute inset-0 flex flex-col items-center justify-center bg-green-50 text-center">
						<div className="mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
							<svg className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
								<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
							</svg>
						</div>
						<p className="text-sm font-semibold text-green-800">QR Code Detected</p>
						<p className="mt-1 text-xs text-green-600">{detectedCrateId}</p>
					</div>
				)}

				{!cameraError && !isScanningFile && !detectedCrateId && fileScanError && filePreviewUrl && (
					<div className="absolute inset-0">
						{/* eslint-disable-next-line @next/next/no-img-element */}
						<img src={filePreviewUrl} alt="Uploaded QR" className="h-64 w-full rounded-xl object-contain opacity-60" />
					</div>
				)}

				{!cameraError && !isScanningFile && !detectedCrateId && fileScanError && !filePreviewUrl && (
					<div className="absolute inset-0 flex items-center justify-center bg-black/40">
						<Button
							type="button"
							variant="outline"
							onClick={handleRetryCamera}
							className="h-auto gap-1.5 rounded-full border-white/40 bg-white/10 px-4 py-2 text-sm text-white hover:bg-white/20"
						>
							<RotateCcw className="h-4 w-4" />
							Retry
						</Button>
					</div>
				)}
			</div>

			<Button
				type="button"
				variant="outline"
				onClick={() => fileInputRef.current?.click()}
				className="mt-3 h-auto w-full gap-1.5 rounded-xl border-dashed border-gray-300 bg-white py-2.5 text-xs font-medium text-gray-500"
			>
				<Upload className="h-3.5 w-3.5" />
				Upload QR Code Image
			</Button>
			<Input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleFileSelect} />
			{fileScanError && <p className="mt-1.5 text-center text-xs text-red-500">{fileScanError}</p>}
		</div>
	);
}
