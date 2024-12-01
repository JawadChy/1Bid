import React from "react";
import {
    Carousel,
    CarouselContent,
    CarouselItem,
    CarouselNext,
    CarouselPrevious,
} from "@/components/ui/carousel";
import ItemCard from "@/components/ui/item-card";

interface Item {
    id: number;
    imageUrl: string;
    title: string;
    price: number;
    bids?: number;
    timeLeft: string;
    views: number;
    isAuction: boolean;
}

interface CarouselProps {
    items: Item[];
}

export function TopAuctionCarousel({ items }: CarouselProps) {
    return (
      <div className="w-full px-12">
        <h2 className="text-2xl font-bold mb-6 text-black dark:text-white">
          Top Auction Items
        </h2>
        <Carousel
          opts={{
            align: "start",
          }}
          className="w-full"
        >
          <CarouselContent className="-ml-2 md:-ml-4">
            {items.map((item) => (
              <CarouselItem key={item.id} className="pl-2 md:pl-4 md:basis-1/2 lg:basis-1/3 xl:basis-1/4">
                <ItemCard
                  imageUrl={item.imageUrl}
                  title={item.title}
                  price={item.price}
                  isAuction={true}
                  bids={item.bids}
                  timeLeft={item.timeLeft}
                  // views={item.views}
                />
              </CarouselItem>
            ))}
          </CarouselContent>
          <CarouselPrevious/>
          <CarouselNext />
        </Carousel>
      </div>
    );
  }
  
  export function TopBuyNowCarousel({ items }: CarouselProps) {
    return (
      <div className="w-full px-12">
        <h2 className="text-2xl font-bold mb-6 text-black dark:text-white">
          Popular Buy Now Items
        </h2>
        <Carousel
          opts={{
            align: "start",
          }}
          className="w-full"
        >
          <CarouselContent className="-ml-2 md:-ml-4">
            {items.map((item) => (
              <CarouselItem key={item.id} className="pl-2 md:pl-4 md:basis-1/2 lg:basis-1/3 xl:basis-1/4">
                <ItemCard
                  imageUrl={item.imageUrl}
                  title={item.title}
                  price={item.price}
                  isAuction={false}
                  timeLeft={item.timeLeft}
                  // views={item.views}
                />
              </CarouselItem>
            ))}
          </CarouselContent>
          <CarouselPrevious  />
          <CarouselNext />
        </Carousel>
      </div>
    );
  }