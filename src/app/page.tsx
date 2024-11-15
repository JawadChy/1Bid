"use client";
import { motion } from "framer-motion";
import { AuroraBackground } from "../components/ui/aurora-background";
import { FlipWords } from "@/components/ui/flip-words";
import { Navbar } from "@/components/navbar";
import { BackgroundGradient } from "@/components/ui/background-gradient";
import Image from "next/image";

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
        <div className="flex flex-wrap justify-center gap-8 px-4 py-12">
          {/* Component 1 */}
          <BackgroundGradient className="rounded-[22px] max-w-sm h-[550px] p-4 sm:p-10 bg-white dark:bg-zinc-900">
            <div className="relative w-full h-64 mb-16">
              <Image
                src="https://i.ebayimg.com/images/g/rJ4AAOSw3FNj-Qtj/s-l400.jpg"
                alt="Vintage Watch"
                fill
                className="object-contain"
              />
            </div>
            <p className="text-base sm:text-xl text-black mt-4 mb-2 dark:text-neutral-200">
              Rare 1960s Omega Seamaster
            </p>
            <p className="text-sm text-neutral-600 dark:text-neutral-400">
              Pristine condition vintage Omega Seamaster with original box and papers. 
              Automatic movement recently serviced. Current bid ends in 2 days.
            </p>
            <button className="rounded-full pl-4 pr-1 py-1 text-white flex items-center space-x-1 bg-black mt-4 text-xs font-bold dark:bg-zinc-800">
              <span>Bid now </span>
              <span className="bg-zinc-700 rounded-full text-[0.6rem] px-2 py-0 text-white">
                $3,500
              </span>
            </button>
          </BackgroundGradient>

          {/* Component 2 */}
          <BackgroundGradient className="rounded-[22px] max-w-sm h-[550px] p-4 sm:p-10 bg-white dark:bg-zinc-900">
            <div className="relative w-full h-64 mb-16">
              <Image
                src="https://i.ebayimg.com/images/g/IIQAAOSw7QRkvt1K/s-l400.jpg"
                alt="Classic Car"
                fill
                className="object-cover rounded-2xl"
              />
            </div>
            <p className="text-base sm:text-xl text-black mt-4 mb-2 dark:text-neutral-200">
              1967 Ford Mustang Fastback
            </p>
            <p className="text-sm text-neutral-600 dark:text-neutral-400">
              Fully restored classic Mustang in Highland Green. Numbers matching,
              documented history. Reserve not met. Auction ends in 5 days.
            </p>
            <button className="rounded-full pl-4 pr-1 py-1 text-white flex items-center space-x-1 bg-black mt-4 text-xs font-bold dark:bg-zinc-800">
              <span>Bid now </span>
              <span className="bg-zinc-700 rounded-full text-[0.6rem] px-2 py-0 text-white">
                $75,000
              </span>
            </button>
          </BackgroundGradient>

          {/* Component 3 */}
          <BackgroundGradient className="rounded-[22px] max-w-sm h-[550px] p-4 sm:p-10 bg-white dark:bg-zinc-900">
            <div className="relative w-full h-64 mb-16">
              <Image
                src="https://i.ebayimg.com/images/g/e~wAAOSwCzZkJvks/s-l400.png"
                alt="Contemporary Art"
                fill
                className="object-contain"
              />
            </div>
            <p className="text-base sm:text-xl text-black mt-4 mb-2 dark:text-neutral-200">
              Original Banksy Print
            </p>
            <p className="text-sm text-neutral-600 dark:text-neutral-400">
              Authenticated Banksy print from 2008 limited edition run. 
              Includes certificate of authenticity. Live auction starts in 3 days.
            </p>
            <button className="rounded-full pl-4 pr-1 py-1 text-white flex items-center space-x-1 bg-black mt-4 text-xs font-bold dark:bg-zinc-800">
              <span>Bid now </span>
              <span className="bg-zinc-700 rounded-full text-[0.6rem] px-2 py-0 text-white">
                $12,000
              </span>
            </button>
          </BackgroundGradient>

          {/* Component 4 */}
          <BackgroundGradient className="rounded-[22px] max-w-sm h-[550px] p-4 sm:p-10 bg-white dark:bg-zinc-900">
            <div className="relative w-full h-64 mb-16">
              <Image
                src="https://i.ebayimg.com/images/g/oigAAOSw3yNkrsq9/s-l400.jpg"
                alt="Luxury Handbag"
                fill
                className="object-contain"
              />
            </div>
            <p className="text-base sm:text-xl text-black mt-4 mb-2 dark:text-neutral-200">
              Chanel Classic Flap Bag
            </p>
            <p className="text-sm text-neutral-600 dark:text-neutral-400">
              Timeless Chanel handbag in caviar leather with gold-tone hardware.
              Comes with dust bag and authenticity card. Auction ends in 4 days.
            </p>
            <button className="rounded-full pl-4 pr-1 py-1 text-white flex items-center space-x-1 bg-black mt-4 text-xs font-bold dark:bg-zinc-800">
              <span>Bid now </span>
              <span className="bg-zinc-700 rounded-full text-[0.6rem] px-2 py-0 text-white">
                $6,500
              </span>
            </button>
          </BackgroundGradient>

          {/* Component 5 */}
          <BackgroundGradient className="rounded-[22px] max-w-sm h-[550px] p-4 sm:p-10 bg-white dark:bg-zinc-900">
            <div className="relative w-full h-64 mb-16">
              <Image
                src="https://i.ebayimg.com/images/g/z7kAAOSw6qhelIO-/s-l1600.webp"
                alt="Sports Memorabilia"
                fill
                className="object-contain"
              />
            </div>
            <p className="text-base sm:text-xl text-black mt-4 mb-2 dark:text-neutral-200">
              Signed Michael Jordan Jersey
            </p>
            <p className="text-sm text-neutral-600 dark:text-neutral-400">
              Authentic Michael Jordan jersey from his 1997 championship season, 
              signed and framed. Includes COA. Current bid ends in 6 days.
            </p>
            <button className="rounded-full pl-4 pr-1 py-1 text-white flex items-center space-x-1 bg-black mt-4 text-xs font-bold dark:bg-zinc-800">
              <span>Bid now </span>
              <span className="bg-zinc-700 rounded-full text-[0.6rem] px-2 py-0 text-white">
                $15,000
              </span>
            </button>
          </BackgroundGradient>
        </div>
      </div>
    </>
  );
}