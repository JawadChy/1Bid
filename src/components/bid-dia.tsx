'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import toast from 'react-hot-toast';
import { ConfirmDialog } from "@/components/ui/confirm-dialog";

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
  bidder: Profile;
}

export function BidDialog({ 
  listingId,
  isOwner,
  isOpen,
  onClose 
}: { 
  listingId: string;
  isOwner: boolean;
  isOpen: boolean;
  onClose: () => void;
}) {
  const [bids, setBids] = useState<Bid[]>([]);
  const supabase = createClient();
  const [confirmDialog, setConfirmDialog] = useState<{
    isOpen: boolean;
    bidId: string;
    amount: number;
  }>({
    isOpen: false,
    bidId: '',
    amount: 0
  });

  const fetchBids = async () => {
    const { data: bidData, error } = await supabase
      .from('bid')
      .select(`
        *,
        bidder:profile!bid_bidder_id_fkey (
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

    const { data: listing } = await supabase
      .from('listing')
      .select('status, buyer_id')
      .eq('id', listingId)
      .single();

    if (listing?.status === 'SOLD') {
      const { data: transaction } = await supabase
        .from('transaction')
        .select('amount')
        .eq('listing_id', listingId)
        .eq('type', 'PURCHASE')
        .single();

      if (transaction) {
        bidData?.forEach(bid => {
          if (bid.bidder_id === listing.buyer_id && bid.amount === transaction.amount) {
            bid.status = 'ACCEPTED';
          } else if (bid.status === 'PENDING') {
            bid.status = 'REJECTED';
          }
        });
      }
    }

    setBids(bidData || []);
  };

  useEffect(() => {
    fetchBids();
  }, [listingId]);

  const handleAcceptBid = async (bidId: string, amount: number) => {
    try {
      const response = await fetch('/api/bids/accept', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          bid_id: bidId,
          listing_id: listingId,
          amount
        })
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to accept bid');
      }

      toast.success('Bid accepted successfully');
      await fetchBids();
      onClose();

    } catch (error) {
      console.error('Error accepting bid:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to accept bid');
    }
  };

  const getBidderName = (bid: Bid) => {
    const { first_name, last_name } = bid.bidder;
    return first_name && last_name ? `${first_name} ${last_name}` : 'Anonymous';
  };

  const handleSubmitBid = async (amount: number) => {
    try {
      const response = await fetch('/api/bids', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          listing_id: listingId,
          amount,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to submit bid');
      }

      await fetchBids();
      toast.success('Bid placed successfully');
      
    } catch (error) {
      console.error('Error submitting bid:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to submit bid', {
        position: 'bottom-center',
        duration: 3000,
      });
    }
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Bid History</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 max-h-[400px] overflow-y-auto">
            {bids.map((bid) => (
              <div key={bid.id} className="flex justify-between items-center p-4 rounded-lg bg-white/50 dark:bg-zinc-800/50">
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 rounded-full bg-blue-500/10 flex items-center justify-center">
                    <span className="text-sm font-medium text-blue-600 dark:text-blue-400">
                      {bid.bidder.first_name?.[0] || 'A'}
                    </span>
                  </div>
                  <div>
                    <p className="font-medium">
                      ${bid.amount.toLocaleString()}
                    </p>
                    <p className="text-sm text-gray-500">
                      by {getBidderName(bid)}
                    </p>
                    <div className="flex items-center gap-2">
                      <p className="text-xs text-gray-500">
                        {new Date(bid.created_at).toLocaleString()}
                      </p>
                      {bid.status !== 'PENDING' && (
                        <span className={`text-xs px-2 py-0.5 rounded ${
                          bid.status === 'ACCEPTED' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }`}>
                          {bid.status}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                {isOwner && bid.status === 'PENDING' && (
                  <Button 
                    onClick={() => setConfirmDialog({
                      isOpen: true,
                      bidId: bid.id,
                      amount: bid.amount
                    })}
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

      <ConfirmDialog
        isOpen={confirmDialog.isOpen}
        onClose={() => setConfirmDialog({ ...confirmDialog, isOpen: false })}
        onConfirm={() => handleAcceptBid(confirmDialog.bidId, confirmDialog.amount)}
        title="Accept Bid"
        message={`Are you sure you want to accept this bid for $${confirmDialog.amount.toLocaleString()}? This action cannot be undone and will reject all other bids.`}
        confirmText="Accept Bid"
      />
    </>
  );
}