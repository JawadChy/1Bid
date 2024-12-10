'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import toast from 'react-hot-toast';

interface Profile {
  first_name: string;
  last_name: string;
}

interface Bid {
  id: string;
  amount: number;
  created_at: string;
  bidder_id: string;
  status: string;
  bidder: {
    email: string;
    profile: Profile;
  };
}

export function BidDialog({ 
  listingId,
  isOwner 
}: { 
  listingId: string;
  isOwner: boolean;
}) {
  const [bids, setBids] = useState<Bid[]>([]);
  const supabase = createClient();

  const fetchBids = async () => {
    const { data: bidData, error } = await supabase
      .from('bid')
      .select(`
        *,
        bidder:profiles!bid_bidder_id_fkey (
          email,
          first_name,
          last_name
        )
      `)
      .eq('listing_id', listingId)
      .order('amount', { ascending: false });

    if (error) {
      console.error('Error fetching bids:', error);
      return;
    }

    const transformedBids = bidData?.map(bid => ({
      ...bid,
      bidder: {
        email: bid.bidder.email,
        profile: {
          first_name: bid.bidder.first_name,
          last_name: bid.bidder.last_name
        }
      }
    })) || [];

    setBids(transformedBids);
  };

  useEffect(() => {
    fetchBids();
  }, [listingId]);

  const handleAcceptBid = async (bidId: string) => {
    const { error } = await supabase
      .from('bid')
      .update({ status: 'ACCEPTED' })
      .eq('id', bidId);

    if (error) {
      toast.error('Failed to accept bid', {
        position: 'bottom-center'
      });
    } else {
      toast.success('Bid accepted successfully', {
        position: 'bottom-center'
      });
      fetchBids();
    }
  };

  const getBidderName = (bid: Bid) => {
    const { first_name, last_name } = bid.bidder.profile;
    if (first_name && last_name) {
      return `${first_name} ${last_name}`;
    }
    return bid.bidder.email.split('@')[0];
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline">View All Bids</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>All Bids</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 max-h-[400px] overflow-y-auto">
          {bids.map((bid) => (
            <div key={bid.id} className="flex justify-between items-center p-4 rounded-lg bg-white/50 dark:bg-zinc-800/50">
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 rounded-full bg-blue-500/10 flex items-center justify-center">
                  <span className="text-sm font-medium text-blue-600 dark:text-blue-400">
                    {bid.bidder.profile.first_name?.[0] || bid.bidder.email[0].toUpperCase()}
                  </span>
                </div>
                <div>
                  <p className="font-medium">
                    ${bid.amount.toLocaleString()}
                  </p>
                  <p className="text-sm text-gray-500">
                    by {getBidderName(bid)}
                  </p>
                  <p className="text-xs text-gray-500">
                    {new Date(bid.created_at).toLocaleString()}
                  </p>
                </div>
              </div>
              {isOwner && bid.status !== 'ACCEPTED' && (
                <Button 
                  onClick={() => handleAcceptBid(bid.id)}
                  size="sm"
                >
                  Accept
                </Button>
              )}
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}