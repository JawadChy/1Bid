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

    setBids(bidData || []);
  };

  useEffect(() => {
    fetchBids();
  }, [listingId]);

  const handleAcceptBid = async (bidId: string, amount: number) => {
    try {
      const { error } = await supabase
        .from('bid')
        .update({ status: 'ACCEPTED' })
        .eq('id', bidId);
  
      if (error) throw error;
  
      const { error: listingError } = await supabase
        .from('listing')
        .update({ 
          curr_bid_amt: amount,
          curr_bid_id: bidId
        })
        .eq('id', listingId);
  
      if (listingError) throw listingError;
  
      toast.success('Bid accepted successfully', {
        position: 'bottom-center'
      });
      fetchBids();
    } catch (error) {
      console.error('Error accepting bid:', error);
      toast.error('Failed to accept bid', {
        position: 'bottom-center'
      });
    }
  };

  const getBidderName = (bid: Bid) => {
    const { first_name, last_name } = bid.bidder;
    return first_name && last_name ? `${first_name} ${last_name}` : 'Anonymous';
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
                      {bid.bidder.first_name?.[0] || bid.bidder.email[0].toUpperCase()}
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
        message={`Are you sure you want to accept this bid for $${confirmDialog.amount.toLocaleString()}? This action cannot be undone.`}
        confirmText="Accept Bid"
      />
    </>
  );
}