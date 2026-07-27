import SignUpForm from "@/module/auth/templates/sign-up-form";
import AuthWrapper from "@/module/auth/components/auth-wrapper";

export default function SignUpPage() {
	return (
		<AuthWrapper
			title={<>Welcome !</>}
			termsAndConditions={
				<div className="text-balance text-center text-xs text-muted-foreground [&_a]:underline [&_a]:underline-offset-4 [&_a]:hover:text-primary">
					By singing up, you agree to our <a href="#">Terms of Service</a> and <a href="#">Privacy Policy</a>.
				</div>
			}
		>
			<SignUpForm />
		</AuthWrapper>
	);
}
