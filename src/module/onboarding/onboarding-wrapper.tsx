interface WrapperProps {
	children: React.ReactNode;
	title: string;
}

const OnboardingWrapper = ({ children, title }: WrapperProps) => {
	return (
		<div className="w-full max-w-[530px]">
			<h2 className="text-center text-[32px] font-bold text-zblack-500">{title}</h2>
			<div className="mt-8">{children}</div>
		</div>
	);
};

export default OnboardingWrapper;
