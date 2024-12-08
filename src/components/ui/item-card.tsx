import Image from "next/image";
import { Clock } from "lucide-react";

interface ItemCardProps {
  id: string;
  imageUrl: string;
  title: string;
  // having description just makes the card too big, ebay doesn't have description so i'm just not gonna add it.
  // description: string;
  isAuction: boolean;
  price: number;
  bids?: number;
  timeLeft?: string;
}

export default function ItemCard({
  id,
  imageUrl,
  title,
  // description,
  isAuction=true,
  price,
  bids = 0,
  timeLeft,
}: ItemCardProps) {
  return (
    <div className="w-[384px] rounded-3xl border border-neutral-200 dark:border-neutral-800 overflow-hidden bg-white dark:bg-zinc-900">
      <div className=" rounded-3xl w-full aspect-square relative bg-slate-100	dark:bg-zinc-950">
        <Image
          src={imageUrl}
          alt={title}
          fill
          className="rounded-3xl object-cover"
        />
        {/* could also do object-contain*/}
      </div>
      <div className="p-4">
        <h3 className="text-xl font-semibold text-black dark:text-white mb-2">
          {title}
        </h3>
        {/* <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-4">
          {description}
        </p> */}
        <div className="flex justify-between items-center">
          <div className="space-y-1">
            <p className="text-sm font-medium text-neutral-600 dark:text-neutral-400">
              {isAuction ? "Current Bid" : "Buy It Now For"}
            </p>
            <p className="text-xl font-bold text-black dark:text-white">
              ${price.toLocaleString()}
            </p>
          </div>
          <div className="space-y-1 text-right">
            {isAuction ? (
              <>
                <p className="text-sm font-medium text-neutral-600 dark:text-neutral-400">
                  {bids} bids
                </p>
              </>
            ) : (
              <></>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}