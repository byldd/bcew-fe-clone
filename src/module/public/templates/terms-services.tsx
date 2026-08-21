"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { MessageSquare, ShieldCheck, Mail, Scale, Users, Ban } from "lucide-react";
import { routes } from "@/config/routes";

const SECTIONS = [
	{ id: "acceptance", title: "1. Acceptance of Terms", icon: Scale },
	{ id: "use-services", title: "2. Use of Services", icon: Users },
	{ id: "messaging-terms", title: "3. SMS & Messaging Terms", icon: MessageSquare },
	{ id: "termination", title: "4. Termination", icon: Ban },
	{ id: "modifications", title: "5. Modifications", icon: ShieldCheck },
	{ id: "contact-us", title: "6. Contact Us", icon: Mail },
];

const TermsServices = () => {
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
			{/* Decorative background elements */}
			<div className="pointer-events-none absolute inset-0 z-0 overflow-hidden">
				<div className="bg-brand-lightBlue/10 absolute -left-1/4 -top-1/4 h-1/2 w-1/2 rounded-full blur-[120px]"></div>
				<div className="bg-brand-blue/5 absolute -right-1/4 top-1/4 h-1/2 w-1/2 rounded-full blur-[120px]"></div>
			</div>

			<div className="relative z-10 mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 lg:py-20">
				{/* Header */}
				<div className="mb-12 flex flex-col items-center justify-center text-center lg:mb-20">
					<div className="mb-8 rounded-2xl p-4 shadow-sm ring-1 ring-gray-900/5">
						{/* <Image
							src="/assets/svg/bcew-logo.svg"
							alt="Company Logo"
							width={140}
							height={140}
							className="object-contain"
						/> */}
					</div>
					<h1 className="text-4xl font-extrabold tracking-tight text-brand-dark sm:text-5xl lg:text-6xl">
						Terms of Service
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
								<section id="acceptance" className="scroll-mt-24 pb-12">
									<h2 className="text-2xl font-bold tracking-tight text-brand-dark sm:text-3xl">
										1. Acceptance of Terms
									</h2>
									<p className="mt-4 leading-loose">
										Welcome to Bucks County Electric Works (BCEW). By creating an account, accessing, or using our
										platform, you accept and agree to be bound by these Terms of Service (“Terms”) and our{" "}
										<Link href={routes.privacyPolicy} className="text-brand-blue font-medium hover:underline">
											Privacy Policy
										</Link>
										. If you do not agree to these terms, you may not use our services.
									</p>
								</section>

								<section id="use-services" className="scroll-mt-24 border-t border-gray-100 pb-12 pt-12">
									<h2 className="text-2xl font-bold tracking-tight text-brand-dark sm:text-3xl">2. Use of Services</h2>
									<p className="mt-4 leading-loose">
										Our services are intended for operational and scheduling purposes. You agree to use the platform
										only for lawful purposes and in a way that does not infringe the rights of, restrict, or inhibit
										anyone else&apos;s use and enjoyment of the platform. You are responsible for maintaining the
										confidentiality of your account credentials and for all activities that occur under your account.
									</p>
								</section>

								<section id="messaging-terms" className="scroll-mt-24 border-t border-gray-100 pb-12 pt-12">
									<h2 className="text-2xl font-bold tracking-tight text-brand-dark sm:text-3xl">
										3. SMS & Messaging Terms
									</h2>
									<p className="mt-4 leading-loose">
										By opting into our SMS communications, you agree to receive text messages strictly for operational
										purposes, such as schedule updates, job reminders, and service notifications.
									</p>
									<div className="border-brand-blue/20 bg-brand-blue/5 mt-6 space-y-4 rounded-xl border p-6 shadow-sm">
										<ul className="list-inside list-disc space-y-3 font-medium text-gray-700">
											<li>
												<strong className="text-gray-900">Message Frequency:</strong> Message frequency varies depending
												on your schedule and operational needs.
											</li>
											<li>
												<strong className="text-gray-900">Pricing:</strong> Message and data rates may apply. Check with
												your mobile carrier for details.
											</li>
											<li>
												<strong className="text-gray-900">Cancellation/Opt-Out:</strong> You can cancel the SMS service
												at any time. Simply reply{" "}
												<strong className="rounded bg-white px-2 py-0.5 uppercase ring-1 ring-gray-200">STOP</strong> to
												any message you receive from us. Upon receiving your &quot;STOP&quot; message, we will send one
												final confirmation message before removing you from our SMS list.
											</li>
											<li>
												<strong className="text-gray-900">Customer Support:</strong> If you experience issues with the
												messaging program, reply{" "}
												<strong className="rounded bg-white px-2 py-0.5 uppercase ring-1 ring-gray-200">HELP</strong>{" "}
												for assistance, or contact us directly at support@bcew.com.
											</li>
											<li className="text-sm text-gray-500">
												<strong className="text-gray-700">Carrier Liability:</strong> Carriers are not liable for
												delayed or undelivered messages.
											</li>
										</ul>
									</div>
								</section>

								<section id="termination" className="scroll-mt-24 border-t border-gray-100 pb-12 pt-12">
									<h2 className="text-2xl font-bold tracking-tight text-brand-dark sm:text-3xl">4. Termination</h2>
									<p className="mt-4 leading-loose">
										We may terminate or suspend your account and access to the services immediately, without prior
										notice or liability, for any reason whatsoever, including without limitation if you breach the Terms
										of Service.
									</p>
								</section>

								<section id="modifications" className="scroll-mt-24 border-t border-gray-100 pb-12 pt-12">
									<h2 className="text-2xl font-bold tracking-tight text-brand-dark sm:text-3xl">
										5. Modifications to Terms & Services
									</h2>
									<p className="mt-4 leading-loose">
										We reserve the right to modify or discontinue the service with or without notice. We also reserve
										the right to update or modify these Terms of Service at any time. Any changes will be effective
										immediately upon posting. Your continued use of the services after any such changes constitutes your
										acceptance of the new Terms of Service.
									</p>
								</section>

								<section id="contact-us" className="scroll-mt-24 border-t border-gray-100 pt-12">
									<h2 className="text-2xl font-bold tracking-tight text-brand-dark sm:text-3xl">6. Contact Us</h2>
									<p className="mt-4 leading-loose">
										If you have any questions about these Terms of Service, please contact us.
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

export default TermsServices;
