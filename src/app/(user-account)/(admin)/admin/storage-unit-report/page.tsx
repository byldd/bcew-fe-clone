import React, { Suspense } from "react";
import StorageUnitReport from "@/module/storage-unit-report/templates/storage-unit-report";

const Page = () => {
	return (
		<Suspense fallback={<div>Loading...</div>}>
			<StorageUnitReport />
		</Suspense>
	);
};

export default Page;
