import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "./dialog";
import { Crown, Percent, Clock, Star } from "lucide-react";
import { Button } from "./button";
import { motion } from "framer-motion";

interface VipDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

export function VipDialog({ isOpen, onClose }: VipDialogProps) {
  const benefits = [
    {
      icon: <Percent className="h-5 w-5 text-amber-500" />,
      title: "10% Discount",
      description: "Enjoy 10% off on all purchases"
    },
    {
      icon: <Star className="h-5 w-5 text-amber-500" />,
      title: "VIP Badge",
      description: "Exclusive VIP badge on your profile"
    },
    {
      icon: <Clock className="h-5 w-5 text-amber-500" />,
      title: "Priority Support",
      description: "Get faster response to your inquiries"
    }
  ];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <motion.div
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="flex justify-center mb-4"
          >
            <Crown className="h-12 w-12 text-amber-500" />
          </motion.div>
          <DialogTitle className="text-center text-2xl">
            Congratulations! You're Now VIP! 🎉
          </DialogTitle>
          <DialogDescription className="text-center">
            Welcome to our exclusive VIP membership program
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 mt-4">
          {benefits.map((benefit, index) => (
            <motion.div
              key={index}
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: index * 0.1 }}
              className="flex items-start gap-3 p-3 rounded-lg bg-amber-50 dark:bg-amber-950/30"
            >
              {benefit.icon}
              <div>
                <h4 className="font-medium text-amber-900 dark:text-amber-100">
                  {benefit.title}
                </h4>
                <p className="text-sm text-amber-700 dark:text-amber-300">
                  {benefit.description}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
        <Button 
          onClick={onClose}
          className="mt-4 w-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700"
        >
          Start Enjoying VIP Benefits
        </Button>
      </DialogContent>
    </Dialog>
  );
} 