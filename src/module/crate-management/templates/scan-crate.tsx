"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import axios, { HttpStatusCode } from "axios";
import { Camera, Keyboard } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { routes } from "@/config/routes";
import { useHandleFileUpload } from "@/hooks/useFile";
import { openErrorToast } from "@/components/toast";
import type { IFileUploadable } from "@/types/file-upload";
import QRScanner from "../components/qr-scanner";
import SealIntactPrompt from "../components/seal-intact-prompt";
import UploadCrateImages from "../components/upload-crate-images";
import EnterSealTag from "../components/enter-seal-tag";
import ConfirmAction from "../components/confirm-action";
import ReceiveProcessing from "../components/receive-processing";
import ReceiveSuccess from "../components/receive-success";
import ReturnSuccess from "../components/return-success";
import ScreenHeader from "../components/screen-header";
import {
	useCheckCrateScanStatus,
	useCreateCrateReceiveEvent,
	useResolveCrateForConfirmation,
} from "../hooks/useCrateManagement";
import {
	ICrateConfirmationDetails,
	ICrateReceiveScanSummary,
	ICrateReturnScanSummary,
	ICrateScanSummary,
} from "../types";
import { CRATE_SCAN_ACTION, RECEIVE_STEP, SCANNER_TAB } from "../enums";

const SCAN_SCREEN_TITLE: Record<CRATE_SCAN_ACTION, string> = {
	[CRATE_SCAN_ACTION.CRATE_SCANNED_TO_RECEIVE]: "Scan to Receive",
	[CRATE_SCAN_ACTION.CRATE_SCANNED_TO_RETURN]: "Scan to Initiate Return",
};

interface ScanCrateTemplateProps {
	action: CRATE_SCAN_ACTION;
}

