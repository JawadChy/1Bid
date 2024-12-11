"use client";

import { useState, useEffect, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import Image from "next/image";
import { motion } from "framer-motion";
import { Timer } from "lucide-react";
import { Navbar } from "@/components/navbar";
import { RainbowButton } from "@/components/ui/rainbow-button";
import { BackgroundGradient } from "@/components/ui/background-gradient";
import { BidDialog } from "@/components/bid-dia";
import { Comments } from "@/components/comments";
import { createClient } from "@/lib/supabase/client";
import { Toaster, toast } from "react-hot-toast";
import { OfferDialog } from "@/components/offer-dia";
import { Badge } from "@/components/ui/badge";

interface ListingData {
  id: string;
  seller_id: string;
  title: string;
  description: string;
  category: string;
  listing_type: "BID" | "BUY_NOW";
  status: 'ACTIVE' | 'SOLD';
  created_at: string;
  updated_at: string;
  item_or_service: boolean;
  views: number;
  rent: boolean;
  price: number;
  imageUrl: string;
  min_bid_increment?: number;
  min_offer_price?: number;
  end_time?: string;
  curr_bid_amt?: number;
  buyer_id?: string;
  sold_at?: string;
  sold_price?: number;
}

export default function ListingPage() {
  const searchParams = useSearchParams();
  const id = searchParams.get("id");
  const supabase = createClient();

  const [listingData, setListingData] = useState<ListingData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isOwner, setIsOwner] = useState(false);
  const [showBidHistory, setShowBidHistory] = useState(false);
  const [showOfferHistory, setShowOfferHistory] = useState(false);

  const [offerPrice, setOfferPrice] = useState<number | string>("");
  const [bidPrice, setBidPrice] = useState<number>(0);
  const [minBidIncrement, setMinBidIncrement] = useState<number>(0);
  const [minOfferPrice, setMinOfferPrice] = useState<number>(0);
  const [remainingTime, setRemainingTime] = useState<number | null>(null);

  // Define fetchListingData using useCallback to prevent infinite loops
  const fetchListingData = useCallback(async () => {
    if (!id) return;
    
    try {
      const response = await fetch(`/api/listing/?id=${id}`);
      if (!response.ok) {
        throw new Error("Failed to fetch listing data");
      }
      const data = await response.json();
      setListingData(data.listing);
      setMinBidIncrement(data.listing.min_bid_increment || 0);
      setMinOfferPrice(data.listing.min_offer_price || 0);
      
      // Set initial bid price to current bid + increment
      const initialBid = (data.listing.curr_bid_amt || data.listing.price) + (data.listing.min_bid_increment || 0);
      setBidPrice(initialBid);
      
    } catch (error) {
      setError("404 | Resource not found");
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, [id]);

  // Initial fetch
  useEffect(() => {
    fetchListingData();
  }, [fetchListingData]);

  // Check ownership
  useEffect(() => {
    const checkOwnership = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (session && listingData) {
        setIsOwner(session.user.id === listingData.seller_id);
      }
    };
    checkOwnership();
  }, [listingData, supabase.auth]);

  // Real-time updates subscription
  useEffect(() => {
    if (!id) return;

    // Subscribe to both listing and bid changes
    const channel = supabase
      .channel(`listing_and_bids_${id}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'bid',
          filter: `listing_id=eq.${id}`
        },
        (payload) => {
          console.log('Bid change received:', payload);
          fetchListingData();
          toast.success("New bid placed!", { position: "bottom-center" });
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'listing',
          filter: `id=eq.${id}`
        },
        (payload) => {
          console.log('Listing change received:', payload);
          fetchListingData();
        }
      )
      .subscribe((status) => {
        console.log('Subscription status:', status);
      });

    return () => {
      console.log('Unsubscribing from channel');
      channel.unsubscribe();
    };
  }, [id, fetchListingData, supabase]);

  // Timer effect for auctions
  useEffect(() => {
    if (!listingData?.end_time || listingData.listing_type !== "BID") return;

    const auctionEnd = new Date(listingData.end_time).getTime();
    if (isNaN(auctionEnd)) {
      console.error("Invalid end_time:", listingData.end_time);
      return;
    }

    const interval = setInterval(() => {
      const now = new Date().getTime();
      const timeLeft = auctionEnd - now;

      if (timeLeft <= 0) {
        clearInterval(interval);
        setRemainingTime(0);
        toast.success("Auction has ended!", { position: "bottom-center" });
      } else {
        setRemainingTime(timeLeft);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [listingData?.end_time, listingData?.listing_type]);

  if (error) {
    return (
      <div className="min-h-screen flex justify-center items-center text-red-500">
        <p>{error}</p>
      </div>
    );
  }

  if (!listingData) {
    return (
      <div className="min-h-screen flex justify-center items-center text-xl text-gray-500 dark:text-gray-400">
        <p>Loading ...</p>
      </div>
    );
  }

  const {
    title,
    description,
    listing_type,
    price,
    imageUrl,
    min_bid_increment,
    min_offer_price,
    end_time,
    curr_bid_amt,
    rent,
  } = listingData;

  const isAuction = listing_type === "BID";
  const isBuyNow = listing_type === "BUY_NOW";

  const currentBid = isAuction ? curr_bid_amt || price : price;
  const timeLeft =
    isAuction && end_time ? new Date(end_time).toLocaleString() : undefined;

  const handleBidChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = Number(e.target.value);
    setBidPrice(value);
  };

  const handleOfferChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setOfferPrice(Number(e.target.value));
  };

  const handleBidSubmit = async () => {
    // Check authentication first
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      toast.error("Please sign in to place bids", {
        position: "bottom-center",
        duration: 3000,
      });
      return;
    }

    if (isOwner) {
      toast.error("You cannot bid on your own listing!", {
        position: "bottom-center",
        duration: 3000,
      });
      return;
    }

    try {
      const response = await fetch('/api/bids', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          listing_id: id,
          amount: bidPrice
        })
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to submit bid');
      }

      // Only update UI after successful response
      await fetchListingData();
      toast.success("Bid submitted successfully!", { 
        position: "bottom-center",
        duration: 3000
      });
      
    } catch (error) {
      console.error("Bid error:", error);
      toast.error(error instanceof Error ? error.message : "Failed to submit bid", {
        position: "bottom-center",
        duration: 3000
      });
    }
  };

  const handleOfferSubmit = async () => {
    // Check authentication first
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      toast.error("Please sign in to make offers", {
        position: "bottom-center",
        duration: 3000,
      });
      return;
    }

    if (isOwner) {
      toast.error("You cannot make an offer on your own listing", {
        position: "bottom-center",
        duration: 3000,
      });
      return;
    }

    const offerPriceNumber = Number(offerPrice);
    if (offerPriceNumber < minOfferPrice) {
      toast.error(`Offer must be at least $${minOfferPrice}`, {
        position: "bottom-center",
        duration: 3000,
      });
      return;
    }

    try {
      const response = await fetch('/api/offers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          listing_id: id,
          amount: offerPriceNumber
        })
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to submit offer');
      }

      toast.success("Offer submitted successfully", {
        position: "bottom-center",
        duration: 3000,
      });
      setOfferPrice(minOfferPrice); // Reset offer price
    } catch (error) {
      console.error("Offer error:", error);
      toast.error(error instanceof Error ? error.message : "Failed to submit offer", {
        position: "bottom-center",
        duration: 3000
      });
    }
  };

  const formatTime = (timeInMs: number) => {
    const hours = Math.floor(timeInMs / 3600000);
    const minutes = Math.floor((timeInMs % 3600000) / 60000);
    const seconds = Math.floor((timeInMs % 60000) / 1000);
  
    return `${hours}h ${minutes}m ${seconds}s`;
  };
    

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-100 dark:from-zinc-900 dark:to-zinc-800 py-12">
      <Toaster 
        position="bottom-center"
        toastOptions={{
          duration: 3000,
          style: {
            background: '#333',
            color: '#fff',
          },
        }}
      />
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 mt-8">
        {loading ? (
          <div className="animate-pulse">
            <div className="w-full h-96 bg-gradient-to-r from-gray-200 to-gray-300 rounded-lg shadow-md" />
            <div className="w-full h-20 bg-gradient-to-r from-gray-200 to-gray-300 rounded-lg shadow-md mt-4" />
          </div>
        ) : (
          <div className="space-y-8">
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
                    src={imageUrl}
                    alt={title}
                    fill
                    className="object-contain rounded-3xl"
                  />
                </div>
              </BackgroundGradient>

              {/* Right Column - Product Info */}
              <div className="space-y-6">
                <div>
                  <div className="flex items-center gap-4 mb-2">
                    <h1 className="text-4xl font-bold text-gray-900 dark:text-white">
                      {title}
                    </h1>
                    <Badge 
                      variant={listingData.status === 'ACTIVE' ? 'default' : 'secondary'}
                      className="text-sm"
                    >
                      {listingData.status}
                    </Badge>
                    {isAuction && (
                      <Badge variant="outline" className="text-sm">
                        Auction
                      </Badge>
                    )}
                    {isBuyNow && (
                      <Badge variant="outline" className="text-sm">
                        Buy Now
                      </Badge>
                    )}
                  </div>
                  <p className="mt-2 text-xl text-gray-500 dark:text-gray-400">
                    {isAuction ? "Auction" : isBuyNow ? "Buy Now" : "Rent Now"}
                  </p>
                  <p className="mt-4 text-gray-700 dark:text-gray-300">
                    {description}
                  </p>
                </div>

                {/* Price Info */}
                <div className="rounded-3xl bg-white/50 dark:bg-zinc-800/50 backdrop-blur-md">
                  <div className="p-6">
                    <div className="flex justify-between items-center mb-4">
                      <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {isAuction ? "Current Bid" : "Owner's Asking Price"}
                        </p>
                        <p className="text-3xl font-bold text-gray-900 dark:text-white">
                          ${currentBid.toLocaleString()}
                        </p>
                      </div>
                      {isAuction && remainingTime !== null && (
                        <div className="flex items-center gap-2 mb-6 text-gray-500 dark:text-gray-400">
                          <Timer className="w-4 h-4" />
                          <span>{remainingTime > 0 ? formatTime(remainingTime) : "Auction Ended"}</span>
                        </div>
                      )}
                    </div>

                    {/* Bid/Offer History Buttons for Owners */}
                    {isOwner && (
                      <>
                        {isAuction && (
                          <RainbowButton
                            onClick={() => setShowBidHistory(true)}
                            className="w-full py-4 mb-4"
                          >
                            View Bid History
                          </RainbowButton>
                        )}
                        {isBuyNow && (
                          <RainbowButton
                            onClick={() => setShowOfferHistory(true)}
                            className="w-full py-4 mb-4"
                          >
                            View Offers
                          </RainbowButton>
                        )}
                      </>
                    )}

                    {/* Time Remaining for Auctions */}
                    {isAuction && timeLeft && (
                      <div className="flex items-center gap-2 mb-6 text-gray-500 dark:text-gray-400">
                        <Timer className="w-4 h-4" />
                        <span>{timeLeft} m</span>
                      </div>
                    )}

                    {/* Bid or Offer Input */}
                    {!isOwner && (
                      <div className="space-y-4">
                        {isAuction && (
                          <div className="flex gap-4">
                            <div className="flex-1">
                              <label className="text-sm text-gray-500 dark:text-gray-400 mb-1 block">
                                Minimum Bid (Current Bid +${minBidIncrement})
                              </label>
                              <input
                                type="number"
                                min={currentBid + minBidIncrement}
                                step="1"
                                value={bidPrice}
                                onChange={handleBidChange}
                                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-3xl bg-white dark:bg-zinc-800 text-gray-900 dark:text-white"
                              />
                            </div>
                          </div>
                        )}

                        {isBuyNow && (
                          <div className="flex gap-4">
                            <div className="flex-1">
                              <label className="text-sm text-gray-500 dark:text-gray-400 mb-1 block">
                                Offer Price (Minimum: ${minOfferPrice})
                              </label>
                              <input
                                type="number"
                                min={minOfferPrice}
                                value={offerPrice || minOfferPrice}
                                onChange={handleOfferChange}
                                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-3xl bg-white dark:bg-zinc-800 text-gray-900 dark:text-white"
                              />
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Submit Button */}
                    {!isOwner && listingData.status === 'ACTIVE' && (
                      <div className="space-y-4 mt-6">
                        {isAuction && (
                          <RainbowButton
                            onClick={handleBidSubmit}
                            className="w-full py-6"
                          >
                            Place Bid
                          </RainbowButton>
                        )}

                        {isBuyNow && (
                          <RainbowButton
                            onClick={handleOfferSubmit}
                            className="w-full py-6"
                          >
                            Make Offer
                          </RainbowButton>
                        )}
                      </div>
                    )}

                    {listingData.status === 'SOLD' && (
                      <div className="p-4 bg-gray-100 dark:bg-zinc-800 rounded-lg text-center">
                        <p className="text-lg font-semibold">This item has been sold</p>
                        {listingData.sold_at && (
                          <p className="text-sm text-gray-500">
                            Sold on {new Date(listingData.sold_at).toLocaleDateString()}
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Comments Section */}
            {id && <Comments listingId={id} />}
          </div>
        )}
      </div>

      {/* Bid History Dialog */}
      {showBidHistory && (
        <BidDialog
          listingId={id!}
          isOwner={isOwner}
          onClose={() => setShowBidHistory(false)}
          isOpen={showBidHistory}
        />
      )}

      {/* Offer History Dialog */}
      {isOwner && isBuyNow && (
        <OfferDialog
          listingId={id!}
          isOpen={showOfferHistory}
          onClose={() => setShowOfferHistory(false)}
        />
      )}
    </div>
  );
}
