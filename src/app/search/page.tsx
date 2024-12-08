'use client';

import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import { useCallback, useState } from 'react';
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

export default function SearchPage() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const query = searchParams.get('query') || '';
  const category = searchParams.get('category') || 'all';
  const sort = searchParams.get('sort') || 'relevance';

  // flter states
  const [listingType, setListingType] = useState(searchParams.get('listingType') || 'all');
  const [itemType, setItemType] = useState(searchParams.get('itemType') || 'all');
  const [minPrice, setMinPrice] = useState(searchParams.get('minPrice') || '');
  const [maxPrice, setMaxPrice] = useState(searchParams.get('maxPrice') || '');
  const [forRent, setForRent] = useState(searchParams.get('forRent') === 'true');
  
  const createQueryString = useCallback(
    (name: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString());
      params.set(name, value);
      return params.toString();
    },
    [searchParams]
  );

  const handleSortChange = (value: string) => {
    router.push(pathname + '?' + createQueryString('sort', value));
  };

  const handleApplyFilters = () => {
    const params = new URLSearchParams(searchParams.toString());
    
    // any filters empty or def = delete param

    if (listingType === 'all') {
      params.delete('listingType');
    } else {
      params.set('listingType', listingType);
    }
    
    if (itemType === 'all') {
      params.delete('itemType');
    } else {
      params.set('itemType', itemType);
    }
    
    if (minPrice.trim()) {
      params.set('minPrice', minPrice);
    } else {
      params.delete('minPrice');
    }
    
    if (maxPrice.trim()) {
      params.set('maxPrice', maxPrice);
    } else {
      params.delete('maxPrice');
    }
    
    if (!forRent) {
      params.delete('forRent');
    } else {
      params.set('forRent', forRent.toString());
    }
    
    router.push(pathname + '?' + params.toString());
  };

  // Temporary dummy data
  const dummyItems = Array(9).fill({
    imageUrl: "https://i.ebayimg.com/images/g/rJ4AAOSw3FNj-Qtj/s-l400.jpg",
    title: "Sample Item",
    isAuction: true,
    price: 99.99,
    bids: 5,
    timeLeft: "1d 2h"
  });

  return (
    <>
      <Navbar animated={false} />
      <div className="min-h-screen pt-24 px-4 max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-semibold">
            Search Results for: "{query}"
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
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
              {dummyItems.map((item, index) => (
                <ItemCard key={index} {...item} />
              ))}
            </div>
          </div>

        </div>
      </div>
    </>
  );
}