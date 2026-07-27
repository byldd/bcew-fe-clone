"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
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
import ConfirmAction from "../components/confirm-action";
import ReceiveProcessing from "../components/receive-processing";
import ReceiveSuccess from "../components/receive-success";
import ScreenHeader from "../components/screen-header";
import { useCreateCrateReceiveEvent, useResolveCrateForConfirmation } from "../hooks/useCrateManagement";
import { ICrateConfirmationDetails, ICrateReceiveEventResult } from "../types";
import { RECEIVE_STEP, SCANNER_TAB } from "../enums";

export default function ScanReceiveTemplate() {
	const router = useRouter();
	const [step, setStep] = useState<RECEIVE_STEP>(RECEIVE_STEP.SCAN);
	const [activeTab, setActiveTab] = useState<SCANNER_TAB>(SCANNER_TAB.CAMERA);
	const [crateIdInput, setCrateIdInput] = useState("");
	const [sealPromptCrateId, setSealPromptCrateId] = useState<string | null>(null);
	const [crateId, setCrateId] = useState<string | null>(null);
	const [sealIntact, setSealIntact] = useState<boolean | null>(null);
	const [uploadedPhotos, setUploadedPhotos] = useState<File[]>([]);
	const [note, setNote] = useState("");
	const [confirmationDetails, setConfirmationDetails] = useState<ICrateConfirmationDetails | null>(null);
	const [receiveResult, setReceiveResult] = useState<ICrateReceiveEventResult | null>(null);

	const { getFilesToUpload, getSignedUrls, handleFileUpload } = useHandleFileUpload();
	const { mutateAsync: resolveCrateForConfirmation, isPending: isResolving } = useResolveCrateForConfirmation();
	const { mutateAsync: createReceiveEvent, isPending: isCreating } = useCreateCrateReceiveEvent();

	const resetToScan = () => {
		setStep(RECEIVE_STEP.SCAN);
		setCrateIdInput("");
		setSealPromptCrateId(null);
		setCrateId(null);
		setSealIntact(null);
		setUploadedPhotos([]);
		setNote("");
		setConfirmationDetails(null);
		setReceiveResult(null);
	};

	const handleScan = (id: string) => {
		setSealPromptCrateId(id);
	};

	const handleManualGo = () => {
		const trimmed = crateIdInput.trim();
		if (!trimmed) return;
		setSealPromptCrateId(trimmed);
	};

	const handleSealSelect = (intact: boolean) => {
		setCrateId(sealPromptCrateId);
		setSealIntact(intact);
		setSealPromptCrateId(null);
		setStep(RECEIVE_STEP.UPLOAD_PHOTOS);
	};

	const handleUploadBack = () => {
		setStep(RECEIVE_STEP.SCAN);
		setCrateId(null);
		setSealIntact(null);
	};

	const handleUploadSubmit = async (payload: { photos: File[]; note: string }) => {
		if (!crateId) return;

		try {
			const details = await resolveCrateForConfirmation(crateId);
			setUploadedPhotos(payload.photos);
			setNote(payload.note);
			setConfirmationDetails(details);
			setStep(RECEIVE_STEP.CONFIRM);
		} catch (error) {
			openErrorToast({ error: error as Error, message: "Failed to resolve crate details. Please try again." });
		}
	};

	const handleConfirmBack = () => {
		setStep(RECEIVE_STEP.UPLOAD_PHOTOS);
	};

	const handleConfirmReceived = async () => {
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

			const result = await createReceiveEvent({
				assetId: crateId,
				sealIntact,
				note: note || undefined,
				photos,
			});

			setReceiveResult(result);
			setStep(RECEIVE_STEP.SUCCESS);
		} catch (error) {
			openErrorToast({ error: error as Error, message: "Failed to submit crate receipt. Please try again." });
			setStep(RECEIVE_STEP.CONFIRM);
		}
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

	if (step === RECEIVE_STEP.CONFIRM && confirmationDetails) {
		return (
			<ConfirmAction
				details={confirmationDetails}
				photos={uploadedPhotos}
				note={note}
				isSubmitting={isCreating}
				onBack={handleConfirmBack}
				onConfirm={handleConfirmReceived}
			/>
		);
	}

	if (step === RECEIVE_STEP.PROCESSING) {
		return <ReceiveProcessing isComplete={false} />;
	}

	if (step === RECEIVE_STEP.SUCCESS && receiveResult) {
		return (
			<ReceiveSuccess
				result={receiveResult}
				onScanNext={resetToScan}
				onDone={() => router.push(routes.employee.crateManagement)}
			/>
		);
	}

	return (
		<div className="flex min-h-screen flex-col bg-white">
			<ScreenHeader title="Scan to Receive" />

			<Tabs
				value={activeTab}
				onValueChange={(value) => setActiveTab(value as SCANNER_TAB)}
				className="flex flex-1 flex-col px-4"
			>
				<TabsList className="grid w-full grid-cols-2">
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
					<QRScanner isActive={activeTab === SCANNER_TAB.CAMERA} onScan={handleScan} />
					<p className="mt-3 text-center text-xs text-gray-400">Camera reads QR URL → extracts id → logs crates.</p>
				</TabsContent>

				<TabsContent value={SCANNER_TAB.MANUAL} className="mt-4 flex flex-1 flex-col">
					<div className="flex flex-col gap-1.5">
						<label htmlFor="crate-id-input" className="text-sm font-medium text-gray-700">
							Crate ID
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
							disabled={!crateIdInput.trim()}
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
