import BuilderCommsPage from "@/module/builder-communication/templates/builder-communications";
import { Suspense } from "react";

export default function BuilderComms() {
	return (
		<Suspense fallback={<div>Loading...</div>}>
			<BuilderCommsPage />
		</Suspense>
	);
}
