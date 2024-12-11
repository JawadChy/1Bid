"use client";

import React, { useState, useEffect } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { TextHoverEffect } from "@/components/ui/text-hover-effect";
import { ArrowLeft, Lock, Check } from "lucide-react";
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { useRouter, useSearchParams } from 'next/navigation';

export default function ResetPassword() {
    const [formData, setFormData] = useState({
        newPassword: '',
        confirmPassword: '',
    });
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);
    const [isVerifying, setIsVerifying] = useState(true);
    const router = useRouter();
    const supabase = createClientComponentClient();

    // Verify session on component mount
    useEffect(() => {
        const verifySession = async () => {
            try {
                // Verify we have a session
                const { data: { session } } = await supabase.auth.getSession();
                if (!session) {
                    throw new Error('No session found');
                }
                setIsVerifying(false);
            } catch (error) {
                console.error('Session verification error:', error);
                setError('Invalid or expired reset link. Please request a new password reset.');
                // Redirect after showing error
                setTimeout(() => router.push('/auth/forgotpassword'), 3000);
            }
        };

        verifySession();
    }, [router, supabase.auth]);

    useEffect(() => {
        if (isSuccess) {
            const timer = setTimeout(() => {
                router.push('/auth/login');
            }, 3000);

            return () => clearTimeout(timer);
        }
    }, [isSuccess, router]);

    const validateForm = () => {
        if (!formData.newPassword || !formData.confirmPassword) {
            setError('All fields are required');
            return false;
        }
        if (formData.newPassword !== formData.confirmPassword) {
            setError('Passwords do not match');
            return false;
        }
        if (formData.newPassword.length < 6) {
            setError('Password must be at least 6 characters long');
            return false;
        }
        return true;
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setError(null);

        if (!validateForm()) return;

        try {
            setIsLoading(true);

            // Verify session before updating password
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) {
                throw new Error('No active session found');
            }

            const { error } = await supabase.auth.updateUser({
                password: formData.newPassword
            });

            if (error) throw error;

            setIsSuccess(true);
        } catch (error) {
            console.error('Error resetting password:', error);
            setError(error instanceof Error ? error.message : 'An error occurred while resetting password');
        } finally {
            setIsLoading(false);
        }
    };

    if (isVerifying) {
        return (
            <div className="min-h-screen flex justify-center items-center">
                <div className="text-center">
                    <p className="text-gray-600 dark:text-gray-400">Verifying reset link...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex justify-center items-center relative">
            {/* Back to Login Button */}
            <Link
                href="/auth/login"
                className="absolute top-4 left-4 flex items-center space-x-2 text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100 transition-colors"
            >
                <ArrowLeft className="h-4 w-4" />
                <span>Back to Login</span>
            </Link>

            <div className="max-w-md w-full mx-auto rounded-lg p-4 md:p-8 shadow-input bg-white dark:bg-black border border-gray-200 dark:border-gray-800">
                <TextHoverEffect text="1Bid" />

                {isSuccess ? (
                    <div className="my-6 text-center space-y-4">
                        <div className="flex justify-center">
                            <div className="rounded-full bg-green-500/20 p-3">
                                <Check className="h-8 w-8 text-green-400" />
                            </div>
                        </div>
                        <h2 className="text-2xl font-bold">Password Reset Complete!</h2>
                        <p className="text-gray-600 dark:text-gray-400">
                            Your password has been successfully updated.
                        </p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                            Redirecting to login page in 3 seconds...
                        </p>
                    </div>
                ) : (
                    <>
                        <div className="my-6 text-center">
                            <h1 className="text-2xl font-bold mb-2">Reset Password</h1>
                            <p className="text-gray-600 dark:text-gray-400">
                                Please enter your new password
                            </p>
                        </div>

                        {error && (
                            <div className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
                                {error}
                            </div>
                        )}

                        <form onSubmit={handleSubmit}>
                            <LabelInputContainer className="mb-4">
                                <Label htmlFor="newPassword">New Password</Label>
                                <div className="relative">
                                    <Input
                                        required
                                        id="newPassword"
                                        type="password"
                                        placeholder="••••••••"
                                        value={formData.newPassword}
                                        onChange={(e) => setFormData({ ...formData, newPassword: e.target.value })}
                                        className="pl-10"
                                    />
                                    <Lock className="absolute left-3 top-2.5 h-4 w-4 text-gray-500" />
                                </div>
                            </LabelInputContainer>

                            <LabelInputContainer className="mb-6">
                                <Label htmlFor="confirmPassword">Confirm New Password</Label>
                                <div className="relative">
                                    <Input
                                        required
                                        id="confirmPassword"
                                        type="password"
                                        placeholder="••••••••"
                                        value={formData.confirmPassword}
                                        onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                                        className="pl-10"
                                    />
                                    <Lock className="absolute left-3 top-2.5 h-4 w-4 text-gray-500" />
                                </div>
                            </LabelInputContainer>

                            <button
                                className="bg-gradient-to-br relative group/btn from-black dark:from-zinc-900 dark:to-zinc-900 to-neutral-600 block dark:bg-zinc-800 w-full text-white rounded-md h-9 font-medium shadow-[0px_1px_0px_0px_#ffffff40_inset,0px_-1px_0px_0px_#ffffff40_inset] dark:shadow-[0px_1px_0px_0px_var(--zinc-800)_inset,0px_-1px_0px_0px_var(--zinc-800)_inset]"
                                type="submit"
                                disabled={isLoading}
                            >
                                {isLoading ? "Resetting Password..." : "Reset Password"}
                                <BottomGradient />
                            </button>
                        </form>
                    </>
                )}
            </div>
        </div>
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