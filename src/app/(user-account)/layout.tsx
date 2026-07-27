import React from "react";

import CheckActiveStatus from "@/lib/utils/check-active-user";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
	return (
		<>
			<CheckActiveStatus />
			{children}
		</>
	);
}
