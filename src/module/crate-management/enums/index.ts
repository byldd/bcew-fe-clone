export enum SCANNER_TAB {
	CAMERA = "camera",
	MANUAL = "manual",
}

export enum RECEIVE_STEP {
	SCAN = "scan",
	UPLOAD_PHOTOS = "upload_photos",
	CONFIRM = "confirm",
	PROCESSING = "processing",
	SUCCESS = "success",
}

export enum DELIVERY_STATUS_STEP {
	ORDERED = "Ordered",
	PULLED = "Pulled",
	VALIDATED = "Validated",
	LOADED = "Loaded",
	DELIVERY_CONFIRMATION = "Delivery Con",
	DELIVERED = "Delivered",
}

export enum CRATE_SCAN_ACTION {
	CRATE_SCANNED_TO_RECEIVE = "crate_scanned_to_receive",
	CRATE_SCANNED_TO_RETURN = "crate_scanned_to_return",
}
