import { ACCESS_LEVEL } from "@/module/employee/enums";
import useAuthStore from "@/store/auth-store";

export const usePermissions = () => {
	const { user } = useAuthStore((state) => state);

	const releaseNotePermission = user?.releaseNotePermission || ACCESS_LEVEL.NONE;

	const employeeReleaseNotePermission = user?.employeeReleaseNotePermission || ACCESS_LEVEL.NONE;

	const adminReleaseNotePermission = user?.adminReleaseNotePermission || ACCESS_LEVEL.NONE;

	const isAdminWrite = adminReleaseNotePermission === ACCESS_LEVEL.WRITE;
	const isAdminRead = adminReleaseNotePermission === ACCESS_LEVEL.READ;
	const isAdminNone = adminReleaseNotePermission === ACCESS_LEVEL.NONE;

	const isEmployeeWrite = employeeReleaseNotePermission === ACCESS_LEVEL.WRITE;
	const isEmployeeRead = employeeReleaseNotePermission === ACCESS_LEVEL.READ;
	const isEmployeeNone = employeeReleaseNotePermission === ACCESS_LEVEL.NONE;

	return {
		releaseNotePermission,
		employeeReleaseNotePermission,
		adminReleaseNotePermission,
		isAdminWrite,
		isAdminRead,
		isAdminNone,
		isEmployeeWrite,
		isEmployeeRead,
		isEmployeeNone,
	};
};
