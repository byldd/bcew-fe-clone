import TravelPay from "@/module/schedule-management/travel-pay/templates/travel-pay";
import React, { Suspense } from "react";

const Page = () => {
	return (
		<Suspense fallback={<div>Loading...</div>}>
			<TravelPay />
		</Suspense>
	);
};

export default Page;
