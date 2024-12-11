"use client";
import React from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { signup } from "../actions";
import { ArrowLeft } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

// import {
//   IconBrandGithub,
//   IconBrandGoogle,
// } from "@tabler/icons-react";
import { TextHoverEffect } from "@/components/ui/text-hover-effect";

export default function SignUp() {
  const [loading, setLoading] = useState(false);
  const [showVerification, setShowVerification] = useState(false);
  const [verificationAttempts, setVerificationAttempts] = useState(0);
  const [arithmeticAnswer, setArithmeticAnswer] = useState("");
  const [currentQuestion, setCurrentQuestion] = useState({ num1: 0, num2: 0 });
  const router = useRouter();

  // Generate a random arithmetic question
  const generateQuestion = () => {
    const num1 = Math.floor(Math.random() * 20);
    const num2 = Math.floor(Math.random() * 20);
    setCurrentQuestion({ num1, num2 });
    setArithmeticAnswer("");
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    generateQuestion();
    setShowVerification(true);
  };

  const handleVerificationSubmit = async () => {
    const correctAnswer = currentQuestion.num1 + currentQuestion.num2;

    if (parseInt(arithmeticAnswer) === correctAnswer) {
      setShowVerification(false);
      setLoading(true);

      try {
        const form = document.querySelector('form');
        if (form) {
          const formData = new FormData(form);
          await signup(formData);
          router.push("/auth/registrationconfirmation");
        }
      } catch (error) {
        console.error('Form submission error:', error);
      } finally {
        setLoading(false);
      }
    } else {
      setVerificationAttempts(prev => prev + 1);
      if (verificationAttempts + 1 >= 3) {
        setShowVerification(false);
        setVerificationAttempts(0);
        window.location.reload(); //Refreshes the page to clear details
      } else {
        generateQuestion(); // Generate a new question for the next attempt
        setArithmeticAnswer("");
      }
    }
  };

  {/* 

    NOTE:
    form was too vertically big, changed heights of buttons to be h-9 from h-10 and made my-6 from my-8.
    same changes made in signin as well. 
    maybe we should have address be in a separate place. like have user "complete profile" after account
    creation? we should talk about this.

    */}
  return (
    <div className="min-h-screen flex justify-center items-center relative">
      {/* Back to Home Button */}
      <Link
        href="/"
        className="absolute top-4 left-4 flex items-center space-x-2 text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100 transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        <span>Back to Home Page</span>
      </Link>

      <div className="max-w-md w-full mx-auto rounded-lg p-4 md:p-8 shadow-input bg-white dark:bg-black border border-gray-200 dark:border-gray-800">
        <TextHoverEffect text="1Bid" />
        <form className="my-6" onSubmit={handleSubmit}>
          <div className="flex flex-col md:flex-row space-y-2 md:space-y-0 md:space-x-2 mb-4">
            <LabelInputContainer>
              <Label htmlFor="firstname">First name</Label>
              <Input required name="firstname" id="firstname" placeholder="Barrack" type="text" />
            </LabelInputContainer>
            <LabelInputContainer>
              <Label htmlFor="lastname">Last name</Label>
              <Input required name="lastname" id="lastname" placeholder="Obama" type="text" />
            </LabelInputContainer>
          </div>
          <LabelInputContainer className="mb-4">
            <Label htmlFor="email">Email Address</Label>
            <Input required name="email" id="email" placeholder="potus@gmail.com" type="email" />
          </LabelInputContainer>

          <LabelInputContainer className="mb-4">
            <Label htmlFor="password">Password</Label>
            <Input required name="password" id="password" placeholder="••••••••" type="password" />
          </LabelInputContainer>
          <LabelInputContainer className="mb-8">
            <Label htmlFor="confirmpassword">Confirm Password</Label>
            <Input
              required
              name="confirmpassword"
              id="confirmpassword"
              placeholder="••••••••"
              type="password"
            />
          </LabelInputContainer>

          <button
            className="bg-gradient-to-br relative group/btn from-black dark:from-zinc-900 dark:to-zinc-900 to-neutral-600 block dark:bg-zinc-800 w-full text-white rounded-md h-9 font-medium shadow-[0px_1px_0px_0px_#ffffff40_inset,0px_-1px_0px_0px_#ffffff40_inset] dark:shadow-[0px_1px_0px_0px_var(--zinc-800)_inset,0px_-1px_0px_0px_var(--zinc-800)_inset]"
            type="submit"
            disabled={loading}
          >
            {loading ? 'Signing up...' : 'Sign up →'}
            <BottomGradient />
          </button>

          <div className="bg-gradient-to-r from-transparent via-neutral-300 dark:via-neutral-700 to-transparent my-6 h-[1px] w-full" />
          {/* TODO: fix oauth issue later */}
          {/* <div className="flex flex-col space-y-4 ">
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
        </div> */}
        </form>

        <Dialog open={showVerification} onOpenChange={setShowVerification}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Verification Required</DialogTitle>
            </DialogHeader>
            <div className="p-4">
              <p className="mb-4">Please solve this simple math problem:</p>
              <p className="text-lg font-semibold mb-4">
                What is {currentQuestion.num1} + {currentQuestion.num2}?
              </p>
              <div className="flex flex-col space-y-4">
                <Input
                  type="number"
                  value={arithmeticAnswer}
                  onChange={(e) => setArithmeticAnswer(e.target.value)}
                  placeholder="Enter your answer"
                />
                <button
                  onClick={handleVerificationSubmit}
                  className="bg-gradient-to-br relative group/btn from-black dark:from-zinc-900 dark:to-zinc-900 to-neutral-600 block dark:bg-zinc-800 w-full text-white rounded-md h-9 font-medium"
                >
                  Submit Answer
                </button>
                {verificationAttempts > 0 && (
                  <p className="text-red-500">
                    Incorrect answer. Attempts remaining: {3 - verificationAttempts}
                  </p>
                )}
              </div>
            </div>
          </DialogContent>
        </Dialog>


        <p className="text-center text-gray-600 dark:text-gray-400">
          Have an account?{" "}
          <Link href="/auth/signin" className="text-blue-500 hover:text-blue-600">
            Sign in
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
