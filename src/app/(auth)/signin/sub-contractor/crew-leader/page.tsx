import AuthWrapper from "@/module/auth/components/auth-wrapper";
import SubContractorCrewLeaderSignInForm from "@/module/auth/templates/sub-contractor-login";

export default function SignInPage() {
	return (
		<AuthWrapper title={""}>
			<SubContractorCrewLeaderSignInForm />
		</AuthWrapper>
	);
}
