'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Navbar } from '@/components/navbar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Package, 
  ShoppingCart, 
  Tag,
  Clock,
  Gavel,
  Key,
  Wrench,
  AlertCircle
} from 'lucide-react';
import { format } from 'date-fns';
import { useRouter } from 'next/navigation';

interface ListingImage {
  public_url: string;
  position: number;
}

interface BidListing {
  starting_price: number;
  end_time: string;
  curr_bid_amt?: number;
}

interface BuyNowListing {
  asking_price: number;
}

interface Listing {
  id: string;
  title: string;
  listing_type: 'BID' | 'BUY_NOW';
  item_or_service: boolean;
  category: string;
  rent: boolean;
  status: 'ACTIVE' | 'SOLD' | 'PURCHASED';
  listing_image: ListingImage[];
  bid_listing?: BidListing[];
  buy_now_listing?: BuyNowListing[];
}

type ListingCardProps = {
  listing: Listing;
  type: 'active' | 'sold' | 'purchased';
};

export default function MyListings() {
  const [listings, setListings] = useState<Listing[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchListings();
  }, []);

  const fetchListings = async () => {
    try {
      const response = await fetch('/api/listings/mylistings');
      if (!response.ok) {
        throw new Error('Failed to fetch listings');
      }
      
      const data = await response.json();
      setListings(data.listings || []);
      setIsLoading(false);
    } catch (error) {
      console.error('Error fetching listings:', error);
      setIsLoading(false);
    }
  };

  // Filter listings based on status
  const activeListings = listings.filter(listing => listing.status === 'ACTIVE');
  const soldListings = listings.filter(listing => listing.status === 'SOLD');
  const purchasedListings = listings.filter(listing => listing.status === 'PURCHASED');

  const ListingCard = ({ listing, type }: ListingCardProps) => {
    if (!listing) return null;

    const mainImage = listing.listing_image && listing.listing_image.length > 0
      ? listing.listing_image.sort((a, b) => a.position - b.position)[0]?.public_url
      : null;
    const price = listing.listing_type === 'BID' 
      ? listing.bid_listing?.[0]?.curr_bid_amt || listing.bid_listing?.[0]?.starting_price
      : listing.buy_now_listing?.[0]?.asking_price;

    const router = useRouter();

    return (
      <Card 
        className="overflow-hidden hover:shadow-lg transition-shadow duration-200 cursor-pointer"
        onClick={() => router.push(`/listing?id=${listing.id}`)}
      >
        <div className="aspect-video w-full overflow-hidden bg-gray-100">
          <img 
            src={mainImage || '/placeholder.png'} 
            alt={listing.title}
            className="w-full h-full object-cover hover:scale-105 transition-transform duration-200"
          />
        </div>
        <CardHeader>
          <div className="flex justify-between items-start">
            <CardTitle className="text-xl line-clamp-1">{listing.title}</CardTitle>
            <Badge variant={type === 'active' ? 'default' : type === 'sold' ? 'outline' : 'secondary'}>
              {type === 'active' ? 'Active' : type === 'sold' ? 'Sold' : 'Purchased'}
            </Badge>
          </div>
          <div className="flex flex-wrap gap-2 text-sm text-muted-foreground">
            {listing.item_or_service ? (
              <span className="flex items-center gap-1">
                <Package className="h-4 w-4" />
                Item
              </span>
            ) : (
              <span className="flex items-center gap-1">
                <Wrench className="h-4 w-4" />
                Service
              </span>
            )}
            {listing.rent && (
              <span className="flex items-center gap-1">
                <Key className="h-4 w-4" />
                Rental
              </span>
            )}
            <span className="flex items-center gap-1">
              <Tag className="h-4 w-4" />
              {listing.category}
            </span>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              {listing.listing_type === 'BID' ? (
                <Gavel className="h-5 w-5 text-primary" />
              ) : (
                <ShoppingCart className="h-5 w-5 text-primary" />
              )}
              <span className="font-medium">
                ${price?.toFixed(2)}
                {listing.rent && '/month'}
              </span>
            </div>
            {listing.listing_type === 'BID' && listing.bid_listing?.[0]?.end_time && (
              <div className="flex items-center gap-1 text-sm text-muted-foreground">
                <Clock className="h-4 w-4" />
                {format(new Date(listing.bid_listing[0].end_time), 'MMM d, yyyy')}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    );
  };

  if (isLoading) {
    return (
      <>
        <Navbar animated={false} />
        <div className="flex justify-center items-center min-h-screen">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar animated={false} />
      <div className="container mx-auto pt-24 px-4">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-4xl font-bold mb-8">My Listings</h1>
          
          <Tabs defaultValue="active" className="space-y-6">
            <TabsList className="grid w-full grid-cols-3 lg:w-[400px]">
              <TabsTrigger value="active">Active</TabsTrigger>
              <TabsTrigger value="sold">Sold</TabsTrigger>
              <TabsTrigger value="purchased">Purchased</TabsTrigger>
            </TabsList>

            <TabsContent value="active">
              {activeListings.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {activeListings.map((listing) => (
                    <ListingCard key={listing.id} listing={listing} type="active" />
                  ))}
                </div>
              ) : (
                <Card className="bg-muted">
                  <CardHeader>
                    <div className="flex items-center gap-2">
                      <AlertCircle className="h-5 w-5 text-muted-foreground" />
                      <CardTitle>No Active Listings</CardTitle>
                    </div>
                    <CardDescription>
                      You don't have any active listings at the moment.
                    </CardDescription>
                  </CardHeader>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="sold">
              {soldListings.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {soldListings.map((listing) => (
                    <ListingCard key={listing.id} listing={listing} type="sold" />
                  ))}
                </div>
              ) : (
                <Card className="bg-muted">
                  <CardHeader>
                    <div className="flex items-center gap-2">
                      <AlertCircle className="h-5 w-5 text-muted-foreground" />
                      <CardTitle>No Sold Items</CardTitle>
                    </div>
                    <CardDescription>
                      You haven't sold any items yet.
                    </CardDescription>
                  </CardHeader>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="purchased">
              {purchasedListings.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {purchasedListings.map((listing) => (
                    <ListingCard key={listing.id} listing={listing} type="purchased" />
                  ))}
                </div>
              ) : (
                <Card className="bg-muted">
                  <CardHeader>
                    <div className="flex items-center gap-2">
                      <AlertCircle className="h-5 w-5 text-muted-foreground" />
                      <CardTitle>No Purchases</CardTitle>
                    </div>
                    <CardDescription>
                      You haven't purchased any items yet.
                    </CardDescription>
                  </CardHeader>
                </Card>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </>
  );
}