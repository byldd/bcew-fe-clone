import { vehicleBreakdownAuthorizedPerson } from "@/module/employee-safety/constants";

const BreakdownAuthorizedPersonCard = () => (
	<div className="rounded-[8px] border bg-white p-4 shadow-sm">
		<p className="text-left text-sm font-medium text-brand-dark">Step 2 - Call the authorized person</p>
		<div className="mt-2 flex items-center justify-between text-sm">
			<span className="font-medium text-brand-dark">{vehicleBreakdownAuthorizedPerson.name}</span>
			<a href={`tel:${vehicleBreakdownAuthorizedPerson.phone}`} className="font-medium text-blue-600 underline">
				{vehicleBreakdownAuthorizedPerson.phone}
			</a>
		</div>
	</div>
);

export default BreakdownAuthorizedPersonCard;
