"use client";

import { useEffect } from "react";

export function PushNotificationProvider({ children }: { children: React.ReactNode }) {
	useEffect(() => {
		// Register service worker on app load
		if (typeof window !== "undefined" && "serviceWorker" in navigator) {
			navigator.serviceWorker
				.register("/sw.js", {
					scope: "/",
					updateViaCache: "none",
				})
				.then((registration) => {
					console.log("Service Worker registered:", registration);
				})
				.catch((error) => {
					console.error("Service Worker registration failed:", error);
				});
		}
	}, []);

	return <>{children}</>;
}
