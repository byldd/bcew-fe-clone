"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { Copy, CheckCircle2, ShieldCheck, Mail, Phone, Database } from "lucide-react";

const SECTIONS = [
	{ id: "introduction", title: "1. Introduction", icon: ShieldCheck },
	{ id: "information-collection", title: "2. Information We Collect", icon: Database },
	{ id: "sms-communications", title: "3. SMS Communications & Consent", icon: Phone },
	{ id: "data-sharing", title: "4. Information Sharing", icon: Copy },
	{ id: "data-security", title: "5. Data Security & Retention", icon: CheckCircle2 },
	{ id: "contact-us", title: "6. Contact Us", icon: Mail },
];

const PrivacyPolicy = () => {
	const [activeSection, setActiveSection] = useState(SECTIONS[0]?.id);

	useEffect(() => {
		const handleScroll = () => {
			const currentSection = SECTIONS.map((s) => document.getElementById(s.id)).find((el) => {
				if (!el) return false;
				const rect = el?.getBoundingClientRect();
				return rect && rect.top >= 0 && rect.top <= window.innerHeight / 2;
			});

			if (currentSection) {
				setActiveSection(currentSection.id);
			}
		};

		window.addEventListener("scroll", handleScroll);
		return () => window.removeEventListener("scroll", handleScroll);
	}, []);

	const scrollToSection = (id: string) => {
		const element = document.getElementById(id);
		if (element) {
			const y = element.getBoundingClientRect().top + window.scrollY - 100;
			window.scrollTo({ top: y, behavior: "smooth" });
		}
	};

	return (
		<div className="relative min-h-screen bg-brand-bgLightgrey font-inter">
			<div className="relative z-10 mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 lg:py-20">
				{/* Header */}
				<div className="mb-12 flex flex-col items-center justify-center text-center lg:mb-20">
					<div className="mb-8 rounded-2xl bg-white p-4 shadow-sm ring-1 ring-gray-900/5">
						<Image
							src="/assets/svg/bcew-logo.svg"
							alt="Company Logo"
							width={140}
							height={140}
							className="object-contain"
						/>
					</div>
					<h1 className="text-4xl font-extrabold tracking-tight text-brand-dark sm:text-5xl lg:text-6xl">
						Privacy Policy
					</h1>
					<p className="mt-4 text-lg text-gray-500">
						Effective Date: <span className="font-semibold text-gray-900">February 17, 2026</span>
					</p>
				</div>

				<div className="flex flex-col gap-12 lg:flex-row lg:items-start">
					{/* Sidebar Navigation */}
					<div className="hidden lg:sticky lg:top-24 lg:block lg:w-1/4">
						<div className="rounded-2xl bg-white/60 p-6 shadow-sm ring-1 ring-gray-900/5 backdrop-blur-xl">
							<h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-gray-500">Table of Contents</h3>
							<nav className="flex flex-col space-y-1">
								{SECTIONS.map((section) => (
									<button
										key={section.id}
										onClick={() => scrollToSection(section.id)}
										className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm font-medium transition-all duration-200 ${
											activeSection === section.id
												? "bg-brand-blue/10 text-brand-blue"
												: "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
										}`}
									>
										<section.icon
											className={`h-4 w-4 ${activeSection === section.id ? "text-brand-blue" : "text-gray-400"}`}
										/>
										{section.title}
									</button>
								))}
							</nav>
						</div>
					</div>

					{/* Main Content */}
					<div className="lg:w-3/4">
						<div className="rounded-3xl bg-white p-8 shadow-md ring-1 ring-gray-900/5 sm:p-12 lg:p-16">
							<div className="prose prose-brand max-w-none text-gray-600">
								<section id="introduction" className="scroll-mt-24 pb-12">
									<h2 className="text-2xl font-bold tracking-tight text-brand-dark sm:text-3xl">1. Introduction</h2>
									<p className="mt-4 leading-loose">
										Bucks County Electric Works (BCEW) (“we,” “us,” or “our”) is committed to protecting your privacy.
										This Privacy Policy explains how we collect, use, and protect your personal information when you use
										our platform, services, and communications channels. By using our services, you agree to the
										collection and use of information in accordance with this policy.
									</p>
								</section>

								<section id="information-collection" className="scroll-mt-24 border-t border-gray-100 pb-12 pt-12">
									<h2 className="text-2xl font-bold tracking-tight text-brand-dark sm:text-3xl">
										2. Information We Collect
									</h2>
									<p className="mt-4 leading-loose">
										We collect limited information to provide and improve our services to you. The types of personal
										information we collect include:
									</p>
									<ul className="marker:text-brand-blue mt-4 list-disc space-y-2 pl-6 leading-loose">
										<li>
											<strong className="text-gray-900">Identifiers:</strong> Name, contact details, email address, and
											mobile phone number.
										</li>
										<li>
											<strong className="text-gray-900">Account Information:</strong> Profile data, scheduling
											information, and service-related data.
										</li>
										<li>
											<strong className="text-gray-900">Communication Preferences:</strong> Your choices regarding
											notifications and explicitly granted SMS messaging consent.
										</li>
									</ul>
								</section>

								<section id="sms-communications" className="scroll-mt-24 border-t border-gray-100 pb-12 pt-12">
									<h2 className="text-2xl font-bold tracking-tight text-brand-dark sm:text-3xl">
										3. SMS Communications & Consent
									</h2>
									<div className="border-brand-blue/20 bg-brand-blue/5 mt-6 rounded-xl border p-6 shadow-sm">
										<h4 className="text-brand-blue flex items-center gap-2 font-semibold">
											<CheckCircle2 className="h-5 w-5" />
											Mobile Messaging Acknowledgment
										</h4>
										<p className="mt-3 leading-loose text-gray-700">
											If you choose to opt-in to SMS communications, Bucks County Electric Works (BCEW) may send you
											text messages strictly for operational and service-related purposes, such as schedule updates, job
											reminders, and account alerts.
										</p>
										<div className="mt-4 rounded-lg bg-white p-4 font-mono text-sm shadow-sm ring-1 ring-black/5">
											<p className="font-semibold text-gray-900">Message frequency varies.</p>
											<p className="mt-1 font-semibold text-gray-900">Message and data rates may apply.</p>
										</div>
										<p className="mt-4 font-medium text-gray-800">Opt-Out & Help Instructions:</p>
										<ul className="mt-2 list-inside list-disc space-y-1 text-sm leading-relaxed text-gray-700">
											<li>
												Reply <strong className="rounded bg-white px-1 py-0.5 text-gray-900">STOP</strong> at any time
												to cancel and opt-out of all future messages.
											</li>
											<li>
												Reply <strong className="rounded bg-white px-1 py-0.5 text-gray-900">HELP</strong> for customer
												support and assistance.
											</li>
										</ul>
									</div>
									<p className="mt-6 leading-loose">
										Providing SMS consent is entirely optional. It is not a condition of employment or of receiving core
										services from Bucks County Electric Works (BCEW). You may withdraw your consent at any time without
										affecting your access to the platform.
									</p>
								</section>

								<section id="data-sharing" className="scroll-mt-24 border-t border-gray-100 pb-12 pt-12">
									<h2 className="text-2xl font-bold tracking-tight text-brand-dark sm:text-3xl">
										4. Information Sharing & Third Parties
									</h2>
									<p className="mt-4 leading-loose">
										We do not sell, rent, or trade your personal information. We strictly limit how your data is shared.
									</p>
									<div className="mt-6 border-l-4 border-red-500 bg-red-50/50 p-6">
										<h4 className="text-lg font-semibold text-red-900">Strict Non-Sharing Policy for SMS Data</h4>
										<p className="mt-2 font-medium leading-relaxed text-red-800">
											No mobile information or SMS consent data will be shared with third parties or affiliates for
											marketing or promotional purposes. All the above categories exclude text messaging originator
											opt-in data and consent; this information will not be shared with any third parties under any
											circumstances, except where legally required.
										</p>
									</div>
									<p className="mt-6 leading-loose">
										We only share limited operational information with trusted service providers (e.g., cloud hosting,
										messaging infrastructure like Twilio) solely to deliver our services on our behalf. These providers
										are contractually obligated to protect your data and cannot use it for their own purposes.
									</p>
								</section>

								<section id="data-security" className="scroll-mt-24 border-t border-gray-100 pb-12 pt-12">
									<h2 className="text-2xl font-bold tracking-tight text-brand-dark sm:text-3xl">
										5. Data Security & Retention
									</h2>
									<p className="mt-4 leading-loose">
										We implement robust administrative, technical, and physical security measures to protect your
										personal information against unauthorized access, alteration, disclosure, or destruction. We retain
										your information only for as long as necessary to fulfill the operational purposes outlined in this
										policy or to comply with legal obligations.
									</p>
								</section>

								<section id="contact-us" className="scroll-mt-24 border-t border-gray-100 pt-12">
									<h2 className="text-2xl font-bold tracking-tight text-brand-dark sm:text-3xl">6. Contact Us</h2>
									<p className="mt-4 leading-loose">
										If you have any questions, concerns, or requests regarding this Privacy Policy or our data
										practices, please reach out to our support team.
									</p>
									<a
										href="mailto:info@bcew.net"
										className="focus:ring-brand-blue group mt-6 inline-flex items-center justify-center gap-2 rounded-xl bg-brand-dark px-6 py-3 text-sm font-semibold text-white transition-all hover:bg-gray-800 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-offset-2"
									>
										<Mail className="h-4 w-4 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
										Email info@bcew.net
									</a>
								</section>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
};

export default PrivacyPolicy;
