import { MATERIAL_ROLE } from "./enums";

const modalBodyVariants = {
	default: "w-[90%] max-w-md sm:max-w-md max-h-[90vh] overflow-y-auto",
	medium: "w-[90%] max-w-3xl sm:max-w-3xl max-h-[90vh] overflow-y-auto",
	big: "w-[90%] max-w-[80vw] sm:max-w-[80vw] max-h-[60vh] h-[60vh] sm:max-h-[80vh] sm:h-[80vh] overflow-y-auto",
	inherit: "w-max max-w-full max-h-[90vh] overflow-y-auto",
};

const ALLOWED_IMAGE_FILE_TYPES = ["image/jpeg", "image/png", "image/jpg"];

const HEIC_IMAGE_FILE_TYPES = ["image/heic", "image/heif"];

const ALLOWED_IMAGE_FILE_TYPES_WITH_HEIC = [...ALLOWED_IMAGE_FILE_TYPES, ...HEIC_IMAGE_FILE_TYPES];

// Images plus PDF/DOC — for uploaders that accept general supporting documents,
// not just photos (e.g. job site injury report attachments).
const PDF_MIME_TYPE = "application/pdf";

const ALLOWED_DOCUMENT_FILE_TYPES = [
	...ALLOWED_IMAGE_FILE_TYPES_WITH_HEIC,
	PDF_MIME_TYPE,
	"application/msword",
	"application/vnd.openxmlformats-officedocument.wordprocessingml.document",
];

const LUNCH_TIME_MINUTES = 12 * 60 + 15; // 12:15 in minutes
const LUNCH_BREAK_MINUTES = 30; // 30 minutes

const EOD_GPS_BUFFER_MINUTES = 15;
const leastLateConsiderMinutes = 1;

const MaterialRoleLabel: Record<MATERIAL_ROLE, string> = {
	[MATERIAL_ROLE.WAREHOUSE_MANAGER]: "Warehouse Manager",
	[MATERIAL_ROLE.OFFICE_MANAGER]: "Office Manager",
	[MATERIAL_ROLE.PROCUREMENT_SPECIALIST]: "Procurement Specialist",
};

const SlabRoughReferencePhoto = [
	{
		date: "2026-07-23T08:24:31.702Z",
		url: "https://bcew-staging.s3.us-east-1.amazonaws.com/5950058 - Reg at Stone Meadow TWIN 058 (06-18-2026) - 363165_2.jpeg-1784795062905",
	},
	{
		url: "https://bcew-staging.s3.us-east-1.amazonaws.com/5950058 - Reg at Stone Meadow TWIN 058 (06-18-2026) - 363165_1.jpeg-1784795062913",
	},
];

export {
	modalBodyVariants,
	ALLOWED_IMAGE_FILE_TYPES,
	ALLOWED_IMAGE_FILE_TYPES_WITH_HEIC,
	ALLOWED_DOCUMENT_FILE_TYPES,
	PDF_MIME_TYPE,
	LUNCH_TIME_MINUTES,
	LUNCH_BREAK_MINUTES,
	EOD_GPS_BUFFER_MINUTES,
	leastLateConsiderMinutes,
	MaterialRoleLabel,
	SlabRoughReferencePhoto,
};
