"use client";

import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { openErrorToast } from "@/components/toast";
import { useAuthAPI } from "@/module/auth/hooks/useAuth";
import { clearEmulatedRoleCookie, replaceAuthToken } from "@/module/auth/utils/helpers";
import useAuthStore from "@/store/auth-store";
import { useQueryClient } from "@tanstack/react-query";

export default function AuthRoleBanner() {
	const queryClient = useQueryClient();

	const user = useAuthStore((state) => state.user);

	const { useStopImpersonationMutation } = useAuthAPI();
	const { mutate: stopImpersonation } = useStopImpersonationMutation;

	const isRoleEmulation = !!user?.emulatedRole;
	const isUserImpersonation = !!user?.impersonatedByUser;

	if (!isRoleEmulation && !isUserImpersonation) {
		return null;
	}

	const bannerText = isUserImpersonation
		? `You are viewing as ${user?.name}`
		: `You are viewing as ${user?.emulatedRole?.name}`;

	const refreshCurrentUser = async () => {
		await queryClient.invalidateQueries({
			queryKey: ["userData"],
		});

		await queryClient.refetchQueries({
			queryKey: ["userData"],
		});
	};

	const handleDisable = (checked: boolean) => {
		if (checked) return;

		// User impersonation
		if (isUserImpersonation) {
			stopImpersonation(undefined, {
				onSuccess: async ({ token }) => {
					replaceAuthToken(token);

					await refreshCurrentUser();
				},
				onError: (error) => {
					openErrorToast({ error });
				},
			});

			return;
		}

		// Role emulation
		clearEmulatedRoleCookie();

		void refreshCurrentUser();
	};

	return (
		<div className="flex items-center gap-3 rounded bg-yellow-100 px-3 py-1">
			<p className="text-xs font-semibold text-yellow-700">{bannerText}</p>

			<div className="flex items-center gap-2">
				<Label className="text-xs">Emulation</Label>

				<Switch checked onCheckedChange={handleDisable} />
			</div>
		</div>
	);
}
