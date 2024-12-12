'use client'
import React, { useState } from 'react';
import { motion } from "framer-motion";
import { AlertTriangle } from "lucide-react";

interface FormData {
    title: string;
    firstName: string;
    lastName: string;
    phone: string;
    email: string;
    username: string;
    referredby: string;
    country: string;
    alternativeEmail?: string;
}

export default function SuperuserApplication() {
    const [formData, setFormData] = useState<FormData>({
        title: "",
        firstName: "",
        lastName: "",
        username: "",
        referredby: "",
        country: "",
        phone: "",
        email: "",
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        console.log(formData);
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    return (
        <div className="min-h-screen bg-gray from-gray-100 via-slate-900 to-gray-300">
            <div className="container mx-auto px-4 py-12">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="max-w-4xl mx-auto backdrop-blur-xl bg-gray-900/50 rounded-3xl p-8 shadow-2xl border border-gray-800"
                >
                    <h1 className="text-4xl md:text-5xl font-bold text-gray-100 text-center mb-8">
                        SuperUser Application
                    </h1>

                    <div className="mb-8 bg-red-950/30 border border-red-500/20 p-4 rounded-xl">
                        <div className="flex items-center gap-3">
                            <AlertTriangle className="h-5 w-5 text-red-400" />
                            <p className="text-gray-300">
                                Important Notice: Superusers can only perform administrative actions and cannot participate in regular platform activities.
                            </p>
                        </div>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-8">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="space-y-6">
                                <h2 className="text-xl font-semibold text-gray-200">
                                    General Information
                                </h2>
                                <select
                                    name="title"
                                    value={formData.title}
                                    onChange={handleChange}
                                    className="w-full p-3 bg-gray-800/50 border border-gray-700 rounded-xl text-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-600 transition-all"
                                >
                                    <option value="">Select Title</option>
                                    <option value="mr">Mr.</option>
                                    <option value="ms">Ms.</option>
                                    <option value="dr">Dr.</option>
                                </select>
                                {["firstName", "lastName", "username", "referredby"].map((field) => (
                                    <input
                                        key={field}
                                        type="text"
                                        name={field}
                                        placeholder={field.charAt(0).toUpperCase() + field.slice(1).replace(/([A-Z])/g, ' $1').trim()}
                                        value={formData[field as keyof FormData]}
                                        onChange={handleChange}
                                        className="w-full p-3 bg-gray-800/50 border border-gray-700 rounded-xl text-gray-200 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-gray-600 transition-all"
                                    />
                                ))}
                            </div>

                            <div className="space-y-6">
                                <h2 className="text-xl font-semibold text-gray-200">
                                    Contact Details
                                </h2>
                                <select
                                    name="country"
                                    value={formData.country}
                                    onChange={handleChange}
                                    className="w-full p-3 bg-gray-800/50 border border-gray-700 rounded-xl text-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-600 transition-all"
                                >
                                    <option value="">Select Country</option>
                                    <option value="us">United States</option>
                                    <option value="uk">United Kingdom</option>
                                    <option value="ca">Canada</option>
                                </select>
                                {["phone", "email", "alternativeEmail"].map((field) => (
                                    <input
                                        key={field}
                                        type={field.includes('email') ? 'email' : 'text'}
                                        name={field}
                                        placeholder={field.charAt(0).toUpperCase() + field.slice(1).replace(/([A-Z])/g, ' $1').trim()}
                                        value={formData[field as keyof FormData] || ''}
                                        onChange={handleChange}
                                        className="w-full p-3 bg-gray-800/50 border border-gray-700 rounded-xl text-gray-200 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-gray-600 transition-all"
                                    />
                                ))}
                            </div>
                        </div>

                        <div className="space-y-6">
                            <div className="flex items-center gap-3 p-4 bg-gray-800/50 border border-gray-700 rounded-xl">
                                <input
                                    type="checkbox"
                                    id="terms"
                                    className="rounded border-gray-600 bg-gray-800/50 text-blue-500 focus:ring-blue-500/20 h-5 w-5"
                                />
                                <label htmlFor="terms" className="text-gray-300">
                                    I accept the Terms and Conditions of your site.
                                </label>
                            </div>
                            <button
                                type="submit"
                                className="w-full bg-blue-600 text-white py-3 px-6 rounded-xl font-medium hover:bg-blue-700 transition-all focus:ring-2 focus:ring-blue-500/50"
                            >
                                Register Badge
                            </button>
                        </div>
                    </form>
                </motion.div>
            </div>
        </div>
    );
}