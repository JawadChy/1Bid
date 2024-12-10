'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { Timer } from 'lucide-react';
import { Navbar } from '@/components/navbar';
import { RainbowButton } from '@/components/ui/rainbow-button';
import { BackgroundGradient } from '@/components/ui/background-gradient';
import { BidDialog } from '@/components/bid-dia';
import { Comments } from '@/components/comments';
import { createClient } from '@/lib/supabase/client';
import toast from 'react-hot-toast';

interface ListingData {
  id: string;
  seller_id: string;
  title: string;
  description: string;
  category: string;
  listing_type: 'BID' | 'BUY_NOW';
  status: string;
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
}

export default function ListingPage() {
  const searchParams = useSearchParams();
  const id = searchParams.get('id');
  const supabase = createClient();

  const [listingData, setListingData] = useState<ListingData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isOwner, setIsOwner] = useState(false);

  const [offerPrice, setOfferPrice] = useState<number | string>('');
  const [bidPrice, setBidPrice] = useState<number>(0);
  const [minBidIncrement, setMinBidIncrement] = useState<number>(0);
  const [minOfferPrice, setMinOfferPrice] = useState<number>(0);

  // Check if current user is the listing owner
  useEffect(() => {
    const checkOwnership = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session && listingData) {
        setIsOwner(session.user.id === listingData.seller_id);
      }
    };
    checkOwnership();
  }, [listingData]);

  useEffect(() => {
    if (!id) return;

    const fetchListingData = async () => {
      try {
        const response = await fetch(`/api/listing/?id=${id}`);
        if (!response.ok) {
          throw new Error('Failed to fetch listing data');
        }
        const data = await response.json();
        setListingData(data.listing);
        setMinBidIncrement(data.listing.min_bid_increment || 0);
        setMinOfferPrice(data.listing.min_offer_price || 0);
      } catch (error) {
        setError('404 | Resource not found');
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchListingData();
  }, [id]);

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

  const isAuction = listing_type === 'BID';
  const isBuyNow = listing_type === 'BUY_NOW';

  const currentBid = isAuction ? (curr_bid_amt || price) : price;
  const timeLeft = isAuction && end_time ? new Date(end_time).toLocaleString() : undefined;

  const handleBidChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = Math.max(Number(e.target.value), currentBid + minBidIncrement);
    setBidPrice(value);
  };

  const handleOfferChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setOfferPrice(Number(e.target.value));
  };

  const handleBidSubmit = async () => {
    if (isOwner) {
      toast.error("You cannot bid on your own listing", { position: 'bottom-center' });
      return;
    }

    if (bidPrice >= currentBid + minBidIncrement) {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
          toast.error('Please sign in to place a bid', { position: 'bottom-center' });
          return;
        }

        const { error } = await supabase
          .from('bid')
          .insert({
            listing_id: id,
            bidder_id: session.user.id,
            amount: bidPrice,
            status: 'PENDING'
          });

        if (error) throw error;
        toast.success('Bid placed successfully', { position: 'bottom-center' });
      } catch (error) {
        toast.error('Failed to place bid', { position: 'bottom-center' });
        console.error('Bid error:', error);
      }
    } else {
      toast.error(`Bid must be at least $${currentBid + minBidIncrement}`, { position: 'bottom-center' });
    }
  };

  const handleOfferSubmit = async () => {
    if (isOwner) {
      toast.error("You cannot make an offer on your own listing", { position: 'bottom-center' });
      return;
    }

    const offerPriceNumber = Number(offerPrice);
    if (offerPriceNumber >= minOfferPrice) {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
          toast.error('Please sign in to make an offer', { position: 'bottom-center' });
          return;
        }

        const { error } = await supabase
          .from('offer')
          .insert({
            listing_id: id,
            buyer_id: session.user.id,
            amount: offerPriceNumber,
            status: 'PENDING'
          });

        if (error) throw error;
        toast.success('Offer submitted successfully', { position: 'bottom-center' });
      } catch (error) {
        toast.error('Failed to submit offer', { position: 'bottom-center' });
        console.error('Offer error:', error);
      }
    } else {
      toast.error(`Offer must be at least $${minOfferPrice}`, { position: 'bottom-center' });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-100 dark:from-zinc-900 dark:to-zinc-800 py-12">
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
                  <h1 className="text-4xl font-bold text-gray-900 dark:text-white">{title}</h1>
                  <p className="mt-2 text-xl text-gray-500 dark:text-gray-400">
                    {isAuction ? 'Auction' : isBuyNow ? 'Buy Now' : 'Rent Now'}
                  </p>
                  <p className="mt-4 text-gray-700 dark:text-gray-300">{description}</p>
                </div>

                {/* Price Info */}
                <div className="rounded-3xl bg-white/50 dark:bg-zinc-800/50 backdrop-blur-md">
                  <div className="p-6">
                    <div className="flex justify-between items-center mb-4">
                      <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {isAuction
                            ? 'Current Bid'
                            : "Owner's Asking Price"}
                        </p>
                        <p className="text-3xl font-bold text-gray-900 dark:text-white">
                          ${currentBid.toLocaleString()}
                        </p>
                      </div>
                      {isAuction && isOwner && (
                        <BidDialog listingId={id} isOwner={isOwner} />
                      )}
                    </div>

                    {/* Time Remaining for Auctions */}
                    {isAuction && timeLeft && (
                      <div className="flex items-center gap-2 mb-6 text-gray-500 dark:text-gray-400">
                        <Timer className="w-4 h-4" />
                        <span>{timeLeft} remaining</span>
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
                                step={minBidIncrement}
                                value={bidPrice || currentBid + minBidIncrement}
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
                    {!isOwner && (
                      <div className="space-y-4 mt-6">
                        {isAuction && (
                          <RainbowButton onClick={handleBidSubmit} className="w-full py-6">
                            Place Bid
                          </RainbowButton>
                        )}

                        {isBuyNow && (
                          <RainbowButton onClick={handleOfferSubmit} className="w-full py-6">
                            Make Offer
                          </RainbowButton>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Comments Section */}
            <Comments listingId={id} />
          </div>
        )}
      </div>
    </div>
  );
}