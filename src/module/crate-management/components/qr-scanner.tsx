"use client";

import { useCallback, useEffect, useId, useRef, useState } from "react";
import { Html5Qrcode } from "html5-qrcode";
import { Loader2, RotateCcw, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { extractCrateId } from "../utils/extract-crate-id";
import { scanFileWithTimeout, ScanLine } from "../utils";

const MIN_SCANNING_DISPLAY_MS = 6000;

interface QRScannerProps {
	isActive: boolean;
	onScan: (crateId: string) => void;
}

export default function QRScanner({ isActive, onScan }: QRScannerProps) {
	const containerId = `qr-scanner-${useId().replace(/:/g, "")}`;
	const scannerRef = useRef<Html5Qrcode | null>(null);
	const startPromiseRef = useRef<Promise<unknown> | null>(null);
	const fileInputRef = useRef<HTMLInputElement>(null);
	const hasScannedRef = useRef(false);
	const cameraTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

	const [cameraError, setCameraError] = useState<string | null>(null);
	const [detectedCrateId, setDetectedCrateId] = useState<string | null>(null);
	const [fileScanError, setFileScanError] = useState<string | null>(null);
	const [filePreviewUrl, setFilePreviewUrl] = useState<string | null>(null);
	const [isScanningFile, setIsScanningFile] = useState(false);

	const clearCameraTimeout = () => {
		if (cameraTimeoutRef.current) {
			clearTimeout(cameraTimeoutRef.current);
			cameraTimeoutRef.current = null;
		}
	};

	const startCamera = useCallback((scanner: Html5Qrcode) => {
		// html5-qrcode samples its decode canvas from the video element's clientWidth/clientHeight
		// vs. its actual videoWidth/videoHeight. Our CSS forces the video into a fixed-height,
		// object-cover box, so without requesting a matching aspectRatio here the camera's native
		// stream ratio never lines up with the rendered box — every frame samples the wrong region
		// and decoding silently fails forever on real devices (frame misses are intentionally ignored below).
		const container = document.getElementById(containerId);
		const aspectRatio =
			container && container.clientHeight ? container.clientWidth / container.clientHeight : undefined;

		clearCameraTimeout();
		cameraTimeoutRef.current = setTimeout(() => {
			if (hasScannedRef.current) return;
			hasScannedRef.current = true;
			scanner.stop().catch(() => {});
			setFileScanError("Please scan a QR image.");
		}, MIN_SCANNING_DISPLAY_MS);

		const startPromise = scanner
			.start(
				{ facingMode: "environment" },
				{ fps: 10, qrbox: { width: 220, height: 220 }, aspectRatio },
				(decodedText) => {
					if (hasScannedRef.current) return;
					const crateId = extractCrateId(decodedText);
					if (!crateId) {
						hasScannedRef.current = true;
						clearCameraTimeout();
						setFileScanError("Please scan the correct QR code.");
						scanner.stop().catch(() => {});
						return;
					}
					hasScannedRef.current = true;
					clearCameraTimeout();
					setDetectedCrateId(crateId);
					scanner.stop().catch(() => {});
					onScan(crateId);
				},
				() => {
					// per-frame decode miss — expected while aligning, ignore
				}
			)
			.catch(() => {
				clearCameraTimeout();
				setCameraError("Camera access denied. Please allow camera access or use manual entry.");
			});

		startPromiseRef.current = startPromise;
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	useEffect(() => {
		if (!isActive) return;

		setCameraError(null);
		setDetectedCrateId(null);
		setFileScanError(null);
		setFilePreviewUrl(null);
		hasScannedRef.current = false;

		const scanner = new Html5Qrcode(containerId, { verbose: false });
		scannerRef.current = scanner;
		startCamera(scanner);

		return () => {
			clearCameraTimeout();
			if (scanner.isScanning) {
				scanner.stop().catch(() => {});
			}
		};
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [isActive, containerId]);

	const handleRetryCamera = () => {
		const scanner = scannerRef.current;
		if (!scanner) return;

		setFileScanError(null);
		hasScannedRef.current = false;
		startCamera(scanner);
	};

	const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
		const file = event.target.files?.[0];
		event.target.value = "";
		if (!file) return;

		const scanner = scannerRef.current;
		if (!scanner) return;

		clearCameraTimeout();
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
			// scanFile() looks up the container div via document.getElementById inside an
			// async Image.onload callback — that div must stay mounted the whole time, or
			// the lookup returns null and the callback throws silently, hanging forever.
			await startPromiseRef.current?.catch(() => {});

			if (scanner.isScanning) {
				await scanner.stop();
			}
			scanner.clear();

			const decodedText = await scanFileWithTimeout(scanner, file);
			hasScannedRef.current = true;
			const crateId = extractCrateId(decodedText);

			await waitForMinDisplayTime();

			if (!crateId) {
				setFileScanError("Please upload the correct QR code.");
				if (isActive) startCamera(scanner);
				return;
			}

			setDetectedCrateId(crateId);
			onScan(crateId);
		} catch {
			await waitForMinDisplayTime();
			setFileScanError("Please upload a QR image.");
			if (isActive) startCamera(scanner);
		} finally {
			setIsScanningFile(false);
		}
	};

	return (
		<div>
			<div className="relative overflow-hidden rounded-2xl bg-black">
				<div
					id={containerId}
					className="h-64 w-full [&_canvas]:hidden [&_video]:h-64 [&_video]:w-full [&_video]:object-cover"
				/>

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

				{!cameraError && !isScanningFile && !detectedCrateId && !fileScanError && (
					<>
						<ScanLine />
						<div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
							<div className="mt-4 rounded-full bg-black/60 px-4 py-1">
								<span className="text-xs font-medium uppercase tracking-widest text-white">Align QR within frame</span>
							</div>
						</div>
					</>
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
