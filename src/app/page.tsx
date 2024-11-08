"use client";
import { motion } from "framer-motion";
import { AuroraBackground } from "../components/ui/aurora-background";
import { FlipWords } from "@/components/ui/flip-words";
import { ThemeToggle } from "../components/ui/theme-toggle";
import { Navbar } from "@/components/navbar";

export default function Home() {
  {/* someone think of more words pls :) -jawad*/}
  const words = ["bid", "listing"];

  return (
    <>
      <Navbar />
      <div className="min-h-screen">
        <AuroraBackground className="mt-24">
          <motion.div
            initial={{ opacity: 0.0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{
              delay: 0.3,
              duration: 0.8,
              ease: "easeInOut",
            }}
            className="relative flex flex-col gap-4 items-center justify-center px-4"
          >
            <h1 className="text-center text-4xl md:text-7xl font-bold text-transparent bg-clip-text bg-gradient-to-b from-slate-900 to-slate-900/30 dark:from-white dark:to-white/30 py-6">
              Connecting the world
            </h1>
            <div className="text-4xl text-transparent bg-clip-text bg-gradient-to-b from-slate-900/80 to-slate-900/20 dark:from-white/80 dark:to-white/20 py-4 flex items-center gap-3">
              <span>One</span>
              <span className="font-bold inline-block min-w-[136px] text-center ">
                <FlipWords words={words} hasGradient={true}/>
              </span>
              <span className="[word-spacing:10px]" >at   a  time.</span>
            </div>
          </motion.div>
        </AuroraBackground>
      </div>
    </>
  );
}