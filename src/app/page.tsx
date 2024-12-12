"use client";
import { motion } from "framer-motion";
import { AuroraBackground } from "../components/ui/aurora-background";
import { FlipWords } from "@/components/ui/flip-words";
import { Navbar } from "@/components/navbar";
import { TopAuctionCarousel, TopBuyNowCarousel } from "@/components/item-carousels";
import Link from 'next/link' // Remove once we have a proper router

export default function Home() {
  {/* someone think of more words pls :) -jawad*/ }
  const words = ["bid", "listing"];

  // mock listings

  const mockItems = [
    // TODO: top viewed items on carousel
    {
      id: 1,
      imageUrl: "https://i.ebayimg.com/images/g/rJ4AAOSw3FNj-Qtj/s-l400.jpg",
      title: "Rare 1960s Omega Seamaster",
      price: 3500,
      bids: 12,
      timeLeft: "2 days left",
      views: 1500,
      isAuction: true
    },
    {
      id: 2,
      imageUrl: "https://i.ebayimg.com/images/g/IIQAAOSw7QRkvt1K/s-l400.jpg",
      title: "1967 Ford Mustang Fastback",
      price: 75000,
      bids: 25,
      timeLeft: "5 days left",
      views: 2500,
      isAuction: true
    },
    {
      id: 3,
      imageUrl: "https://i.ebayimg.com/images/g/e~wAAOSwCzZkJvks/s-l400.png",
      title: "Original Banksy Print",
      price: 12000,
      bids: 8,
      timeLeft: "3 days left",
      views: 1800,
      isAuction: true
    },
    {
      id: 4,
      imageUrl: "https://i.ebayimg.com/images/g/oigAAOSw3yNkrsq9/s-l400.jpg",
      title: "Chanel Classic Flap Bag",
      price: 6500,
      bids: 15,
      timeLeft: "4 days left",
      views: 2200,
      isAuction: true
    },
    {
      id: 5,
      imageUrl: "https://i.ebayimg.com/images/g/z7kAAOSw6qhelIO-/s-l1600.webp",
      title: "Signed Michael Jordan Jersey",
      price: 15000,
      bids: 20,
      timeLeft: "6 days left",
      views: 3000,
      isAuction: true
    }
  ];

  return (
    <>
      <Navbar />
      <div className="min-h-screen">
        <AuroraBackground className="mt-24">
          <motion.div
            initial={{ opacity: 0.0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{
              delay: 0.1,
              duration: 0.3,
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
                <FlipWords words={words} hasGradient={true} />
              </span>
              <span className="[word-spacing:10px]" >at   a  time.</span>
            </div>
          </motion.div>
        </AuroraBackground>
        <div className="space-y-16 py-12">
          <TopAuctionCarousel items={mockItems} />
          <TopBuyNowCarousel items={mockItems} />
        </div>
      </div>

      {/* Ignore this, this is for Tim
      <div className="flex items-center justify-center">
        <button className="px-4 py-2 bg-blue-500 text-white rounded">
          <Link href="./settings">Go to settings</Link>
        </button>
      </div>
      */}
    </>
  );
}