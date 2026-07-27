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
					<div className="mb-8 rounded-2xl p-4 shadow-sm ring-1 ring-gray-900/5"></div>
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
				</div>
			</div>
		</div>
	);
};

export default TermsServices;
