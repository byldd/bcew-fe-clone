import { TECHNICAL_ISSUE_CLASSIFICATION, TECHNICAL_ISSUE_SEVERITY, TECHNICAL_ISSUE_TYPE } from "@/utils/enums";
import {
	TECHNICAL_ISSUE_CLASSIFICATION_LABEL_MAP,
	TECHNICAL_ISSUE_SEVERITY_LABEL_MAP,
	TECHNICAL_ISSUE_TYPE_LABEL_MAP,
} from "../constants";

export const getTechnicalIssueTypeLabel = (type?: TECHNICAL_ISSUE_TYPE): string => {
	if (!type) return "--";
	return TECHNICAL_ISSUE_TYPE_LABEL_MAP[type] ?? type;
};

export const getTechnicalIssueSeverityLabel = (severity?: TECHNICAL_ISSUE_SEVERITY | null): string => {
	if (!severity) return "--";
	return TECHNICAL_ISSUE_SEVERITY_LABEL_MAP[severity] ?? severity;
};

export const getTechnicalIssueClassificationLabel = (
	classification?: TECHNICAL_ISSUE_CLASSIFICATION | null
): string => {
	if (!classification) return "--";
	return TECHNICAL_ISSUE_CLASSIFICATION_LABEL_MAP[classification] ?? classification;
};
