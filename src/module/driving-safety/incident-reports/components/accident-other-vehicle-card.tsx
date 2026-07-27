import { IAccidentReviewDetail } from "../types";
import { orDash, yesNo } from "../utils/accident-review-display";
import { ReviewCard, ReviewRow, ReviewRowGrid } from "./review-card";

const AccidentOtherVehicleCard = ({
	otherVehicle,
}: {
	otherVehicle: NonNullable<IAccidentReviewDetail["otherVehicle"]>;
}) => (
	<ReviewCard title="Other Vehicle">
		<ReviewRowGrid>
			<div>
				<ReviewRow
					label="Make / model"
					value={orDash([otherVehicle.make, otherVehicle.model].filter(Boolean).join(" "))}
				/>
				<ReviewRow label="VIN" value={orDash(otherVehicle.vin)} />
				<ReviewRow label="Driver" value={orDash(otherVehicle.driverFullName)} />
				<ReviewRow label="What was struck" value={orDash(otherVehicle.whatWasStruck)} />
			</div>
			<div>
				<ReviewRow label="License" value={orDash(otherVehicle.driverLicenseNumber)} />
				<ReviewRow
					label="Insurance"
					value={orDash([otherVehicle.insuranceCompany, otherVehicle.policyNumber].filter(Boolean).join(" · "))}
				/>
				<ReviewRow label="Refused info" value={yesNo(otherVehicle.refusedToProvideInfo)} />
				<ReviewRow label="Phone" value={orDash(otherVehicle.driverPhoneNumber)} />
			</div>
		</ReviewRowGrid>
	</ReviewCard>
);

export default AccidentOtherVehicleCard;
