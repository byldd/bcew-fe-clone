"use client";

import { DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { openErrorToast } from "@/components/toast";
import { useModal } from "@/hooks/useModal";
import useAuthStore from "@/store/auth-store";

import { useAuthAPI } from "../hooks/useAuth";
import { useEmulationControls } from "../hooks/useEmulationControls";
import { replaceAuthToken, setEmulatedRoleCookie } from "../utils/helpers";
import RoleEmulationModal from "./role-emulation-modal";

export default function EmulationMenuItem() {
	const { Modal, openModal, closeModal } = useModal();
	const user = useAuthStore((state) => state.user);
	const { isEmulating, refreshCurrentUser, confirmStopEmulation } = useEmulationControls();

	const { useImpersonateUserMutation } = useAuthAPI();
	const { mutate: impersonateUser } = useImpersonateUserMutation;

	if (!user?.isEmulationAllowed && !isEmulating) {
		return null;
	}

	const handleOpenEmulation = () => {
		if (isEmulating) {
			confirmStopEmulation(openModal, closeModal);
			return;
		}

		openModal({
			modalTitle: "Emulate Role or User",
			showDefaultClose: false, // hide X button
			closeOnOutsideClick: false, // already default, but explicit
			modalView: (
				<RoleEmulationModal
					currentRole={user?.role ?? undefined}
					onContinue={closeModal}
					onSelectRole={(roleId) => {
						setEmulatedRoleCookie(roleId);

						closeModal();

						void refreshCurrentUser();
					}}
					onSelectUser={(userId) => {
						impersonateUser(userId, {
							onSuccess: async ({ token }) => {
								replaceAuthToken(token);

								closeModal();

								await refreshCurrentUser();
							},
							onError: (error) => {
								openErrorToast({ error });
							},
						});
					}}
				/>
			),
		});
	};

	return (
		<>
			<Modal />

			<DropdownMenuItem onSelect={(e) => e.preventDefault()} onClick={handleOpenEmulation}>
				<span>Emulation</span>
			</DropdownMenuItem>
		</>
	);
}
