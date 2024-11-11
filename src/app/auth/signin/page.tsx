"use client";
import React, { useState } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { TextHoverEffect } from "@/components/ui/text-hover-effect";
// import { RainbowButton } from "@/components/ui/rainbow-button";
import { IconBrandGithub, IconBrandGoogle } from "@tabler/icons-react";
import { login } from "../actions";

export default function SignIn() {
  const [loading, setLoading] = useState(false);
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    console.log("Form submitted");

    try {
      const form = e.currentTarget;
      const formData = new FormData(form);
      
      await login(formData);
    } catch (error) {
      console.error('Sign in error:', error);
    } finally {
      setLoading(false);
    }

  };
  return (
    <div className="min-h-screen flex justify-center items-center">
      <div className="max-w-md w-full mx-auto rounded-lg p-4 md:p-8 shadow-input bg-white dark:bg-black border border-gray-200 dark:border-gray-800">
        <TextHoverEffect text="1Bid" />
        <form className="my-6" onSubmit={handleSubmit}>
          <LabelInputContainer className="mb-4">
            <Label htmlFor="email">Email Address</Label>
            <Input required name="email" id="email" placeholder="potus@gmail.com" type="email" />
          </LabelInputContainer>
          <LabelInputContainer className="mb-4">
            <Label htmlFor="password">Password</Label>
            <Input required name="password" id="password" placeholder="••••••••" type="password" />
          </LabelInputContainer>

          <button
            className="bg-gradient-to-br relative group/btn from-black dark:from-zinc-900 dark:to-zinc-900 to-neutral-600 block dark:bg-zinc-800 w-full text-white rounded-md h-9 font-medium shadow-[0px_1px_0px_0px_#ffffff40_inset,0px_-1px_0px_0px_#ffffff40_inset] dark:shadow-[0px_1px_0px_0px_var(--zinc-800)_inset,0px_-1px_0px_0px_var(--zinc-800)_inset]"
            type="submit"
            disabled={loading}
          >
            {loading ? 'Signing in...' : 'Sign in →'}
            <BottomGradient />
          </button>

          <div className="bg-gradient-to-r from-transparent via-neutral-300 dark:via-neutral-700 to-transparent my-6 h-[1px] w-full" />

          <div className="flex flex-col space-y-4 ">
            <button
              className=" relative group/btn flex space-x-2 items-center justify-center px-4 w-full text-black rounded-md h-9 font-medium shadow-input bg-gray-50 dark:bg-zinc-900 dark:shadow-[0px_0px_1px_1px_var(--neutral-800)]"
              type="submit"
            >
              <IconBrandGithub className="h-4 w-4 text-neutral-800 dark:text-neutral-300" />
              <span className="text-neutral-700 dark:text-neutral-300 text-lg">
                Continue With GitHub
              </span>
              <BottomGradient />
            </button>
            <button
              className=" relative group/btn flex space-x-2 items-center justify-center px-4 w-full text-black rounded-md h-9 font-medium shadow-input bg-gray-50 dark:bg-zinc-900 dark:shadow-[0px_0px_1px_1px_var(--neutral-800)]"
              type="submit"
            >
              <IconBrandGoogle className="h-4 w-4 text-neutral-800 dark:text-neutral-300" />
              <span className="text-neutral-700 dark:text-neutral-300 text-lg">
                Continue With Google
              </span>
              <BottomGradient />
            </button>
          </div>
        </form>
        <p className="text-center text-gray-600 dark:text-gray-400">
          {`Don't have an account?`}{" "}
          <Link
            href="/auth/signup"
            className="text-blue-500 hover:text-blue-600"
          >
            Sign up
          </Link>
        </p>
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
