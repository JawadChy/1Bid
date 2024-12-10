'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import toast from 'react-hot-toast';
import { ConfirmDialog } from "@/components/ui/confirm-dialog";

interface Profile {
  first_name: string;
  last_name: string;
}

interface Offer {
  id: string;
  amount: number;
  created_at: string;
  buyer_id: string;
  status: string;
  buyer: Profile;
}

export function OfferDialog({ 
  listingId,
  isOpen,
  onClose 
}: { 
  listingId: string;
  isOpen: boolean;
  onClose: () => void;
}) {
  const [offers, setOffers] = useState<Offer[]>([]);
  const supabase = createClient();
  const [confirmDialog, setConfirmDialog] = useState<{
    isOpen: boolean;
    offerId: string;
    amount: number;
  }>({
    isOpen: false,
    offerId: '',
    amount: 0
  });

  const fetchOffers = async () => {
    const { data: offerData, error } = await supabase
      .from('offer')
      .select(`
        *,
        buyer:profile!offer_buyer_id_fkey (
          first_name,
          last_name
        )
      `)
      .eq('listing_id', listingId)
      .order('amount', { ascending: false });

    if (error) {
      console.error('Error fetching offers:', error);
      return;
    }

    setOffers(offerData || []);
  };

  useEffect(() => {
    fetchOffers();
  }, [listingId]);

  const handleAcceptOffer = async (offerId: string, amount: number) => {
    try {
      const { error } = await supabase
        .from('offer')
        .update({ status: 'ACCEPTED' })
        .eq('id', offerId);
  
      if (error) throw error;
  
      toast.success('Offer accepted successfully');
      fetchOffers();
    } catch (error) {
      console.error('Error accepting offer:', error);
      toast.error('Failed to accept offer');
    }
  };

  const getBuyerName = (offer: Offer) => {
    const { first_name, last_name } = offer.buyer;
    return first_name && last_name ? `${first_name} ${last_name}` : 'Anonymous';
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Offer History</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 max-h-[400px] overflow-y-auto">
            {offers.map((offer) => (
              <div key={offer.id} className="flex justify-between items-center p-4 rounded-lg bg-white/50 dark:bg-zinc-800/50">
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 rounded-full bg-blue-500/10 flex items-center justify-center">
                    <span className="text-sm font-medium text-blue-600 dark:text-blue-400">
                      {offer.buyer.first_name?.[0] || 'A'}
                    </span>
                  </div>
                  <div>
                    <p className="font-medium">
                      ${offer.amount.toLocaleString()}
                    </p>
                    <p className="text-sm text-gray-500">
                      by {getBuyerName(offer)}
                    </p>
                    <p className="text-xs text-gray-500">
                      {new Date(offer.created_at).toLocaleString()}
                    </p>
                  </div>
                </div>
                {offer.status !== 'ACCEPTED' && (
                  <Button 
                    onClick={() => setConfirmDialog({
                      isOpen: true,
                      offerId: offer.id,
                      amount: offer.amount
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
        onConfirm={() => handleAcceptOffer(confirmDialog.offerId, confirmDialog.amount)}
        title="Accept Offer"
        message={`Are you sure you want to accept this offer for $${confirmDialog.amount.toLocaleString()}?`}
        confirmText="Accept Offer"
      />
    </>
  );
} 