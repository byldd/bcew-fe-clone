"use client";

import { type MouseEvent, useEffect, useMemo, useRef, useState } from "react";
import { RotateCcw, Trash2, X } from "lucide-react";
import { getErrorMessage } from "@/components/get-error-message";
import { openErrorToast, openSuccessToast } from "@/components/toast";
import { Button } from "@/components/ui/button";
import { SelectField } from "@/components/ui/selectField";
import {
	useDeleteFingerprint,
	useDeleteSingleFingerprint,
	useEnrollFingerprint,
	useEnrolledStatus,
} from "../hooks/useEnrollFingerprint";
import FingerprintProgress from "./fingerprint-progress";
import FingerprintScanner from "./fingerprint-scanner";
import { EMPTY_FINGERPRINTS, Props, TOTAL_FINGERS } from "../types";
import { FingerprintSampleAcquiredEvent, FingerprintWebApi } from "../types/fingerprint-sdk";
import { MdOutlineFingerprint } from "react-icons/md";

let sdkApi: FingerprintWebApi | null = null;

export default function FingerprintEnrollModal({ employees, selectedEmployee, onClose, onSuccess }: Props) {
	const [selectedUserId, setSelectedUserId] = useState(selectedEmployee?.id || "");
	const [localEnrollmentUserId, setLocalEnrollmentUserId] = useState("");
	const { data: enrolledData } = useEnrolledStatus();
	const selectedUser = employees.find((emp) => emp.id === selectedUserId);
	const userId = selectedUser?.id || "";
	const memberName = selectedUser?.name || "";
	const role = selectedUser?.role?.name || "";
	const department = selectedUser?.team?.name || "";
	const employeeOptions = useMemo(
		() =>
			employees.map((employee) => ({
				label: employee.name,
				value: employee.id,
			})),
		[employees]
	);

	const existingFingerprints = useMemo(() => {
		if (enrolledData) {
			const selectedEnrollment = enrolledData.find((item) => item.userId === selectedUserId);
			return selectedEnrollment?.fingerprints || EMPTY_FINGERPRINTS;
		}

		if (selectedEmployee?.id === selectedUserId) {
			return selectedEmployee.fingerprints || EMPTY_FINGERPRINTS;
		}

		return EMPTY_FINGERPRINTS;
	}, [enrolledData, selectedEmployee?.fingerprints, selectedEmployee?.id, selectedUserId]);

	const [message, setMessage] = useState("Initializing scanner...");
	const [isReady, setIsReady] = useState(false);
	const [currentFingerIndex, setCurrentFingerIndex] = useState(0);
	const [completedFingers, setCompletedFingers] = useState<number[]>([]);
	const [isCompleted, setIsCompleted] = useState(false);
	const [isCapturing, setIsCapturing] = useState(false);
	const [fingerprintIds, setFingerprintIds] = useState<(string | null)[]>([null, null]);
	const [isEditMode, setIsEditMode] = useState(existingFingerprints.length > 0);
	const apiRef = useRef<FingerprintWebApi | null>(null);
	const initializedUserRef = useRef<string | null>(null);
	const isProcessingRef = useRef(false);
	const currentFingerIndexRef = useRef(currentFingerIndex);
	const completedFingersRef = useRef(completedFingers);
	const fingerprintIdsRef = useRef(fingerprintIds);
	const userIdRef = useRef(userId);

	useEffect(() => {
		currentFingerIndexRef.current = currentFingerIndex;
		completedFingersRef.current = completedFingers;
		fingerprintIdsRef.current = fingerprintIds;
		userIdRef.current = userId;
	}, [currentFingerIndex, completedFingers, fingerprintIds, userId]);

	const enrollFingerprint = useEnrollFingerprint();
	const deleteFingerprintMutation = useDeleteFingerprint();
	const deleteSingleFingerprintMutation = useDeleteSingleFingerprint();
	const enrollFingerprintRef = useRef(enrollFingerprint);

	useEffect(() => {
		enrollFingerprintRef.current = enrollFingerprint;
	}, [enrollFingerprint]);

	const progressPercentage = useMemo(() => {
		return (completedFingers.length / TOTAL_FINGERS) * 100;
	}, [completedFingers]);

	const cleanupScanner = async () => {
		if (apiRef.current) {
			try {
				await Promise.race([
					apiRef.current.stopAcquisition(),
					new Promise<void>((resolve) => setTimeout(resolve, 2000)),
				]);
			} catch {
				sdkApi = null;
			}
			apiRef.current.onDeviceConnected = undefined;
			apiRef.current.onDeviceDisconnected = undefined;
			apiRef.current.onAcquisitionStarted = undefined;
			apiRef.current.onAcquisitionStopped = undefined;
			apiRef.current.onSamplesAcquired = undefined;
			apiRef.current = null;
		}

		isProcessingRef.current = false;
		setIsCapturing(false);
		setIsReady(false);
	};

	const handleClose = async () => {
		try {
			await cleanupScanner();
		} finally {
			onClose();
		}
	};

	const handleEmployeeChange = async (value: string) => {
		if (apiRef.current && isCapturing) {
			await apiRef.current.stopAcquisition().catch(() => null);
		}

		isProcessingRef.current = false;
		setIsCapturing(false);
		setLocalEnrollmentUserId("");
		initializedUserRef.current = null;
		setSelectedUserId(value);
	};

	const handleSelectFinger = (fingerIndex: number) => {
		setCurrentFingerIndex(fingerIndex);
		currentFingerIndexRef.current = fingerIndex;
	};

	const handleDeleteSingleFinger = async (event: MouseEvent<HTMLButtonElement>, fingerIndex: number) => {
		event.stopPropagation();

		try {
			const fingerprintId = fingerprintIdsRef.current[fingerIndex];

			if (!fingerprintId) {
				openErrorToast({ message: `Fingerprint ${fingerIndex + 1} not found` });

				return;
			}

			await deleteSingleFingerprintMutation.mutateAsync({
				fingerprintId,
			});

			const updatedIds = [...fingerprintIdsRef.current];
			updatedIds[fingerIndex] = null;
			fingerprintIdsRef.current = updatedIds;
			setFingerprintIds(updatedIds);
			handleSelectFinger(fingerIndex);
			setIsCompleted(false);
			setMessage(`Fingerprint ${fingerIndex + 1} deleted. Ready for new enrollment`);

			openSuccessToast(`Fingerprint ${fingerIndex + 1} deleted successfully`);
		} catch {
			openErrorToast({ message: `Failed to delete Fingerprint ${fingerIndex + 1}` });
		}
	};

	useEffect(() => {
		if (selectedUserId && localEnrollmentUserId === selectedUserId) {
			return;
		}

		if (!existingFingerprints.length) {
			initializedUserRef.current = null;
			const emptyIds: (string | null)[] = [null, null];
			setCompletedFingers([]);
			completedFingersRef.current = [];
			setFingerprintIds(emptyIds);
			fingerprintIdsRef.current = emptyIds;
			setCurrentFingerIndex(0);
			currentFingerIndexRef.current = 0;
			setIsCompleted(false);
			setIsEditMode(false);
			setMessage(selectedUserId ? "Ready to scan Finger 1" : "Ready to scan fingerprint");

			return;
		}

		if (initializedUserRef.current === selectedUserId) {
			return;
		}

		initializedUserRef.current = selectedUserId;
		const completed = existingFingerprints.map((_, index) => index);
		setCompletedFingers(completed);
		completedFingersRef.current = completed;
		const ids: (string | null)[] = [null, null];

		existingFingerprints.forEach((fp, index) => {
			ids[index] = fp.id;
		});

		setFingerprintIds(ids);
		fingerprintIdsRef.current = ids;
		setIsCompleted(existingFingerprints.length === TOTAL_FINGERS);

		const nextFingerIndex = existingFingerprints.length === TOTAL_FINGERS ? 0 : 1;
		setCurrentFingerIndex(nextFingerIndex);
		currentFingerIndexRef.current = nextFingerIndex;
		setIsEditMode(true);
		setMessage("Existing fingerprints loaded");
	}, [existingFingerprints, localEnrollmentUserId, selectedUserId]);

	useEffect(() => {
		let mounted = true;

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

		const initializeReader = async () => {
			// Force fresh port discovery on every init
			sessionStorage.removeItem("websdk");
			sessionStorage.removeItem("websdk.sessionId");
			setMessage("Loading fingerprint SDK...");
			await waitForSdk();

			if (!mounted) {
				return;
			}

			setMessage("Initializing scanner...");

			if (!sdkApi) {
				await new Promise((resolve) => setTimeout(resolve, 1500));
				sdkApi = new window.Fingerprint.WebApi();
			}

			const assignHandlers = (api: FingerprintWebApi) => {
				api.onDeviceConnected = () => {
					if (!mounted) return;
					setIsReady(true);
					setMessage("Scanner connected");
				};

				api.onDeviceDisconnected = () => {
					if (!mounted) return;
					setIsReady(false);
					setIsCapturing(false);
					setMessage("Scanner disconnected");
				};

				api.onAcquisitionStarted = () => {
					if (!mounted) return;
					setIsCapturing(true);
					setMessage(`Scanning Finger ${currentFingerIndexRef.current + 1}...`);
				};

				api.onAcquisitionStopped = () => {
					if (!mounted) return;
					setIsCapturing(false);
				};

				api.onSamplesAcquired = async (event: FingerprintSampleAcquiredEvent) => {
					if (isProcessingRef.current) {
						return;
					}

					isProcessingRef.current = true;

					try {
						setMessage("Processing fingerprint...");
						await api.stopAcquisition();

						const samples = JSON.parse(event.samples);
						const base64 = window.btoa(window.Fingerprint.b64UrlToUtf8(samples[0]));
						const result = await enrollFingerprintRef.current.mutateAsync({
							template: base64,
							userId: userIdRef.current,
						});

						if (!result.success) {
							throw new Error(result.message || "Enrollment failed");
						}

						const activeIndex = currentFingerIndexRef.current;
						const updatedIds = [...fingerprintIdsRef.current];
						updatedIds[activeIndex] = result.data.fingerprintId;
						fingerprintIdsRef.current = updatedIds;
						setFingerprintIds(updatedIds);

						const nextCompleted = Array.from(new Set([...completedFingersRef.current, activeIndex]));
						completedFingersRef.current = nextCompleted;
						setCompletedFingers(nextCompleted);
						openSuccessToast(`Finger ${activeIndex + 1} enrolled successfully`);

						if (nextCompleted.length === 2) {
							setIsCompleted(true);
							setCurrentFingerIndex(1);
							currentFingerIndexRef.current = 1;
							setMessage("Click Enroll Fingerprint to complete");
							return;
						}

						setCurrentFingerIndex(1);
						currentFingerIndexRef.current = 1;
						setMessage("Please scan Finger 2");
					} catch (error: unknown) {
						const errorMessage = getErrorMessage(error as Error, "Enrollment failed");
						setMessage(errorMessage);
						openErrorToast({ message: errorMessage });
					} finally {
						isProcessingRef.current = false;
						setIsCapturing(false);
					}
				};
			};

			assignHandlers(sdkApi);
			apiRef.current = sdkApi;

			let devices: unknown[];
			try {
				devices = await Promise.race([
					sdkApi.enumerateDevices(),
					new Promise<never>((_, reject) => setTimeout(() => reject(new Error("timeout")), 3000)),
				]);
			} catch {
				sdkApi = null;
				if (!mounted) return;
				await new Promise((resolve) => setTimeout(resolve, 1500));
				sdkApi = new window.Fingerprint.WebApi();
				apiRef.current = sdkApi;
				assignHandlers(sdkApi);
				devices = await sdkApi.enumerateDevices();
			}

			if (!mounted) {
				return;
			}

			setIsReady(true);
			setMessage("Ready to scan fingerprint");

			if (!devices || (devices as unknown[]).length === 0) {
				setMessage("No fingerprint scanner found");
				return;
			}
		};

		initializeReader();

		return () => {
			mounted = false;
			cleanupScanner();
		};
	}, []);

	const handleScanFinger = async () => {
		if (!selectedUserId) {
			openErrorToast({ message: "Please select employee" });

			return;
		}

		setLocalEnrollmentUserId(selectedUserId);

		if (!apiRef.current) {
			setMessage("Fingerprint reader not initialized");

			return;
		}

		setMessage("Preparing scanner...");
		await apiRef.current.stopAcquisition();
		isProcessingRef.current = false;
		await new Promise((resolve) => setTimeout(resolve, 500));
		await apiRef.current.startAcquisition(window.Fingerprint.SampleFormat.PngImage);
		setMessage(`Place Finger ${currentFingerIndexRef.current + 1} on scanner`);
	};

	const handleReset = async () => {
		if (currentFingerIndexRef.current === 1 && !fingerprintIdsRef.current[1]) {
			const firstFingerprintId = fingerprintIdsRef.current[0];

			if (firstFingerprintId) {
				await deleteSingleFingerprintMutation.mutateAsync({
					fingerprintId: firstFingerprintId,
				});
			}

			const updatedIds: (string | null)[] = [null, null];
			fingerprintIdsRef.current = updatedIds;
			setFingerprintIds(updatedIds);
			completedFingersRef.current = [];
			setCompletedFingers([]);
			currentFingerIndexRef.current = 0;
			setCurrentFingerIndex(0);
			setIsCompleted(false);
			setMessage("Please scan Finger 1");
			openSuccessToast("Finger 1 reset successfully");

			return;
		}

		if (currentFingerIndexRef.current === 1 && fingerprintIdsRef.current[1]) {
			const secondFingerprintId = fingerprintIdsRef.current[1];

			await deleteSingleFingerprintMutation.mutateAsync({
				fingerprintId: secondFingerprintId,
			});

			const updatedIds = [...fingerprintIdsRef.current];
			updatedIds[1] = null;
			fingerprintIdsRef.current = updatedIds;
			setFingerprintIds(updatedIds);
			completedFingersRef.current = [0];
			setCompletedFingers([0]);
			currentFingerIndexRef.current = 1;
			setCurrentFingerIndex(1);
			setIsCompleted(false);
			setMessage("Please scan Finger 2");

			openSuccessToast("Finger 2 reset successfully");

			return;
		}

		const firstFingerprintId = fingerprintIdsRef.current[0];

		if (firstFingerprintId) {
			await deleteSingleFingerprintMutation.mutateAsync({
				fingerprintId: firstFingerprintId,
			});
		}

		const updatedIds: (string | null)[] = [null, null];
		fingerprintIdsRef.current = updatedIds;
		setFingerprintIds(updatedIds);
		completedFingersRef.current = [];
		setCompletedFingers([]);
		currentFingerIndexRef.current = 0;
		setCurrentFingerIndex(0);
		setIsCompleted(false);
		setMessage("Please scan Finger 1");

		openSuccessToast("Finger 1 reset successfully");
	};

	const handleDeleteBoth = async () => {
		const confirmed = window.confirm("Delete all fingerprints?");

		if (!confirmed) {
			return;
		}

		try {
			if (apiRef.current) {
				await apiRef.current.stopAcquisition();
			}

			isProcessingRef.current = false;
			setIsCapturing(false);
			setMessage("Deleting fingerprints...");

			await deleteFingerprintMutation.mutateAsync({
				userId,
			});

			const emptyIds: (string | null)[] = [null, null];

			setCompletedFingers([]);
			completedFingersRef.current = [];
			setFingerprintIds(emptyIds);
			fingerprintIdsRef.current = emptyIds;
			setCurrentFingerIndex(0);
			currentFingerIndexRef.current = 0;
			setIsCompleted(false);
			setIsEditMode(false);
			setMessage("Ready to scan Finger 1");

			if (apiRef.current) {
				await new Promise((resolve) => setTimeout(resolve, 700));
			}

			openSuccessToast("All fingerprints deleted successfully");
		} catch (error: unknown) {
			const errorMessage = getErrorMessage(error as Error, "Failed to delete fingerprints");
			setMessage(errorMessage);
			openErrorToast({ message: errorMessage });

			isProcessingRef.current = false;
			setIsCapturing(false);
		}
	};

	const handleFinalEnroll = async () => {
		setMessage("Fingerprint enrollment completed");
		openSuccessToast("Both fingerprints enrolled successfully");

		await cleanupScanner();
		onSuccess();
	};

	return (
		<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-3 py-6 sm:px-4">
			<div className="flex max-h-[90vh] w-full max-w-2xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl">
				<div className="flex items-center justify-between border-b">
					<div className="space-y-1 px-6 py-4">
						<h2 className="text-xl font-semibold">Fingerprint Capture</h2>

						<p className="text-sm text-gray-500">Enroll employee fingerprint to confirm identity.</p>
					</div>

					<Button type="button" variant="ghost" size="icon" onClick={handleClose} className="mx-2 mb-6 rounded-[10px]">
						<X className="h-5 w-5" />
					</Button>
				</div>

				<div className="flex-1 overflow-y-auto">
					<div className="space-y-3 border-b px-6 py-4">
						<div className="space-y-1">
							<p className="text-xs font-medium text-brand-dark50">Member Name</p>

							<SelectField
								value={selectedUserId}
								onValueChange={handleEmployeeChange}
								options={employeeOptions}
								placeholder="Select Employee"
							/>
						</div>

						<div className="grid grid-cols-3 gap-4 text-sm sm:gap-10">
							<div className="space-y-1">
								<p className="text-xs font-medium text-brand-dark50">Employee</p>
								<p className="text-xs font-semibold text-brand-dark">{memberName || "-"}</p>
							</div>

							<div className="space-y-1">
								<p className="text-xs font-medium text-brand-dark50">Role</p>
								<p className="text-xs font-semibold text-brand-dark">{role || "-"}</p>
							</div>

							<div>
								<p className="text-xs font-medium text-brand-dark50">Team</p>
								<p className="text-xs font-semibold text-brand-dark">{department || "-"}</p>
							</div>
						</div>
					</div>
					<div className="px-6 pb-4 pt-6">
						{isEditMode && (
							<div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-2">
								{isCapturing && (
									<style>{`
										@keyframes fp-edit-scan {
											0%   { transform: translateY(-56px); opacity: 0; }
											8%   { opacity: 1; }
											80%  { transform: translateY(56px);  opacity: 1; }
											92%  { transform: translateY(56px);  opacity: 0; }
											93%  { transform: translateY(-56px); opacity: 0; }
											100% { transform: translateY(-56px); opacity: 0; }
										}
										@keyframes fp-edit-ring {
											0%   { box-shadow: 0 0 0 0   rgba(59,130,246,0.45); }
											60%  { box-shadow: 0 0 0 10px rgba(59,130,246,0);   }
											100% { box-shadow: 0 0 0 0   rgba(59,130,246,0);    }
										}
										@keyframes fp-edit-breathe {
											0%, 100% { opacity: 1;    }
											50%       { opacity: 0.55; }
										}
									`}</style>
								)}

								{[0, 1].map((fingerIndex) => {
									const fingerState = fingerprintIds[fingerIndex]
										? "success"
										: currentFingerIndex === fingerIndex
											? "active"
											: "idle";

									const isScanning = isCapturing && fingerState === "active";

									return (
										<div
											key={fingerIndex}
											onClick={() => handleSelectFinger(fingerIndex)}
											className={`cursor-pointer rounded-2xl border-2 p-4 transition-all ${
												fingerState === "success"
													? "border-[#0CC312] bg-[#0CC3120A]"
													: fingerState === "active"
														? "border-[#3B82F6] bg-[#3B82F60A]"
														: "border-brand-dark20 bg-white"
											}`}
										>
											<div className="flex items-center justify-between">
												<div className="space-y-1">
													<p className="text-sm text-brand-dark60">Fingerprint {fingerIndex + 1}</p>

													<p className="text-xs font-medium text-brand-dark">
														{fingerState === "success"
															? "Fingerprint Enrolled"
															: isScanning
																? "Scanning..."
																: fingerState === "active"
																	? "Ready to Scan"
																	: "Fingerprint Missing"}
													</p>
												</div>

												<Button
													type="button"
													variant="link"
													size="sm"
													onClick={(event) => handleDeleteSingleFinger(event, fingerIndex)}
													className="h-8 px-3 text-brand-dark underline"
												>
													Update
												</Button>
											</div>

											<div className="flex flex-col items-center justify-center py-3">
												<div
													className={`relative flex h-28 w-28 items-center justify-center overflow-hidden rounded-full border-2 transition-all duration-300 ${
														fingerState === "success"
															? "border-[#0CC312] bg-[#0CC3120A] text-[#0CC312]"
															: fingerState === "active"
																? "border-[#3B82F6] bg-[#3B82F60A] text-[#3B82F6]"
																: "border-brand-dark20 text-brand-dark40 bg-[#1515150A]"
													}`}
													style={isScanning ? { animation: "fp-edit-ring 1.6s ease-out infinite" } : undefined}
												>
													<MdOutlineFingerprint
														className={`h-14 w-14 transition-all duration-300`}
														style={isScanning ? { animation: "fp-edit-breathe 1.6s ease-in-out infinite" } : undefined}
													/>

													{isScanning && (
														<div
															className="absolute left-0 right-0 h-[2px]"
															style={{
																top: "50%",
																marginTop: "-1px",
																background:
																	"linear-gradient(90deg, transparent, #3B82F6 20%, #93C5FD 50%, #3B82F6 80%, transparent)",
																boxShadow: "0 0 8px 3px rgba(59,130,246,0.7), 0 0 18px 6px rgba(59,130,246,0.3)",
																animation: "fp-edit-scan 2s cubic-bezier(0.45,0,0.55,1) infinite",
															}}
														/>
													)}
												</div>

												<div className="mt-4 flex items-center gap-2">
													<div
														className={`h-2.5 w-2.5 rounded-full ${
															fingerState === "success"
																? "bg-[#0CC312]"
																: fingerState === "active"
																	? "bg-[#3B82F6]"
																	: "bg-brand-dark30"
														}`}
													/>

													<p
														className={`text-sm font-medium ${
															fingerState === "success"
																? "text-[#0CC312]"
																: fingerState === "active"
																	? "text-[#3B82F6]"
																	: "text-brand-dark50"
														}`}
													>
														{fingerState === "success"
															? "Saved in database"
															: isScanning
																? "Scanning fingerprint..."
																: fingerState === "active"
																	? "Scanning fingerprint"
																	: "Waiting for enrollment"}
													</p>
												</div>
											</div>
										</div>
									);
								})}
							</div>
						)}

						{!isEditMode && (
							<div className="space-y-6">
								<FingerprintProgress currentFingerIndex={currentFingerIndex} completedFingers={completedFingers} />

								<FingerprintScanner
									message={message}
									isCapturing={isCapturing}
									isCompleted={isCompleted}
									progressPercentage={progressPercentage}
								/>
							</div>
						)}
					</div>
				</div>

				<div className="flex items-center justify-between gap-3 border-t px-6 py-5">
					{isEditMode && (
						<Button
							type="button"
							variant="outline"
							onClick={handleDeleteBoth}
							disabled={!fingerprintIds[0] && !fingerprintIds[1]}
							className="w-full rounded-xl border-red-600 px-4 text-red-600 hover:bg-red-50 disabled:border-gray-300 disabled:text-gray-400"
						>
							<Trash2 className="h-4 w-4" />
							{fingerprintIds[0] && fingerprintIds[1] ? "Reset Both" : "Reset"}
						</Button>
					)}

					{!isEditMode && (
						<Button
							type="button"
							variant="outline"
							onClick={handleReset}
							disabled={completedFingers.length === 0}
							className="w-full"
						>
							<RotateCcw className="h-4 w-4" />
							Reset
						</Button>
					)}

					{fingerprintIds[0] && fingerprintIds[1] ? (
						<Button type="button" variant="filled" onClick={handleFinalEnroll} className="w-full">
							{isEditMode ? "Save & Update" : "Enroll Fingerprint"}
						</Button>
					) : (
						<Button
							type="button"
							variant="filled"
							onClick={handleScanFinger}
							disabled={
								!selectedUserId ||
								!isReady ||
								enrollFingerprint.isPending ||
								isCapturing ||
								!!fingerprintIds[currentFingerIndex]
							}
							loading={enrollFingerprint.isPending}
							className="w-full"
						>
							{isCapturing ? "Scanning..." : `Scan - Finger ${currentFingerIndex + 1}`}
						</Button>
					)}
				</div>
			</div>
		</div>
	);
}
