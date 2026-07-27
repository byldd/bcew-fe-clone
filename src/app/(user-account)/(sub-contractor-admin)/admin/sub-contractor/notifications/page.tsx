import SubContractorAdminDesktopNotifications from "@/module/admin/notifications/template/sub-contractor-desktop-notification";
import { Suspense } from "react";

export default function NotificationsPage() {
	return (
		<Suspense fallback={<div>Loading...</div>}>
			<SubContractorAdminDesktopNotifications />
		</Suspense>
	);
}
