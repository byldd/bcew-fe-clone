import React, { Suspense } from "react";

import AddNewRecordTemplate from "@/module/admin-driving-safety/templates/add-new-record-template";

const Page = () => {
	return (
		<Suspense fallback={<div>Loading...</div>}>
			<AddNewRecordTemplate />
		</Suspense>
	);
};

export default Page;
