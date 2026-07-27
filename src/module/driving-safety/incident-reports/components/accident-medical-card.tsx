import { MEDICAL_DRUG_SCREEN } from "@/module/employee-safety/enums";

import { IAccidentReviewDetail } from "../types";
import { MEDICAL_DRUG_SCREEN_LABEL } from "../utils/constants";
import { orDash } from "../utils/accident-review-display";
import { ReviewCard, ReviewRow, ReviewRowGrid } from "./review-card";

const AccidentMedicalCard = ({ report }: { report: IAccidentReviewDetail }) => {
	const drugScreenRequired = report.medicalDrugScreen !== MEDICAL_DRUG_SCREEN.NO_ACTION;

	return (
		<ReviewCard title="Medical &amp; Drug Screen">
			<ReviewRowGrid>
				<div>
					<ReviewRow label="Medical action" value={MEDICAL_DRUG_SCREEN_LABEL[report.medicalDrugScreen]} />
					<ReviewRow
						label="Drug screen"
						value={drugScreenRequired ? orDash(report.drugScreenLocation) : "Not required"}
					/>
				</div>
				<div>
					<ReviewRow label="Treatment location" value={orDash(report.medicalTreatmentLocation)} />
					<ReviewRow
						label="Injury report"
						value={report.injury ? orDash(report.injury.bodyPartInjured) : "None linked"}
					/>
				</div>
			</ReviewRowGrid>

			{!report.injury && (
				<p className="mt-3 text-xs italic text-brand-dark50">
					If a person had been struck, a drug screen would be required and a linked injury report would appear here.
				</p>
			)}
		</ReviewCard>
	);
};

export default AccidentMedicalCard;
