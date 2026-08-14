"use client";

import { useEffect, useRef, useState } from "react";

import { Switch } from "@/components/ui/switch";
import { useModal } from "@/hooks/useModal";
import { useEmulationControls } from "@/module/auth/hooks/useEmulationControls";

export default function AuthRoleBanner() {
	const { Modal, openModal, closeModal } = useModal();
	const { user, isEmulating, isUserImpersonation, confirmStopEmulation } = useEmulationControls();

	const [pendingOff, setPendingOff] = useState(false);
	const wasEmulating = useRef(isEmulating);

	useEffect(() => {
		if (isEmulating && !wasEmulating.current) {
			setPendingOff(false);
		}
		wasEmulating.current = isEmulating;
	}, [isEmulating]);

	if (!isEmulating) {
		return null;
	}

	const bannerText = isUserImpersonation
		? `You are viewing as ${user?.name}`
		: `You are viewing as ${user?.emulatedRole?.name}`;

	const handleToggleOff = () => {
		setPendingOff(true);
		confirmStopEmulation(openModal, closeModal, () => setPendingOff(false));
	};

	return (
		<div className="flex items-center gap-2 rounded bg-yellow-100 px-3 py-1">
			<Modal />
			<p className="text-xs font-semibold text-yellow-700">{bannerText}</p>
			<Switch checked={!pendingOff} onCheckedChange={(checked) => !checked && handleToggleOff()} />
		</div>
	);
}
