"use client";

import { useState, useEffect, useCallback } from "react";
import toast from "react-hot-toast";
import { env } from "@/env.mjs";
import {
	useSubscribeToPushNotification,
	useUnsubscribeFromPushNotification,
} from "@/module/employee-notification/hooks/useEmployeeNotification";
import { openErrorToast, openSuccessToast } from "@/components/toast";
import useAuthStore from "@/store/auth-store";
import { useTypedTranslations } from "@/i18n/useTypedTranslations";
import { NAMESPACE } from "@/i18n/type";

function urlBase64ToUint8Array(base64String: string): Uint8Array {
	const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
	const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");

	const rawData = window.atob(base64);
	const outputArray = new Uint8Array(rawData.length);

	for (let i = 0; i < rawData.length; ++i) {
		outputArray[i] = rawData.charCodeAt(i);
	}
	return outputArray;
}

export function usePushNotification() {
	const tschedule = useTypedTranslations(NAMESPACE.SCHEDULE);
	const [isSupported, setIsSupported] = useState(false);
	const [isSubscribed, setIsSubscribed] = useState(false);
	const { user } = useAuthStore((state) => state);

	const { mutate: subscribeToPushNotification, isPending: isSubscribing } = useSubscribeToPushNotification();
	const { mutate: unsubscribeFromPushNotification, isPending: isUnsubscribing } = useUnsubscribeFromPushNotification();

	const checkSubscriptionStatus = useCallback(async () => {
		try {
			if (!("serviceWorker" in navigator)) {
				return;
			} // Register service worker
			const registration = await navigator.serviceWorker.register("/sw.js", {
				scope: "/",
				updateViaCache: "none",
			});

			// Check if already subscribed
			const sub = await registration.pushManager.getSubscription();
			setIsSubscribed(
				!!sub && !!user?.pushSubscriptions?.some((subscription) => subscription.endpoint === sub?.endpoint)
			);
		} catch (error) {
			console.error("Error checking subscription status:", error);
		}
	}, [user?.pushSubscriptions]);

	// Check if push notifications are supported
	useEffect(() => {
		if (typeof window !== "undefined") {
			const supported = "serviceWorker" in navigator && "PushManager" in window;
			setIsSupported(supported);

			if (supported) {
				// Check subscription status
				checkSubscriptionStatus();
			}
		}
	}, [checkSubscriptionStatus]);

	const subscribe = useCallback(async () => {
		if (!isSupported) {
			toast.error(tschedule.notSupported);
			return;
		}

		// Register service worker
		const registration = await navigator.serviceWorker.ready;

		// Request notification permission
		const permission = await Notification.requestPermission();
		if (permission !== "granted") {
			toast.error(tschedule.permissionDenied);
			return;
		}

		// Subscribe to push notifications
		const sub = await registration.pushManager.subscribe({
			userVisibleOnly: true,
			applicationServerKey: urlBase64ToUint8Array(env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!) as unknown as BufferSource,
		});

		const serializedSub = JSON.parse(JSON.stringify(sub));

		subscribeToPushNotification(serializedSub, {
			onSuccess: () => {
				openSuccessToast(tschedule.pushEnabled);
				setIsSubscribed(true);
				openSuccessToast(tschedule.pushEnabled);
			},
			onError: (error) => {
				openErrorToast({ error: error });
			},
		});
	}, [
		isSupported,
		subscribeToPushNotification,
		tschedule.notSupported,
		tschedule.permissionDenied,
		tschedule.pushEnabled,
	]);

	const unsubscribe = useCallback(async () => {
		if (!isSupported) {
			return;
		}

		const registration = await navigator.serviceWorker.ready;
		// TODO: remove all other subscriptior for this user
		const subscription = await registration.pushManager.getSubscription();

		if (subscription) {
			await subscription.unsubscribe();
			unsubscribeFromPushNotification(
				{
					endpoint: subscription.endpoint,
				},
				{
					onSuccess: () => {
						openSuccessToast(tschedule.pushDisabled);
						setIsSubscribed(false);
					},
					onError: (error) => {
						openErrorToast({ error: error });
					},
				}
			);
		}
	}, [isSupported, tschedule.pushDisabled, unsubscribeFromPushNotification]);

	return {
		isSupported,
		isSubscribed,
		subscribe,
		unsubscribe,
		isLoading: isSubscribing || isUnsubscribing,
	};
}
