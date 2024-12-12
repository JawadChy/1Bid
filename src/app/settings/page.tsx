'use client'
import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LogOut, ArrowLeft } from 'lucide-react';
import { useAuth } from '@/app/auth/auth-context';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function SettingsPage() {
    const { user, loading } = useAuth();
    const router = useRouter();
    const [activeTab, setActiveTab] = useState('super-user');

    // Check auth state and redirect if not logged in
    useEffect(() => {
        if (!loading && !user) {
            router.push('/auth/signin');
        }
    }, [user, loading, router]);

    // Keep only the SuperUser content
    const SuperUserContent = () => (
        <Card>
            <CardHeader>
                <CardTitle>Super User Application</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    <p className="text-sm text-gray-500">
                        Apply to become a Super User to access additional administrative features
                    </p>
                    <Button className="w-full">
                        <Link
                            href="/superapplication"
                            className="w-full inline-block"
                        >
                            Apply to be a Super User
                        </Link>
                    </Button>
                </div>
            </CardContent>
        </Card>
    );

    return (
        <div className="max-w-4xl mx-auto p-6 space-y-8">
            <Link
                href="/"
                className="absolute top-4 left-4 flex items-center space-x-2 text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100 transition-colors"
            >
                <ArrowLeft className="h-4 w-4" />
                <span>Back to Home Page</span>
            </Link>

            <h1 className="text-3xl font-bold">Settings</h1>
            <div className="grid grid-cols-4 gap-8">
                {/* Sidebar Navigation - Only Super User tab */}
                <div className="col-span-1 space-y-2">
                    <Button
                        variant="default"
                        className="w-full justify-start"
                        onClick={() => setActiveTab('super-user')}
                    >
                        SuperUser Application
                    </Button>
                </div>

                {/* Main Content */}
                <div className="col-span-3 space-y-8">
                    <SuperUserContent />

                    {/* Logout Section - Kept as is */}
                    <Card>
                        <CardContent className="pt-6">
                            <Button
                                variant="destructive"
                                className="w-full"
                            >
                                <Link href="/" className="flex items-center justify-center w-full">
                                    Logout <LogOut className="ml-2 h-4 w-4" />
                                </Link>
                            </Button>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
