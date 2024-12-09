'use client';

import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import { useCallback, useState, useEffect } from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  RadioGroup,
  RadioGroupItem
} from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import ItemCard from '@/components/ui/item-card';
import { Navbar } from '@/components/navbar';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

type Listing = {
  id: string;
  title: string;
  price: number;
  listing_type: 'BID' | 'BUY_NOW';
  end_time?: string;
  curr_bid_amt?: number;
  images: string[];
  listing_image: { public_url: string; position: number; }[];
  bid_listing?: [{
    starting_price: number;
    end_time: string;
    curr_bid_amt?: number;
  }];
  buy_now_listing?: [{
    asking_price: number;
  }];
};

type TransformedListing = {
  id: string;
  imageUrl: string;
  title: string;
  isAuction: boolean;
  price: number;
  timeLeft?: string;
};

export default function SearchPage() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const query = searchParams.get('query') || '';
  const category = searchParams.get('category') || 'all';
  const sort = searchParams.get('sort') || 'relevance';

  const [listings, setListings] = useState<TransformedListing[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // flter states
  const [listingType, setListingType] = useState(searchParams.get('listingType') || 'all');
  const [itemType, setItemType] = useState(searchParams.get('itemType') || 'all');
  const [minPrice, setMinPrice] = useState(searchParams.get('minPrice') || '');
  const [maxPrice, setMaxPrice] = useState(searchParams.get('maxPrice') || '');
  const [forRent, setForRent] = useState(searchParams.get('forRent') === 'true');
  
  const createQueryString = useCallback((updates: Record<string, string | null>) => {
    const params = new URLSearchParams(searchParams.toString());
    
    Object.entries(updates).forEach(([key, value]) => {
      if (value === null || value === '' || value === 'all') {
        params.delete(key);
      } else {
        params.set(key, value);
      }
    });
    
    return params.toString();
  }, [searchParams]);

  const handleSortChange = (value: string) => {
    router.push(`${pathname}?${createQueryString({ sort: value })}`);
  };

  const handleApplyFilters = () => {
    router.push(`${pathname}?${createQueryString({
      listingType,
      itemType,
      minPrice: minPrice.trim(),
      maxPrice: maxPrice.trim(),
      forRent: forRent ? 'true' : null
    })}`);
  };

  useEffect(() => {
    const fetchListings = async () => {
      setLoading(true);
      setError(null);
      
      try {
        const response = await fetch(`/api/listings/search?${searchParams.toString()}`);
        if (!response.ok) {
          throw new Error('Failed to fetch listings');
        }
        
        const data = await response.json();
        
        // Transform the data for ItemCard
        const transformedListings = data.listings.map((listing: Listing): TransformedListing => {
          const imageUrl = listing.listing_image?.[0]?.public_url
                          
          const price = listing.listing_type === 'BID'
            ? listing.bid_listing?.[0]?.curr_bid_amt || 
              listing.bid_listing?.[0]?.starting_price ||
              listing.price
            : listing.buy_now_listing?.[0]?.asking_price ||
              listing.price;
              
          const timeLeft = listing.bid_listing?.[0]?.end_time
            ? new Date(listing.bid_listing[0].end_time).toLocaleString()
            : undefined;
            
          return {
            id: listing.id,
            imageUrl,
            title: listing.title,
            isAuction: listing.listing_type === 'BID',
            price,
            timeLeft
          };
        });
        
        setListings(transformedListings);
      } catch (error) {
        console.error('Error fetching listings:', error);
        setError('Failed to load listings. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchListings();
  }, [searchParams]);

  return (
    <>
      <Navbar animated={false} />
      <div className="min-h-screen pt-24 px-4 max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-semibold">
            Search Results for "{query}"
            {category !== 'all' && ` in ${category}`}
          </h1>
          
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600 dark:text-gray-400">Sort by:</span>
            <Select value={sort} onValueChange={handleSortChange}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Sort by..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="latest">Latest</SelectItem>
                <SelectItem value="price_asc">Price: Low to High</SelectItem>
                <SelectItem value="price_desc">Price: High to Low</SelectItem>
                <SelectItem value="popular">Most Popular</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="flex flex-col md:flex-row gap-6">
          {/* Filters Column */}
          <div className="w-full md:w-64 shrink-0">
            <div className="rounded-xl bg-white dark:bg-zinc-900 p-6 border border-neutral-200 dark:border-neutral-800 sticky top-24 space-y-8">
              <div className="space-y-6">
                {/* Listing Type */}
                <div className="space-y-3">
                <h3 className="font-medium">Listing Type</h3>
                <RadioGroup 
                  value={listingType} 
                  onValueChange={setListingType}
                  className="flex flex-col gap-2"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="all" id="listing-all" />
                    <Label htmlFor="listing-all">All</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="auction" id="listing-auction" />
                    <Label htmlFor="listing-auction">Auction</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="buy-now" id="listing-buy-now" />
                    <Label htmlFor="listing-buy-now">Buy Now</Label>
                  </div>
                </RadioGroup>
              </div>

                {/* Item Category */}
                <div className="space-y-3">
                <h3 className="font-medium">Item Category</h3>
                <RadioGroup 
                  value={itemType} 
                  onValueChange={setItemType}
                  className="flex flex-col gap-2"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="all" id="item-all" />
                    <Label htmlFor="item-all">All</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="item" id="item-physical" />
                    <Label htmlFor="item-physical">Physical Item</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="service" id="item-service" />
                    <Label htmlFor="item-service">Service</Label>
                  </div>
                </RadioGroup>
              </div>

                {/* Price Range */}
                <div className="space-y-3">
                <h3 className="font-medium">Price Range</h3>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="min-price">Min Price ($)</Label>
                    <Input
                      id="min-price"
                      type="number"
                      min="0"
                      step="0.01"
                      placeholder="Min"
                      value={minPrice}
                      onChange={(e) => setMinPrice(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="max-price">Max Price ($)</Label>
                    <Input
                      id="max-price"
                      type="number"
                      min="0"
                      step="0.01"
                      placeholder="Max"
                      value={maxPrice}
                      onChange={(e) => setMaxPrice(e.target.value)}
                    />
                  </div>
                </div>
              </div>

                {/* For Rent Toggle */}
                <div className="space-y-3">
                <h3 className="font-medium">Availability</h3>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="rental-mode"
                    checked={forRent}
                    onCheckedChange={setForRent}
                  />
                  <Label htmlFor="rental-mode">Available for Rent</Label>
                </div>
                </div>

                <div className="pt-4 border-t border-neutral-200 dark:border-neutral-800">
                  <Button 
                    className="w-full"
                    onClick={handleApplyFilters}
                  >
                    Apply Filters
                  </Button>
                </div>

              </div>
            </div>
          </div>

          {/* Results Grid */}
          <div className="flex-1">
            {error ? (
              <div className="text-red-500 text-center py-8">{error}</div>
            ) : loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <div key={i} className="animate-pulse">
                    <div className="w-full aspect-square bg-gray-200 dark:bg-gray-800 rounded-3xl" />
                    <div className="mt-4 h-4 bg-gray-200 dark:bg-gray-800 rounded w-3/4" />
                    <div className="mt-2 h-4 bg-gray-200 dark:bg-gray-800 rounded w-1/2" />
                  </div>
                ))}
              </div>
            ) : listings.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                No listings found matching your criteria
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                {listings.map((item) => (
                  <Link href={`/listing?id=${item.id}`}>
                      <ItemCard 
                        id={item.id} 
                        imageUrl={item.imageUrl}
                        title={item.title}
                        isAuction={item.isAuction}
                        price={item.price}
                        timeLeft={item.timeLeft}
                      />
                  </Link>
                ))}
              </div>
            )}
          </div>

        </div>
      </div>
    </>
  );
}