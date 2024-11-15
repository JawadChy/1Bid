"use client";
import { BackgroundGradient } from "@/components/ui/background-gradient";
import { RainbowButton } from "@/components/ui/rainbow-button";
import { Timer } from "lucide-react";
import Image from "next/image";
import { motion } from "framer-motion";
import { Navbar } from "@/components/navbar";

export default function SeamasterPage() {
  // In a real app, these would come from an API or database
  const productData = {
    currentBid: 3500,
    minBidIncrement: 100,
    totalBids: 23,
    endTime: "2024-11-12T15:00:00",
    description: `This rare 1960s Omega Seamaster is a testament to timeless design and Swiss craftsmanship. 
    Features include:
    - Original box and papers
    - Recently serviced automatic movement
    - 34mm stainless steel case
    - Original crystal and dial
    - Water resistance tested
    - Serial numbers matching
    - Complete service history`,
  };

  // Calculate time remaining (in a real app, this would be dynamic)
  const timeRemaining = {
    days: 2,
    hours: 15,
    minutes: 30,
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-100 dark:from-zinc-900 dark:to-zinc-800 py-12">
        <Navbar />
      <div className="max-w-7xl mx-auto px-4 mt-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="grid grid-cols-1 md:grid-cols-2 gap-8"
        >
          {/* Left Column - Image */}
          <BackgroundGradient className="rounded-3xl p-2 bg-white dark:bg-zinc-900 h-[710px]">

            <div className="relative w-full h-[700px]">
              <Image
                src="https://i.ebayimg.com/images/g/rJ4AAOSw3FNj-Qtj/s-l400.jpg"
                alt="Vintage Omega Seamaster"
                fill
                className="object-contain rounded-3xl"
              />
            </div>
          </BackgroundGradient>

          {/* Right Column - Product Info */}
          <div className="space-y-6">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 dark:text-white">
                Rare 1960s Omega Seamaster
              </h1>
              <p className="mt-2 text-xl text-gray-500 dark:text-gray-400">
                Vintage Luxury Timepiece
              </p>
            </div>

            {/* Current Bid Info */}
            <div className="rounded-3xl bg-white/50 dark:bg-zinc-800/50 backdrop-blur-md">
              <div className="p-6">
                <div className="flex justify-between items-center mb-4">
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Current Bid</p>
                    <p className="text-3xl font-bold text-gray-900 dark:text-white">
                      ${productData.currentBid.toLocaleString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-500 dark:text-gray-400">Total Bids</p>
                    <p className="text-xl font-semibold text-gray-900 dark:text-white">
                      {productData.totalBids}
                    </p>
                  </div>
                </div>

                {/* Time Remaining */}
                <div className="flex items-center gap-2 mb-6 text-gray-500 dark:text-gray-400">
                  <Timer className="w-4 h-4" />
                  <span>
                    {timeRemaining.days}d {timeRemaining.hours}h {timeRemaining.minutes}m remaining
                  </span>
                </div>

                {/* Bid Input and Button */}
                <div className="space-y-4">
                  <div className="flex gap-4">
                    <div className="flex-1">
                      <label className="text-sm text-gray-500 dark:text-gray-400 mb-1 block">
                        Your Bid (Minimum +${productData.minBidIncrement})
                      </label>
                      <input
                        type="number"
                        min={productData.currentBid + productData.minBidIncrement}
                        step={productData.minBidIncrement}
                        defaultValue={productData.currentBid + productData.minBidIncrement}
                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-3xl
                                 bg-white dark:bg-zinc-800 text-gray-900 dark:text-white"
                      />
                    </div>
                  </div>
                  <RainbowButton className="w-full py-6">
                    Place Bid
                  </RainbowButton>
                </div>
              </div>
            </div>

            {/* Product Description */}
            <div className="prose dark:prose-invert">
              <h2 className="text-2xl font-semibold mb-4">Description</h2>
              <p className="whitespace-pre-line text-gray-600 dark:text-gray-300">
                {productData.description}
              </p>
            </div>
          </div>
        </motion.div>

        {/* Additional Images Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-4"
        >
          <BackgroundGradient className="rounded-3xl p-2 bg-white dark:bg-zinc-900">
            <div className="relative w-full h-48">
              <Image
                src="https://i.ebayimg.com/images/g/zcQAAOSwkMJj~hzS/s-l1200.jpg"
                alt="Omega Seamaster Detail 1"
                fill
                className="object-contain rounded-3xl"
              />
            </div>
          </BackgroundGradient>
          <BackgroundGradient className="rounded-3xl p-2 bg-white dark:bg-zinc-900">
            <div className="relative w-full h-48">
              <Image
                src="https://i.ebayimg.com/images/g/KxwAAOSwarVkVSeV/s-l1200.jpg"
                alt="Omega Seamaster Detail 2"
                fill
                className="object-contain rounded-3xl"
              />
            </div>
          </BackgroundGradient>
          <BackgroundGradient className="rounded-3xl p-2 bg-white dark:bg-zinc-900">
            <div className="relative w-full h-48">
              <Image
                src="https://i.ebayimg.com/images/g/rJ4AAOSw3FNj-Qtj/s-l400.jpg"
                alt="Omega Seamaster Detail 3"
                fill
                className="object-contain rounded-3xl"
              />
            </div>
          </BackgroundGradient>
        </motion.div>
      </div>
    </div>
  );
}