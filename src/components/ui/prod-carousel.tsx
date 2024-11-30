"use client";

import React from 'react';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import { motion } from "framer-motion";
import { ItemCard } from '@/components/ui/item-card';

interface CarouselSectionProps {
  title: string;
  items: Array<{
    type: 'bid' | 'buy';
    title: string;
    description: string;
    image: string;
    timeLeft?: string;
    currentBid?: number;
    price?: number;
  }>;
}

const CarouselSection = ({ title, items }: CarouselSectionProps) => {
  return (
    <div className="w-full py-8">
      <h2 className="text-2xl font-bold mb-6 px-4">{title}</h2>
      <Carousel className="w-full">
        <CarouselContent className="-ml-4">
          {items.map((item, index) => (
            <CarouselItem key={index} className="pl-4 basis-full md:basis-1/2 lg:basis-1/4">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
              >
                <ItemCard item={item} type={item.type} />
              </motion.div>
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious className="hidden md:flex" />
        <CarouselNext className="hidden md:flex" />
      </Carousel>
    </div>
  );
};

export default CarouselSection;