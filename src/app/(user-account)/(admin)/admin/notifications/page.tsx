import AdminNotification from "@/module/admin/notifications/template/notification";
import { Suspense } from "react";

export default function NotificationsPage() {
	return (
		<Suspense fallback={<div>Loading...</div>}>
			<AdminNotification />
		</Suspense>
	);
}
