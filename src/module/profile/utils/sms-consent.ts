import { UserType } from "../types";

export const isSmsConsentProvided = ({
	user,
	subcontractorCrew,
}: {
	user?: UserType["data"]["user"] | null;
	subcontractorCrew?: UserType["data"]["subContractorCrew"] | null;
}) => {
	if (user) {
		return user?.smsConsent && user?.acceptTerms && user?.promotionalSmsConsent;
	}
	if (subcontractorCrew) {
		return subcontractorCrew?.smsConsent && subcontractorCrew?.acceptTerms && subcontractorCrew?.promotionalSmsConsent;
	}
	return false;
};
