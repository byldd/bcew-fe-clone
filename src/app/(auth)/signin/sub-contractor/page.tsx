import AuthWrapper from "@/module/auth/components/auth-wrapper";
import SubContractorSignInForm from "@/module/auth/templates/sub-contractor-admin-login";

export default function SignInPage() {
	return (
		<AuthWrapper title={""}>
			<SubContractorSignInForm />
		</AuthWrapper>
	);
}
