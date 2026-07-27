import { IAccidentReviewDetail } from "../types";
import { money, orDash, yesNo } from "../utils/accident-review-display";
import { ReviewCard, ReviewRow, ReviewRowGrid } from "./review-card";

const AccidentTowImpoundCard = ({ report }: { report: IAccidentReviewDetail }) => (
	<ReviewCard title="Tow &amp; Impound">
		<ReviewRowGrid>
			<div>
				<ReviewRow label="BCEW towed" value={yesNo(report.bcewVehicleTowed)} />
				{report.bcewVehicleTowed && (
					<>
						<ReviewRow label="Tow provider" value={orDash(report.towProviderName)} />
						<ReviewRow label="Tow cost on spot" value={money(report.towCostOnSpot)} />
					</>
				)}
				<ReviewRow label="Other towed" value={yesNo(report.otherVehicleTowed)} />
				{report.otherVehicleTowed && (
					<ReviewRow label="Other vehicle tow cost" value={money(report.otherVehicleTowCost)} />
				)}
			</div>
			<div>
				<ReviewRow label="Impounded" value={yesNo(report.vehicleImpounded)} />
				{report.vehicleImpounded && (
					<>
						<ReviewRow label="Impound lot cost" value={money(report.impoundLotCost)} />
						<ReviewRow label="Impound release charges" value={money(report.impoundReleaseCharges)} />
					</>
				)}
			</div>
		</ReviewRowGrid>
	</ReviewCard>
);

export default AccidentTowImpoundCard;