export default function ScanCrateTemplate({ action }: ScanCrateTemplateProps) {
	const isReturn = action === CRATE_SCAN_ACTION.CRATE_SCANNED_TO_RETURN;
	const router = useRouter();
	const [step, setStep] = useState<RECEIVE_STEP>(RECEIVE_STEP.SCAN);
	const [activeTab, setActiveTab] = useState<SCANNER_TAB>(SCANNER_TAB.CAMERA);
	const [crateIdInput, setCrateIdInput] = useState("");
	const [sealPromptCrateId, setSealPromptCrateId] = useState<string | null>(null);
	const [crateId, setCrateId] = useState<string | null>(null);
	const [sealIntact, setSealIntact] = useState<boolean | null>(null);
	const [detectionTime, setDetectionTime] = useState<Date | null>(null);
	const [uploadedPhotos, setUploadedPhotos] = useState<File[]>([]);
	const [note, setNote] = useState("");
	const [confirmationDetails, setConfirmationDetails] = useState<ICrateConfirmationDetails | null>(null);
	const [scanSummary, setScanSummary] = useState<ICrateScanSummary | null>(null);
	const [scannerKey, setScannerKey] = useState(0);

	const { getFilesToUpload, getSignedUrls, handleFileUpload } = useHandleFileUpload();
	const { mutateAsync: resolveCrateForConfirmation, isPending: isResolving } = useResolveCrateForConfirmation();
	const { mutateAsync: createScanEvent, isPending: isCreating } = useCreateCrateReceiveEvent();
	const { mutateAsync: checkScanStatus, isPending: isCheckingScanStatus } = useCheckCrateScanStatus();

	const resetToScan = () => {
		setStep(RECEIVE_STEP.SCAN);
		setCrateIdInput("");
		setSealPromptCrateId(null);
		setCrateId(null);
		setSealIntact(null);
		setDetectionTime(null);
		setUploadedPhotos([]);
		setNote("");
		setConfirmationDetails(null);
		setScanSummary(null);
	};

	const startCrateFlow = async (id: string) => {
		try {
			await checkScanStatus({ assetId: id, action });
		} catch (error) {
			openErrorToast({ error: error as Error, message: "This crate has already been scanned." });
			setScannerKey((prev) => prev + 1);
			return;
		}

		if (isReturn) {
			setCrateId(id);
			setSealIntact(true);
			setStep(RECEIVE_STEP.UPLOAD_PHOTOS);
			return;
		}
		setSealPromptCrateId(id);
	};

	const handleScan = async (id: string) => {
		await startCrateFlow(id);
	};

	const handleManualGo = async () => {
		const trimmed = crateIdInput.trim();
		if (!trimmed) return;
		await startCrateFlow(trimmed);
	};

	const handleSealSelect = (intact: boolean) => {
		setCrateId(sealPromptCrateId);
		setSealIntact(intact);
		setDetectionTime(intact ? null : new Date());
		setSealPromptCrateId(null);
		setStep(RECEIVE_STEP.UPLOAD_PHOTOS);
	};

	const handleUploadBack = () => {
		setStep(RECEIVE_STEP.SCAN);
		setCrateId(null);
		setSealIntact(null);
		setDetectionTime(null);
	};

	const submitScanEvent = async (sealTagNumber?: string) => {
		if (!crateId || sealIntact === null) return;

		setStep(RECEIVE_STEP.PROCESSING);

		try {
			const uploadable: IFileUploadable[] = uploadedPhotos.map((file) => ({
				keyFile: `${file.name}-${Date.now()}`,
				file,
				url: URL.createObjectURL(file),
			}));

			const filesToUpload = getFilesToUpload(uploadable);
			let photos: { keyFile: string; url: string }[] = [];

			if (filesToUpload.length) {
				const signedUrls = await getSignedUrls(filesToUpload);
				await handleFileUpload({ signedUrls, filesToUpload });
				photos = signedUrls.map(({ keyFile, url }) => ({ keyFile, url }));
			}

			const summary = await createScanEvent({
				assetId: crateId,
				action,
				sealIntact: isReturn ? undefined : sealIntact,
				sealTagNumber,
				note: note || undefined,
				photos,
			});

			setScanSummary(summary);
			setStep(RECEIVE_STEP.SUCCESS);
		} catch (error) {
			openErrorToast({
				error: error as Error,
				message: isReturn
					? "Failed to submit crate return. Please try again."
					: "Failed to submit crate receipt. Please try again.",
			});

			if (axios.isAxiosError(error) && error.response?.status === HttpStatusCode.Conflict) {
				router.push(routes.employee.crateManagement);
				return;
			}

			setStep(isReturn ? RECEIVE_STEP.SEAL_TAG : RECEIVE_STEP.CONFIRM);
		}
	};

	const handleUploadSubmit = async (payload: { photos: File[]; note: string }) => {
		if (!crateId) return;

		setUploadedPhotos(payload.photos);
		setNote(payload.note);

		if (isReturn) {
			setStep(RECEIVE_STEP.SEAL_TAG);
			return;
		}

		try {
			const details = await resolveCrateForConfirmation(crateId);
			setConfirmationDetails(details);
			setStep(RECEIVE_STEP.CONFIRM);
		} catch (error) {
			openErrorToast({ error: error as Error, message: "Failed to resolve crate details. Please try again." });
		}
	};

	const handleSealTagBack = () => {
		setStep(RECEIVE_STEP.UPLOAD_PHOTOS);
	};

	const handleConfirmBack = () => {
		setStep(RECEIVE_STEP.UPLOAD_PHOTOS);
	};

	if (step === RECEIVE_STEP.UPLOAD_PHOTOS && crateId !== null && sealIntact !== null) {
		return (
			<UploadCrateImages
				crateId={crateId}
				sealIntact={sealIntact}
				isSubmitting={isResolving}
				onBack={handleUploadBack}
				onSubmit={handleUploadSubmit}
			/>
		);
	}

	if (step === RECEIVE_STEP.SEAL_TAG) {
		return <EnterSealTag isSubmitting={isCreating} onBack={handleSealTagBack} onSubmit={submitScanEvent} />;
	}

	if (step === RECEIVE_STEP.CONFIRM && confirmationDetails && sealIntact !== null) {
		return (
			<ConfirmAction
				details={confirmationDetails}
				photos={uploadedPhotos}
				note={note}
				sealIntact={sealIntact}
				detectionTime={detectionTime ?? undefined}
				isSubmitting={isCreating}
				onBack={handleConfirmBack}
				onConfirm={() => submitScanEvent()}
			/>
		);
	}

	if (step === RECEIVE_STEP.PROCESSING) {
		return <ReceiveProcessing isComplete={false} />;
	}

	if (step === RECEIVE_STEP.SUCCESS && scanSummary) {
		if (isReturn) {
			return (
				<ReturnSuccess
					summary={scanSummary as ICrateReturnScanSummary}
					onDone={() => router.push(routes.employee.crateManagement)}
				/>
			);
		}

		return (
			<ReceiveSuccess
				summary={scanSummary as ICrateReceiveScanSummary}
				onScanNext={resetToScan}
				onDone={() => router.push(routes.employee.crateManagement)}
			/>
		);
	}

	return (
		<div className="flex min-h-screen flex-col bg-brand-bgLightgrey">
			<ScreenHeader title={SCAN_SCREEN_TITLE[action]} />

			<Tabs
				value={activeTab}
				onValueChange={(value) => setActiveTab(value as SCANNER_TAB)}
				className="flex flex-1 flex-col px-4"
			>
				<TabsList className="grid w-full grid-cols-2 border border-gray-300">
					<TabsTrigger value={SCANNER_TAB.CAMERA} className="gap-1.5">
						<Camera className="h-4 w-4" />
						Camera
					</TabsTrigger>
					<TabsTrigger value={SCANNER_TAB.MANUAL} className="gap-1.5">
						<Keyboard className="h-4 w-4" />
						Manual Entry
					</TabsTrigger>
				</TabsList>

				<TabsContent value={SCANNER_TAB.CAMERA} className="mt-4 flex-1">
					<QRScanner key={scannerKey} isActive={activeTab === SCANNER_TAB.CAMERA} onScan={handleScan} />
					<p className="mt-3 text-center text-xs text-gray-400">Camera reads QR URL → extracts id → logs crates.</p>
				</TabsContent>

				<TabsContent value={SCANNER_TAB.MANUAL} className="mt-4 flex flex-1 flex-col">
					<div className="flex flex-col gap-1.5">
						<label htmlFor="crate-id-input" className="text-sm font-medium text-gray-700">
							Crate ID*
						</label>
						<Input
							id="crate-id-input"
							type="text"
							value={crateIdInput}
							onChange={(e) => setCrateIdInput(e.target.value)}
							placeholder="e.g. CRATE-0045"
							className="h-auto rounded-xl px-4 py-3 text-sm"
							autoComplete="off"
							autoCapitalize="characters"
						/>
					</div>

					<div className="mt-auto pb-8 pt-4">
						<Button
							type="button"
							variant="filled"
							onClick={handleManualGo}
							disabled={!crateIdInput.trim() || isCheckingScanStatus}
							loading={isCheckingScanStatus}
							loadingText="Checking..."
							className="h-auto w-full rounded-2xl py-4 text-sm"
						>
							Go
						</Button>
					</div>
				</TabsContent>
			</Tabs>

			{sealPromptCrateId && <SealIntactPrompt onSelect={handleSealSelect} />}
		</div>
	);
}
