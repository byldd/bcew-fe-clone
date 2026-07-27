import { useRef } from "react";
import { useUpdateNotificationPreference } from "@/module/schedule-management/weekly-schedule-management/hooks/useSchedule";
import { IUpdateNotificationPreferencePayload } from "../types/type";
import useAuthStore from "@/store/auth-store";

export const useUpdateNotificationPreferenceDebounced = () => {
	const { user } = useAuthStore((state) => state);
	const { mutate } = useUpdateNotificationPreference(user);
	const debounceRef = useRef<NodeJS.Timeout | null>(null);

	const updatePreference = (payload: IUpdateNotificationPreferencePayload) => {
		if (debounceRef.current) clearTimeout(debounceRef.current);

		debounceRef.current = setTimeout(() => {
			mutate(payload);
		}, 400);
	};

	return updatePreference;
};
