"use client";
import React, { useState } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { AlertTriangle, ArrowLeft } from "lucide-react";
import { TextHoverEffect } from "@/components/ui/text-hover-effect";
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { Toaster } from 'react-hot-toast';

interface FormData {
    title: string;
    firstName: string;
    lastName: string;
    phone: string;
    email: string;
    referredby: string;
    country: string;
    alternativeEmail?: string;
}

export default function SuperUserApplication() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState<FormData>({
        title: "",
        firstName: "",
        lastName: "",
        phone: "",
        email: "",
        referredby: "",
        country: "",
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        
        try {
            const response = await fetch('/api/superapplication', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    title: formData.title,
                    first_name: formData.firstName,  // Match database column names
                    last_name: formData.lastName,
                    phone: formData.phone,
                    email: formData.email,
                    referred_by: formData.referredby,
                    country: formData.country,
                }),
            });

            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.error || 'Failed to submit application');
            }

            toast.success('Application submitted successfully');
            router.push('/');  // Redirect to home page
            
        } catch (error) {
            console.error('Error:', error);
            toast.error(error instanceof Error ? error.message : 'Failed to submit application');
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    return (
        <>
            <Toaster position="bottom-center" />
            <div className="min-h-screen flex justify-center items-center relative bg-white dark:bg-black">
                <Link
                    href="/settings"
                    className="absolute top-4 left-4 flex items-center space-x-2 text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100 transition-colors"
                >
                    <ArrowLeft className="h-4 w-4" />
                    <span>Back to Settings</span>
                </Link>

                <div className="max-w-4xl w-full mx-auto rounded-lg p-4 md:p-8 shadow-input bg-white dark:bg-black border border-gray-200 dark:border-gray-800">
                    <TextHoverEffect text="1Bid" />

                    <div className="my-6 p-4 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-500/20 rounded-lg">
                        <div className="flex items-center gap-3">
                            <AlertTriangle className="h-5 w-5 text-red-500 dark:text-red-400" />
                            <p className="text-red-700 dark:text-red-300">
                                Important Notice: Superusers can only perform administrative actions and cannot participate in regular platform activities.
                            </p>
                        </div>
                    </div>

                    <form onSubmit={handleSubmit} className="my-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-4">
                                <h2 className="text-xl font-semibold dark:text-gray-200">
                                    General Information
                                </h2>

                                <LabelInputContainer>
                                    <Label htmlFor="title">Title</Label>
                                    <select
                                        name="title"
                                        id="title"
                                        value={formData.title}
                                        onChange={handleChange}
                                        className="w-full p-3 rounded-md bg-gray-50 dark:bg-zinc-900 border border-gray-200 dark:border-gray-800"
                                    >
                                        <option value="">Select Title</option>
                                        <option value="mr">Mr.</option>
                                        <option value="ms">Ms.</option>
                                        <option value="dr">Dr.</option>
                                    </select>
                                </LabelInputContainer>

                                <LabelInputContainer>
                                    <Label htmlFor="firstName">First Name</Label>
                                    <Input
                                        required
                                        id="firstName"
                                        name="firstName"
                                        value={formData.firstName}
                                        onChange={handleChange}
                                        placeholder="John"
                                    />
                                </LabelInputContainer>

                                <LabelInputContainer>
                                    <Label htmlFor="lastName">Last Name</Label>
                                    <Input
                                        required
                                        id="lastName"
                                        name="lastName"
                                        value={formData.lastName}
                                        onChange={handleChange}
                                        placeholder="Doe"
                                    />
                                </LabelInputContainer>

                                <LabelInputContainer>
                                    <Label htmlFor="referredby">Referred By</Label>
                                    <Input
                                        id="referredby"
                                        name="referredby"
                                        value={formData.referredby}
                                        onChange={handleChange}
                                        placeholder="Referrer's Name"
                                    />
                                </LabelInputContainer>
                            </div>

                            <div className="space-y-4">
                                <h2 className="text-xl font-semibold dark:text-gray-200">
                                    Contact Details
                                </h2>

                                <LabelInputContainer>
                                    <Label htmlFor="country">Country</Label>
                                    <select
                                        name="country"
                                        id="country"
                                        value={formData.country}
                                        onChange={handleChange}
                                        className="w-full p-3 rounded-md bg-gray-50 dark:bg-zinc-900 border border-gray-200 dark:border-gray-800"
                                    >
                                        <option value="">Select Country</option>
                                        <option value="us">United States</option>
                                        <option value="uk">United Kingdom</option>
                                        <option value="ca">Canada</option>
                                    </select>
                                </LabelInputContainer>

                                <LabelInputContainer>
                                    <Label htmlFor="phone">Phone Number</Label>
                                    <Input
                                        required
                                        id="phone"
                                        name="phone"
                                        value={formData.phone}
                                        onChange={handleChange}
                                        placeholder="+1 (555) 000-0000"
                                    />
                                </LabelInputContainer>

                                <LabelInputContainer>
                                    <Label htmlFor="email">Email Address</Label>
                                    <Input
                                        required
                                        type="email"
                                        id="email"
                                        name="email"
                                        value={formData.email}
                                        onChange={handleChange}
                                        placeholder="john.doe@example.com"
                                    />
                                </LabelInputContainer>
                            </div>
                        </div>

                        <div className="space-y-6 mt-8">
                            <div className="flex items-center gap-3 p-4 bg-gray-50 dark:bg-zinc-900 border border-gray-200 dark:border-gray-800 rounded-lg">
                                <input
                                    type="checkbox"
                                    id="terms"
                                    required
                                    className="rounded border-gray-300 dark:border-gray-700 bg-white dark:bg-zinc-900 text-blue-500"
                                />
                                <label htmlFor="terms" className="text-gray-600 dark:text-gray-400">
                                    I accept the Terms and Conditions and understand the responsibilities of being a Superuser.
                                </label>
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="bg-gradient-to-br relative group/btn from-black dark:from-zinc-900 dark:to-zinc-900 to-neutral-600 block dark:bg-zinc-800 w-full text-white rounded-md h-9 font-medium shadow-[0px_1px_0px_0px_#ffffff40_inset,0px_-1px_0px_0px_#ffffff40_inset] dark:shadow-[0px_1px_0px_0px_var(--zinc-800)_inset,0px_-1px_0px_0px_var(--zinc-800)_inset]"
                            >
                                {loading ? "Submitting..." : "Submit Application →"}
                                <BottomGradient />
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </>
    );
}

const BottomGradient = () => {
    return (
        <>
            <span className="group-hover/btn:opacity-100 block transition duration-500 opacity-0 absolute h-px w-full -bottom-px inset-x-0 bg-gradient-to-r from-transparent via-cyan-500 to-transparent" />
            <span className="group-hover/btn:opacity-100 blur-sm block transition duration-500 opacity-0 absolute h-px w-1/2 mx-auto -bottom-px inset-x-10 bg-gradient-to-r from-transparent via-indigo-500 to-transparent" />
        </>
    );
};

const LabelInputContainer = ({
    children,
    className,
}: {
    children: React.ReactNode;
    className?: string;
}) => {
    return (
        <div className={cn("flex flex-col space-y-2 w-full", className)}>
            {children}
        </div>
    );
};