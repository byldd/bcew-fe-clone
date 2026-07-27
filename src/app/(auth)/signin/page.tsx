import AuthWrapper from "@/module/auth/components/auth-wrapper";
import LoginWrapper from "@/module/auth/templates/login-wrapper";

export default function SignInPage() {
	return (
		<AuthWrapper title={""}>
			<LoginWrapper />
		</AuthWrapper>
	);
}
