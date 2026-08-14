import { BREAKDOWN_KEY_RESOURCES } from "../utils/constants";

const BreakdownKeyResources = () => (
	<div className="space-y-2">
		<h3 className="text-sm font-medium text-brand-dark50">Key Resources</h3>
		<ul className="space-y-2">
			{BREAKDOWN_KEY_RESOURCES.map((resource) => (
				<li key={resource.label} className="border-b border-brand-dark10 pb-2 last:border-b-0 last:pb-0">
					<span className="text-xs font-medium text-brand-dark">{resource.label}:</span>{" "}
					<span className="text-xs text-brand-dark60">{resource.description}</span>
				</li>
			))}
		</ul>
	</div>
);

export default BreakdownKeyResources;
