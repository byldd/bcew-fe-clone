import { UserType } from "@/module/profile/types";

type AuthUser = NonNullable<UserType["data"]["user"]>;

export const checkIsFingerprintEnabled = (user: AuthUser): boolean => {
	return user.isPermissionOverridden
		? (user.isFingerprintEnabled ?? false)
		: (user.role?.isFingerprintEnabled ?? false);
};
