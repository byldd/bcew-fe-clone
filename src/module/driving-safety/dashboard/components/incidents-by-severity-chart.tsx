import { INCIDENT_SEVERITY } from "../../incident-reports/utils/enums";
import { ISeverityBreakdown } from "../types";
import {
	CIRCUMFERENCE,
	RADIUS,
	SEVERITY_COLOR,
	SEVERITY_LABEL,
	SEVERITY_ORDER,
	STROKE_WIDTH,
} from "../utils/constants";

const IncidentsBySeverityChart = ({ data, isLoading }: { data?: ISeverityBreakdown[]; isLoading: boolean }) => {
	const countBySeverity = (severity: INCIDENT_SEVERITY) =>
		(data ?? []).find((item) => item.severity === severity)?.count ?? 0;

	const total = SEVERITY_ORDER.reduce((sum, severity) => sum + countBySeverity(severity), 0);

	let cumulativeOffset = 0;
	const segments = SEVERITY_ORDER.map((severity) => {
		const count = countBySeverity(severity);
		const arc = total > 0 ? (count / total) * CIRCUMFERENCE : 0;
		const segment = { severity, count, arc, offset: cumulativeOffset };
		cumulativeOffset += arc;
		return segment;
	});

	return (
		<div className="flex flex-col gap-5 rounded-[12px] border border-brand-dark10 bg-white p-5 lg:h-[300px]">
			<h3 className="text-sm font-medium text-brand-dark50">Incidents by Severity</h3>

			{isLoading ? (
				<div className="mx-auto my-6 h-[220px] w-[220px] animate-pulse rounded-full bg-brand-bgLightgrey" />
			) : (
				<div className="flex flex-col items-center gap-10 sm:flex-row sm:items-center sm:justify-start sm:gap-16">
					<div className="relative h-[220px] w-[220px]">
						<svg viewBox="0 0 120 120" className="h-full w-full -rotate-90">
							<circle cx={60} cy={60} r={RADIUS} fill="none" stroke="#F1F1F1" strokeWidth={STROKE_WIDTH} />
							{total > 0 &&
								segments.map((segment) => (
									<circle
										key={segment.severity}
										cx={60}
										cy={60}
										r={RADIUS}
										fill="none"
										stroke={SEVERITY_COLOR[segment.severity]}
										strokeWidth={STROKE_WIDTH}
										strokeDasharray={`${segment.arc} ${CIRCUMFERENCE}`}
										strokeDashoffset={-segment.offset}
									/>
								))}
						</svg>
						<div className="absolute inset-0 flex flex-col items-center justify-center">
							<span className="text-4xl font-bold text-brand-dark">{total}</span>
							<span className="text-base text-brand-dark50">Total</span>
						</div>
					</div>

					<div className="grid grid-cols-2 gap-x-8 gap-y-3">
						{SEVERITY_ORDER.map((severity) => (
							<div key={severity} className="flex items-center gap-2">
								<span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: SEVERITY_COLOR[severity] }} />
								<span className="text-sm text-brand-dark50">{SEVERITY_LABEL[severity]}</span>
							</div>
						))}
					</div>
				</div>
			)}
		</div>
	);
};

export default IncidentsBySeverityChart;
