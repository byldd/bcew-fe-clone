enum QUICK_ACTIONS {
	REQUEST_MATERIAL = "request-material",
	REQUEST_INFORMATION = "request-information",
	OTHER_REQUEST = "other-request",
	SUBMIT_PLAN_CHANGE = "submit-plan-change",
	SUBMIT_ADDENDUM = "submit-addendum",
}

enum MATERIAL_AVAILABILITY {
	IN_STOCK = "In Stock",
	OUT_OF_STOCK = "Out of Stock",
	BACKORDER = "Backorder",
}

enum MATERIAL_SELECTION_VIEW {
	SELECTION = "selection",
	PREVIEW = "preview",
	SUCCESS = "success",
}

export enum PULL_LIST_CONFIRMATION {
	YES = "yes",
	NO = "no",
}

export { QUICK_ACTIONS, MATERIAL_AVAILABILITY, MATERIAL_SELECTION_VIEW };
