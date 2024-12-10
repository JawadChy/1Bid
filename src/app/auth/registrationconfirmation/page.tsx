"use client";

import React from "react";
import { TextHoverEffect } from "@/components/ui/text-hover-effect";

const RegistrationConfirmation: React.FC = (): JSX.Element => {
    return (
        <div className="min-h-screen flex justify-center items-center">
            <div className="max-w-md w-full mx-auto rounded-lg p-4 md:p-8 shadow-input bg-white dark:bg-black border border-gray-200 dark:border-gray-800">
                <TextHoverEffect text="1Bid" />

                <div className="my-6 text-center">
                    <div className="mb-6">
                        <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
                            Registration Confirmed
                        </h2>
                        <p className="text-gray-600 dark:text-gray-400">
                            Your registration has been submitted successfully.
                        </p>
                    </div>

                    <div className="bg-gradient-to-r from-transparent via-neutral-300 dark:via-neutral-700 to-transparent my-6 h-[1px] w-full" />

                    <div className="bg-gray-50 dark:bg-zinc-900 p-4 rounded-lg">
                        <p className="text-gray-600 dark:text-gray-400">
                            Please wait for a super user to review and approve your registration.
                            You will be notified once your account has been activated.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default RegistrationConfirmation;