"use client";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { AuroraBackground } from "../components/ui/aurora-background";
import { FlipWords } from "@/components/ui/flip-words";
import { Navbar } from "@/components/navbar";
import { TopAuctionCarousel, TopBuyNowCarousel } from "@/components/item-carousels";
import Link from 'next/link'; // Remove once we have a proper router

export default function Home() {
  // State to hold data for bids and buy-now items
  const [buyNowItems, setBuyNowItems] = useState<any[]>([]);
  const [auctionItems, setAuctionItems] = useState<any[]>([]);

  // Words for flip effect
  const words = ["bid", "listing"];

  // Fetch most viewed listings from the API
  useEffect(() => {
    const fetchMostViewedData = async () => {
      try {
        console.log('Making GET request to /api/view/mostTotalViewed...');
        
        // Perform the HTTP GET request
        const response = await fetch('/api/view/mostTotalViewed');
        
        // Check if the response was successful
        if (!response.ok) {
          throw new Error(`Request failed with status: ${response.status}`);
        }

        // Parse the JSON response
        const data = await response.json();
        console.log('Fetched data:', data);

        // Transform the "buys" data into buyNowItems format
        const buyNow = data.buys.map(item => ({
          id: item.listing_id || null,
          imageUrl: item.storage_path || null,
          title: item.title || null,
          price: item.asking_price || null,
          views: item.viewers || null,
          isAuction: false, // Buy Now items are not auctions
        }));

        // Transform the "bids" data into auctionItems format
        const auctions = data.bids.map(item => ({
          id: item.listing_id || null,
          imageUrl: item.storage_path || null,
          title: item.title || null,
          price: item.starting_price || null,
          bids: item.number_of_bids || null,
          timeLeft: item.end_time ? `Ends on ${new Date(item.end_time).toLocaleDateString()}` : null,
          views: item.viewers || null,
          isAuction: true, // Auction items are marked as auctions
        }));

        // Update state with transformed data
        setBuyNowItems(buyNow);
        setAuctionItems(auctions);

      } catch (error) {
        console.error("Error fetching most viewed data:", error);
      }
    };

    fetchMostViewedData();
  }, []); // Run only once when the component mounts

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
              <span className="[word-spacing:10px]" >at a time.</span>
            </div>
          </motion.div>
        </AuroraBackground>

        <div className="space-y-16 py-12">
          {/* Display auction and buy now carousels */}
          <TopAuctionCarousel items={auctionItems} />
          <TopBuyNowCarousel items={buyNowItems} />
        </div>

        {/* Display auction and buy-now items in grid layout */}
        <div className="py-12 px-4">
          <h2 className="text-3xl font-semibold mb-8 text-center">Most Viewed Items</h2>

          {/* Container for items with external margin */}
          <div className="container mx-auto px-8">
            {/* Horizontal scrolling container */}
            <div className="flex flex-wrap justify-center gap-8">
              {/* Display Buy Now Items */}
              {buyNowItems.length > 0 && (
                <div className="flex flex-wrap gap-8 justify-center w-full">
                  <h3 className="text-2xl font-bold mb-4 text-black w-full text-center">Buy Now</h3>
                  <div className="flex flex-wrap justify-center gap-8">
                    {buyNowItems.map((item: any, index: number) => (
                      <div
                        key={index}
                        className="bg-white shadow-lg rounded-lg overflow-hidden w-72 sm:w-80 md:w-96"
                      >
                        <img
                          src={item.imageUrl || "/placeholder.jpg"} // Use a placeholder if no image
                          alt={item.title}
                          className="w-full h-64 object-cover"
                        />
                        <div className="p-4">
                          <h4 className="text-xl font-semibold text-black">{item.title}</h4>
                          <p className="text-black">{item.views} views</p>
                          <p className="text-lg font-bold mt-2 text-black">${item.price}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Display Auction Items */}
              {auctionItems.length > 0 && (
                <div className="flex flex-wrap gap-8 justify-center w-full">
                  <h3 className="text-2xl font-bold mb-4 text-black w-full text-center">Auction</h3>
                  <div className="flex flex-wrap justify-center gap-8">
                    {auctionItems.map((item: any, index: number) => (
                      <div
                        key={index}
                        className="bg-white shadow-lg rounded-lg overflow-hidden w-72 sm:w-80 md:w-96"
                      >
                        <img
                          src={item.imageUrl || "/placeholder.jpg"} // Use a placeholder if no image
                          alt={item.title}
                          className="w-full h-64 object-cover"
                        />
                        <div className="p-4">
                          <h4 className="text-xl font-semibold text-black">{item.title}</h4>
                          <p className="text-black">{item.views} views</p>
                          <p className="text-lg font-bold mt-2 text-black">
                            Auction Minimum Price: ${item.price}
                          </p>
                          {item.timeLeft && (
                            <p className="text-sm text-red-500 mt-2">{item.timeLeft}</p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
