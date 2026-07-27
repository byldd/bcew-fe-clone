export enum TakeActionStep {
	NOT_BUG = "NOT_BUG",
	DUPLICATE = "DUPLICATE",
	VALID_BUG = "VALID_BUG",
	CLASSIFY = "CLASSIFY",
	ASANA_SUCCESS = "ASANA_SUCCESS",
}

export enum IssueStatus {
	OPEN = "Open",
	CLOSED = "Closed",
	DUPLICATE = "Duplicate",
}

export enum Priority {
	HIGH = "High",
	MEDIUM = "Medium",
	LOW = "Low",
}

export enum IssueAction {
	TAKE_ACTION = "Take Action",
	NOT_A_BUG = "Not a Bug",
	ASANA_CREATED = "ASANA Created",
	MERGED = "Merged",
}
