import React, { Suspense } from "react";
import SchedulePdf from "@/module/pdf/template/schedule-pdf";

const Page = () => {
	return (
		<Suspense fallback={<div>Loading...</div>}>
			<div>
				<SchedulePdf />
			</div>
		</Suspense>
	);
};

export default Page;
