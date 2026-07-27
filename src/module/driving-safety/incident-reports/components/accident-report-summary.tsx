import { IAccidentReviewDetail } from "../types";
import { WEATHER_CONDITION_LABEL } from "../utils/constants";
import { dateTime, DASH, joinParts, orDash, yesNo } from "../utils/accident-review-display";
import { ReviewCard, ReviewRow, ReviewRowGrid } from "./review-card";

const AccidentReportSummary = ({ report }: { report: IAccidentReviewDetail }) => (
	<ReviewCard title="Report Summary — All Answers">
		<ReviewRowGrid>
			<div>
				<ReviewRow label="Employee" value={orDash(report.user?.name)} />
				<ReviewRow label="Truck" value={joinParts(report.truckNumber, report.licensePlate ?? report.vin)} />
				<ReviewRow label="Date" value={dateTime(report.accidentDate)} />
				<ReviewRow label="Location" value={orDash(report.location)} />
				<ReviewRow label="Nearest cross street" value={orDash(report.nearestCrossStreet)} />
				<ReviewRow label="On a job site" value={yesNo(report.onJobSite)} />
			</div>
			<div>
				<ReviewRow label="Another vehicle involved" value={yesNo(report.anotherVehicleInvolved)} />
				<ReviewRow label="Person struck" value={yesNo(report.personStruck)} />
				<ReviewRow
					label="Police"
					value={
						report.policeContacted ? joinParts(report.policeDepartment, report.policeReportNumber) : "Not contacted"
					}
				/>
				<ReviewRow label="Weather" value={report.weather ? WEATHER_CONDITION_LABEL[report.weather] : DASH} />
				<ReviewRow label="Submitted" value={dateTime(report.submittedAt)} />
				<ReviewRow
					label="Points (assessment)"
					value={
						report.violationType
							? joinParts(report.violationType.name, String(report.pointsApplied ?? report.violationType.points))
							: "Pending"
					}
				/>
			</div>
		</ReviewRowGrid>

		<div className="mt-1">
			<ReviewRow label="Describe the accident" value={orDash(report.describeAccident)} />
			<ReviewRow label="Damage to BYLDD vehicle" value={orDash(report.damageToBcewVehicle)} />
			<ReviewRow label="Damage to other vehicle" value={orDash(report.damageToOtherProperty)} />
		</div>
	</ReviewCard>
);

export default AccidentReportSummary;
