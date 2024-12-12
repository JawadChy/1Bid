import Image from "next/image";
import { Clock } from "lucide-react";
import Link from "next/link";

interface ItemCardProps {
  id: string;
  imageUrl: string;
  title: string;
  isAuction: boolean;
  price: number;
  curr_bid_amt?: number;
  timeLeft?: string;
  clickable?: boolean;
}

export default function ItemCard({
  id,
  imageUrl,
  title,
  isAuction = true,
  price,
  curr_bid_amt,
  timeLeft,
  clickable = false,
}: ItemCardProps) {
  const CardContent = (
    <div className="w-[320px] rounded-3xl border border-neutral-200 dark:border-neutral-800 overflow-hidden bg-white dark:bg-zinc-900 transition-all duration-200 hover:shadow-lg hover:scale-[1.02] hover:border-neutral-300 dark:hover:border-neutral-700">
      <div className="rounded-3xl w-80 aspect-square relative bg-slate-100 dark:bg-zinc-950">
        <Image
          src={imageUrl}
          sizes="360px"
          alt={title}
          fill
          className="rounded-3xl object-cover"
        />
      </div>
      <div className="p-4">
        <h3 className="text-xl font-semibold text-black dark:text-white mb-2">
          {title}
        </h3>
        <div className="flex justify-between items-center">
          <div className="space-y-1">
            <p className="text-sm font-medium text-neutral-600 dark:text-neutral-400">
              {isAuction ? (curr_bid_amt ? "Current Bid" : "Starting Price") : "Buy It Now For"}
            </p>
            <p className="text-xl font-bold text-black dark:text-white">
              ${price.toLocaleString()}
            </p>
          </div>
        </div>
      </div>
    </div>
  );

  return clickable ? (
    <Link href={`/listing/${id}`}>{CardContent}</Link>
  ) : (
    CardContent
  );
}