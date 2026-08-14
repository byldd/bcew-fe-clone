"use client";

import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { AxiosError } from "axios";

import ConfirmModal from "@/components/confirm-modal";
import { openErrorToast, openSuccessToast } from "@/components/toast";
import useAuthStore from "@/store/auth-store";
import { IOpenModal } from "@/types";

import { useAuthAPI } from "./useAuth";
import { clearEmulatedRoleCookie, replaceAuthToken } from "../utils/helpers";

const ExitEmulationConfirm = ({
	emulatedName,
	stopEmulation,
	closeModal,
	onCancel,
}: {
	emulatedName?: string;
	stopEmulation: () => Promise<void>;
	closeModal: () => void;
	onCancel: () => void;
}) => {
	const [isLoading, setIsLoading] = useState(false);

	// Keep the popup open (with buttons disabled) until we actually know the
	// result — closing immediately hid failures and made a stuck toggle look
	// like nothing happened.
	const handleConfirm = async () => {
		setIsLoading(true);
		try {
			await stopEmulation();
			closeModal();
		} catch {
			setIsLoading(false);
		}
	};

	return (
		<ConfirmModal
			description={
				<span className="mt-3 block text-sm leading-relaxed text-brand-dark50">
					You&apos;re currently viewing as &quot;{emulatedName}.&quot; Do you want to return to your own view?
				</span>
			}
			confirmText="Yes"
			cancelText="Cancel"
			isLoading={isLoading}
			onCancel={onCancel}
			onConfirm={handleConfirm}
		/>
	);
};

export const useEmulationControls = () => {
	const queryClient = useQueryClient();
	const user = useAuthStore((state) => state.user);
	const { useStopImpersonationMutation } = useAuthAPI();
	const { mutateAsync: stopImpersonationAsync } = useStopImpersonationMutation;

	const isRoleEmulation = !!user?.emulatedRole;
	const isUserImpersonation = !!user?.impersonatedByUser;
	const isEmulating = isRoleEmulation || isUserImpersonation;
	const emulatedName = isUserImpersonation ? user?.name : user?.emulatedRole?.name;

	const refreshCurrentUser = async () => {
		// invalidateQueries already refetches active queries by default — the extra
		// refetchQueries call was firing /user/me (and the resulting store update
		// and re-render) a second time, which is what caused the popup to flicker.
		await queryClient.invalidateQueries({ queryKey: ["userData"] });
	};

	const stopEmulation = async () => {
		const successMessage = emulatedName
			? `Emulation for ${emulatedName} has been turned off`
			: "Emulation has been turned off";

		try {
			if (isUserImpersonation) {
				const { token } = await stopImpersonationAsync();
				replaceAuthToken(token);
			} else {
				clearEmulatedRoleCookie();
			}

			await refreshCurrentUser();
			openSuccessToast(successMessage);
		} catch (error) {
			openErrorToast({ error: error as AxiosError<{ message: string }> });
			throw error;
		}
	};

	// `onCancelled` lets the caller revert an optimistic UI change (e.g. a toggle
	// flipped off immediately on click) if the user backs out of the confirmation.
	const confirmStopEmulation = (
		openModal: (params: IOpenModal) => void,
		closeModal: () => void,
		onCancelled?: () => void
	) => {
		openModal({
			modalTitle: "Exit Emulation / Return to Your View",
			headerClassName: "border-b border-brand-dark10 pb-3",
			modalView: (
				<ExitEmulationConfirm
					emulatedName={emulatedName}
					stopEmulation={stopEmulation}
					closeModal={closeModal}
					onCancel={() => {
						closeModal();
						onCancelled?.();
					}}
				/>
			),
		});
	};

	return {
		user,
		isEmulating,
		isUserImpersonation,
		emulatedName,
		refreshCurrentUser,
		stopEmulation,
		confirmStopEmulation,
	};
};
