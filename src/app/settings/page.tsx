'use client'
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LogOut } from 'lucide-react';
import Link from 'next/link';

export default function SettingsPage() {
    const [activeTab, setActiveTab] = useState('notifications');

    // Content components for each tab
    const NotificationsContent = () => (
        <Card>
            <CardHeader>
                <CardTitle>Notifications</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <div className="space-y-1">
                            <h4 className="font-medium">New Bid Notifications</h4>
                            <p className="text-sm text-gray-500">Get notified when someone bids on your item</p>
                        </div>
                        <Switch />
                    </div>

                    <div className="flex items-center justify-between">
                        <div className="space-y-1">
                            <h4 className="font-medium">Rating Updates</h4>
                            <p className="text-sm text-gray-500">Receive notifications about new ratings</p>
                        </div>
                        <Switch />
                    </div>

                    <div className="flex items-center justify-between">
                        <div className="space-y-1">
                            <h4 className="font-medium">Auction Ending Soon</h4>
                            <p className="text-sm text-gray-500">Get reminded when your auctions are ending</p>
                        </div>
                        <Switch />
                    </div>

                    <div className="flex items-center justify-between">
                        <div className="space-y-1">
                            <h4 className="font-medium">Outbid Alerts</h4>
                            <p className="text-sm text-gray-500">Know when someone outbids you</p>
                        </div>
                        <Switch />
                    </div>
                </div>
            </CardContent>
        </Card>
    );

    const AccountSettingsContent = () => (
        <Card>
            <CardHeader>
                <CardTitle>Account Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
                {/* Email Change Section */}
                <div className="space-y-4 pb-6 border-b">
                    <h4 className="font-medium">Change Email Address</h4>
                    <div className="space-y-4">
                        <div>
                            <label className="text-sm text-gray-500">Current Email</label>
                            <input
                                type="email"
                                placeholder="current@email.com"
                                disabled
                                className="w-full mt-1 px-3 py-2 bg-gray-100 border border-gray-300 rounded-md"
                            />
                        </div>
                        <div>
                            <label className="text-sm text-gray-500">New Email</label>
                            <input
                                type="email"
                                placeholder="Enter new email"
                                className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md"
                            />
                        </div>
                        <Button className="w-full">
                            Update Email
                        </Button>
                    </div>
                </div>

                {/* Password Reset Section */}
                <div className="space-y-4 pb-6 border-b">
                    <h4 className="font-medium">Reset Password</h4>
                    <div className="space-y-4">
                        <div>
                            <label className="text-sm text-gray-500">Current Password</label>
                            <input
                                type="password"
                                placeholder="Enter current password"
                                className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md"
                            />
                        </div>
                        <div>
                            <label className="text-sm text-gray-500">New Password</label>
                            <input
                                type="password"
                                placeholder="Enter new password"
                                className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md"
                            />
                        </div>
                        <div>
                            <label className="text-sm text-gray-500">Confirm New Password</label>
                            <input
                                type="password"
                                placeholder="Confirm new password"
                                className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md"
                            />
                        </div>
                        <Button className="w-full">
                            Update Password
                        </Button>
                    </div>
                </div>

                {/* Existing Account Settings */}
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <div className="space-y-1">
                            <h4 className="font-medium">Email Notifications</h4>
                            <p className="text-sm text-gray-500">Receive email updates about your account</p>
                        </div>
                        <Switch />
                    </div>

                    <div className="flex items-center justify-between">
                        <div className="space-y-1">
                            <h4 className="font-medium">Two-Factor Authentication</h4>
                            <p className="text-sm text-gray-500">Add an extra layer of security</p>
                        </div>
                        <Switch />
                    </div>
                </div>
            </CardContent>
        </Card>
    );

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
                        <Link href="/superapplication">
                            Apply to be a Super User
                        </Link>
                    </Button>
                </div>
            </CardContent>
        </Card>
    );

    // Rendering activeTab content
    const renderContent = () => {
        switch (activeTab) {
            case 'notifications':
                return <NotificationsContent />;
            case 'account':
                return <AccountSettingsContent />;
            case 'super-user':
                return <SuperUserContent />;
            default:
                return <NotificationsContent />;
        }
    };

    return (
        <div className="max-w-4xl mx-auto p-6 space-y-8">
            <h1 className="text-3xl font-bold">Settings</h1>

            <div className="grid grid-cols-4 gap-8">
                {/* Sidebar Navigation */}
                <div className="col-span-1 space-y-2">
                    <Button
                        variant={activeTab === 'notifications' ? 'default' : 'ghost'}
                        className="w-full justify-start"
                        onClick={() => setActiveTab('notifications')}
                    >
                        Notifications
                    </Button>
                    <Button
                        variant={activeTab === 'account' ? 'default' : 'ghost'}
                        className="w-full justify-start"
                        onClick={() => setActiveTab('account')}
                    >
                        Account settings
                    </Button>
                    <Button
                        variant={activeTab === 'super-user' ? 'default' : 'ghost'}
                        className="w-full justify-start"
                        onClick={() => setActiveTab('super-user')}
                    >
                        SuperUser Application
                    </Button>
                </div>

                {/* Main Content */}
                <div className="col-span-3 space-y-8">
                    {renderContent()}

                    {/* Logout Section - Always visible */}
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