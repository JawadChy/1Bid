"use client";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { AuroraBackground } from "../components/ui/aurora-background";
import { FlipWords } from "@/components/ui/flip-words";
import { Navbar } from "@/components/navbar";
import { TopAuctionCarousel, TopBuyNowCarousel } from "@/components/item-carousels";
import Link from "next/link";

interface BuyNow {
  listing_id?: number | null;
  storage_path?: string | null;
  title?: string | null;
  asking_price?: number | null; 
  viewers?: number | null; 
}

interface BidItem {
  listing_id?: number | null; 
  storage_path?: string | null; 
  title?: string | null; 
  starting_price?: number | null; 
  number_of_bids?: number | null; 
  end_time?: string | null; 
  viewers?: number | null; 
}

interface ViewItems {
  id: string;
  name: string;
  listing_type: "BID" | "BUY_NOW";
  price: number;
  description?: string;

}


export default function Home() {
  // State to hold data for bids and buy-now items
  const [buyNowItems, setBuyNowItems] = useState<any[]>([]);
  const [auctionItems, setAuctionItems] = useState<any[]>([]);

  const words = ["bid", "listing"];

  const [buyItems, setBuyItems] = useState<any[]>([]);
  const [bidItems, setBidItems] = useState<any[]>([]);
  const [frequentViewLoaded, setFrequentViewLoaded] = useState(false);

  
  // Fetch most viewed listings from the API
  useEffect(() => {
    const fetchMostViewedData = async () => {
      try {
        console.log("Making GET request to /api/view/mostTotalViewed...");

        // Perform the HTTP GET request
        const response = await fetch("/api/view/mostTotalViewed");

        // Check if the response was successful
        if (!response.ok) {
          throw new Error(`Request failed with status: ${response.status}`);
        }

        // Parse the JSON response
        const data = await response.json();
        console.log("Fetched data:", data);

        const buyNow = data.buys.map((item: BuyNow) => ({
          id: item.listing_id || null,
          imageUrl: item.storage_path || null,
          title: item.title || null,
          price: item.asking_price || null,
          views: item.viewers || null,
          isAuction: false,
        }));

        const auctions = data.bids.map((item: BidItem) => ({
          id: item.listing_id || null,
          imageUrl: item.storage_path || null,
          title: item.title || null,
          price: item.starting_price || null,
          bids: item.number_of_bids || null,
          timeLeft: item.end_time
            ? `Ends on ${new Date(item.end_time).toLocaleDateString()}`
            : null,
          views: item.viewers || null,
          isAuction: true,
        }));

        setBuyNowItems(buyNow);
        setAuctionItems(auctions);
      } catch (error) {
        console.error("Error fetching most viewed data:", error);
      }
    };

    fetchMostViewedData();
  }, []);

  // Fetch data from the /api/view/frequentview for user-specific history
  useEffect(() => {
    const fetchFrequentViewedData = async () => {
      try {
        console.log("Making GET request to /api/view/frequentview...");

        const response = await fetch("/api/view/frequentview");
        if (!response.ok) {
          throw new Error(`Request failed with status: ${response.status}`);
        }

        const data = await response.json();
        console.log("Fetched frequent viewed data:", data);

        // Separate items into "BID" and "BUY_NOW"
        const bids = data.filter((item:ViewItems) => item.listing_type === "BID");
        const buys = data.filter((item:ViewItems) => item.listing_type === "BUY_NOW");

        setBidItems(bids);
        setBuyItems(buys);
        setFrequentViewLoaded(true);
      } catch (error) {
        console.error("Error fetching frequent viewed data:", error);
        setFrequentViewLoaded(false);
      }
    };

    fetchFrequentViewedData();
  }, []);

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
              <span className="font-bold inline-block min-w-[136px] text-center">
                <FlipWords words={words} hasGradient={true} />
              </span>
              <span className="[word-spacing:10px]">at a time.</span>
            </div>
          </motion.div>
        </AuroraBackground>

        <div className="space-y-16 py-12">
          <TopAuctionCarousel items={auctionItems} />
          <TopBuyNowCarousel items={buyNowItems} />
        </div>

        
        <div className="py-12 px-4">
          <div className="container mx-auto px-8">
            <div className="flex flex-wrap justify-center gap-8">
              {frequentViewLoaded && (
                <div className="min-h-screen py-8 px-4">
                  <h2 className="text-3xl font-bold text-center mb-8">
                    Your Frequently Viewed Items
                  </h2>

                  {/* BID Items */}
                  {bidItems.length > 0 && (
                    <div className="mb-12">
                      <h3 className="text-2xl font-semibold mb-4">Auction Items</h3>
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {bidItems.map((item) => (
                          <div
                            key={item.listing_id}
                            className="bg-white shadow-md rounded-lg overflow-hidden"
                          >
                            <img
                              src={item.image_url || "/placeholder.jpg"}
                              alt={item.title}
                              className="w-full h-56 object-cover"
                            />
                            <div className="p-4">
                              <h4 className="text-lg font-bold mb-2">
                                {item.title}
                              </h4>
                              <p className="text-sm text-gray-600">
                                Starting Price: ${item.price}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* BUY_NOW Items */}
                  {buyItems.length > 0 && (
                    <div>
                      <h3 className="text-2xl font-semibold mb-4">Buy Now Items</h3>
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {buyItems.map((item) => (
                          <div
                            key={item.listing_id}
                            className="bg-white shadow-md rounded-lg overflow-hidden"
                          >
                            <img
                              src={item.image_url || "/placeholder.jpg"}
                              alt={item.title}
                              className="w-full h-56 object-cover"
                            />
                            <div className="p-4">
                              <h4 className="text-lg font-bold mb-2">
                                {item.title}
                              </h4>
                              <p className="text-sm text-gray-600">Price: ${item.price}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
