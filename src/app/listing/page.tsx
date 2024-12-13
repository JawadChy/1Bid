"use client";

import { useState, useEffect, useCallback, useRef } from "react";
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
import { useAuth } from '@/app/auth/auth-context';
import { ConfirmRatingDialog } from "@/components/ui/confirm-rating-dialog";
import { Button } from "@/components/ui/button";
import { ComplaintDialog } from "@/components/ui/complaint-dialog";

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
  seller_rating?: number;
  buyer_rating?: number;
  isOwner: boolean;
  isVip?: boolean;
}

export default function ListingPage() {
  const { user } = useAuth();
  const searchParams = useSearchParams();
  const id = searchParams.get("id");
  const supabase = createClient();

  const [listingData, setListingData] = useState<ListingData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showBidHistory, setShowBidHistory] = useState(false);
  const [showOfferHistory, setShowOfferHistory] = useState(false);

  const [offerPrice, setOfferPrice] = useState<number | string>("");
  const [bidPrice, setBidPrice] = useState<number>(0);
  const [minBidIncrement, setMinBidIncrement] = useState<number>(0);
  const [minOfferPrice, setMinOfferPrice] = useState<number>(0);
  const [remainingTime, setRemainingTime] = useState<number | null>(null);
  const hasLoggedViewRef = useRef(false);
  const [selectedRating, setSelectedRating] = useState<number>(5);
  const [showRatingConfirm, setShowRatingConfirm] = useState(false);
  const [showComplaintDialog, setShowComplaintDialog] = useState(false);
  const [isVip, setIsVip] = useState<boolean>(false);

  useEffect(() => {
    const checkVipStatus = async () => {
      if (!user) return;
      
      try {
        const { data: profile, error } = await supabase
          .from('profile')
          .select('is_vip')
          .eq('id', user.id)
          .single();

        if (error) throw error;
        setIsVip(profile?.is_vip || false);
      } catch (error) {
        console.error('Error checking VIP status:', error);
      }
    };

    checkVipStatus();
  }, [user]);

  useEffect(() => {
    if (!id || hasLoggedViewRef.current) return; // Prevent duplicate calls with useRef because Next.js rerenders 

    // Function to send the POST request to log the view
    const logView = async () => {
      try {
        const response = await fetch("/api/view/addView", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            listing_id: id, // Send the id in the body
          }),
        });

        const data = await response.json();
        if (!response.ok) {
          console.error("Error logging view:", data.error);
        } else {
          console.log("View logged successfully:", data.message);
        }
      } catch (error) {
        console.error("Failed to log view:", error);
      }
    };

    // Call the function to log the view
    logView();

    // Mark the view as logged so it does not trigger again.
    hasLoggedViewRef.current = true;
  }, [id]); // Only run the effect when `id` changes

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
    isOwner
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


  const handleRating = async (type: 'buyer' | 'seller') => {
    try {
      const response = await fetch('/api/ratings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          listing_id: id,
          rating: selectedRating,
          rated_id: type === 'seller' ? listingData.seller_id : listingData.buyer_id
        })
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to submit rating');
      }

      toast.success('Rating submitted successfully');
      await fetchListingData(); // Refresh the listing data

    } catch (error) {
      console.error('Rating error:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to submit rating');
    }
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
      {isVip && (
        <div className="mt-20 max-w-7xl mx-auto px-4 mb-6">
          <div className="bg-gradient-to-r from-amber-100 to-amber-200 dark:from-amber-900/50 dark:to-amber-800/50 rounded-lg p-4 flex items-center justify-center">
            <span className="text-amber-800 dark:text-amber-200 font-medium flex items-center gap-2">
              Enjoy 10% Off All Purchases As VIP! 👑
            </span>
          </div>
        </div>
      )}
      <div className="max-w-7xl mx-auto px-4 mt-24">
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
                <div className="rounded-3xl bg-white/50 dark:bg-zinc-800/50">
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
                          <>
                            <RainbowButton
                              onClick={handleBidSubmit}
                              className="w-full py-6"
                            >
                              Place Bid
                            </RainbowButton>
                          </>
                        )}

                        {isBuyNow && (
                          <>
                            <RainbowButton
                              onClick={handleOfferSubmit}
                              className="w-full py-6"
                            >
                              Make Offer
                            </RainbowButton>
                          </>
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

            {listingData.status === 'SOLD' && (user?.id === listingData.buyer_id || user?.id === listingData.seller_id) && (
              <div className="mb-8 p-6 rounded-lg bg-white/50 dark:bg-zinc-800/50">

                {user?.id === listingData.buyer_id && (
                  <div className="space-y-4 flex flex-col items-center w-full">
                    {!listingData.seller_rating ? (
                      <>
                        <div className="flex flex-col items-center justify-center gap-4">
                          <p className="text-2xl font-semibold text-white">
                            Rate the seller from 1-5
                          </p>
                          <div className="flex items-center gap-6">
                            <div className="rating rating-lg gap-1">
                              {[1, 2, 3, 4, 5].map((value) => (
                                <input
                                  key={value}
                                  type="radio"
                                  name="rating-seller"
                                  className="mask mask-star-2 bg-blue-400"
                                  checked={selectedRating === value}
                                  onChange={() => setSelectedRating(value)}
                                />
                              ))}
                            </div>
                            <Button 
                              onClick={() => setShowRatingConfirm(true)}
                              className="px-8 py-3 text-lg rounded-full"
                            >
                              Submit
                            </Button>
                          </div>
                        </div>
                      </>
                    ) : (
                      <div className="text-center text-xl text-white mb-8">
                        You rated the seller {listingData.seller_rating} stars
                      </div>
                    )}
                    
                    <div className="mt-16">
                      <Button 
                        variant="destructive" 
                        onClick={() => setShowComplaintDialog(true)}
                        className="py-4 text-lg px-12"
                      >
                        Make a Complaint
                      </Button>
                    </div>
                  </div>
                )}

{user?.id === listingData.seller_id && (
  <div className="space-y-4 flex flex-col items-center w-full">
    {!listingData.buyer_rating ? (
      <>
        <div className="flex flex-col items-center justify-center gap-4">
          <p className="text-2xl font-semibold text-white">
            Rate the buyer from 1-5
          </p>
          <div className="flex items-center gap-6">
            <div className="rating rating-lg gap-1">
              {[1, 2, 3, 4, 5].map((value) => (
                <input
                  key={value}
                  type="radio"
                  name="rating-buyer"
                  className="mask mask-star-2 bg-blue-400"
                  checked={selectedRating === value}
                  onChange={() => setSelectedRating(value)}
                />
              ))}
            </div>
            <Button 
              onClick={() => setShowRatingConfirm(true)}
              className="px-8 py-3 text-lg rounded-full"
            >
              Submit
            </Button>
          </div>
        </div>
      </>
    ) : (
      <div className="text-center text-xl text-white mb-8">
        You rated the buyer {listingData.buyer_rating} stars
      </div>
    )}
    
    <div className="mt-16">
      <Button 
        variant="destructive" 
        onClick={() => setShowComplaintDialog(true)}
        className="py-4 text-lg px-12"
      >
        Make a Complaint
      </Button>
    </div>
  </div>
)}

                <ConfirmRatingDialog
                  isOpen={showRatingConfirm}
                  onClose={() => setShowRatingConfirm(false)}
                  onConfirm={() => handleRating(user?.id === listingData.buyer_id ? 'seller' : 'buyer')}
                  rating={selectedRating}
                  type={user?.id === listingData.buyer_id ? 'seller' : 'buyer'}
                />

                {id && listingData && (
                  <ComplaintDialog
                    isOpen={showComplaintDialog}
                    onClose={() => setShowComplaintDialog(false)}
                    listingId={id}
                    accusedId={listingData.buyer_id || listingData.seller_id || ''}
                  />
                )}
              </div>
            )}

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
          isOwner={isOwner}
          isOpen={showOfferHistory}
          onClose={() => setShowOfferHistory(false)}
        />
      )}
    </div>
  );
}
