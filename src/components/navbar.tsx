"use client";
import { motion, AnimatePresence } from "framer-motion";
import { ThemeToggle } from "./ui/theme-toggle";
import Link from "next/link";
import Image from "next/image";
import bellIcon from "./icons/bell.svg";
import cartIcon from "./icons/cart.svg";
import { Search } from "lucide-react";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { AuthButton } from "./ui/auth-button";
import { useSearchParams } from "next/navigation";

import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export const Navbar = ({ animated = true }: { animated?: boolean }) => {
  const searchWords = ["anything!", "goods", "services"];
  const [currentSearchWord, setCurrentSearchWord] = useState(0);

  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();
  const router = useRouter();

  const [searchQuery, setSearchQuery] = useState("");
  const [category, setCategory] = useState("all");

  const searchParams = useSearchParams();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      const searchParams = new URLSearchParams();
      searchParams.set('query', searchQuery.trim());
      searchParams.set('category', category);
      router.push(`/search?${searchParams.toString()}`);
    }
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  useEffect(() => {
    let mounted = true;

    const initializeAuth = async () => {
      try {
        // Get initial session
        const { data: { session } } = await supabase.auth.getSession();
        
        if (mounted) {
          setUser(session?.user ?? null);
          setLoading(false);
        }

        // Listen for auth changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
          async (_event, session) => {
            if (mounted) {
              setUser(session?.user ?? null);
              setLoading(false);
            }
          }
        );

        return () => {
          mounted = false;
          subscription.unsubscribe();
        };
      } catch (error) {
        console.error("Auth initialization error:", error);
        if (mounted) {
          setLoading(false);
        }
      }
    };

    initializeAuth();
  }, []);

  const navAnimation = animated ? {
    initial: { y: -100 },
    animate: { y: 0 },
    transition: { duration: 0.3 }
  } : {
    initial: { y: 0 },
    animate: { y: 0 }
  };

  const fadeInAnimation = animated ? {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    transition: { duration: 0.5, delay: 0.2 }
  } : {
    initial: { opacity: 1 },
    animate: { opacity: 1 }
  };



  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut();
      router.push("/");
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSearchWord((prev) => (prev + 1) % searchWords.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  // Pass loading state to AuthButton
  const authButtonProps = {
    user,
    loading,
  };

  return (
    <nav className="fixed top-0 w-full z-50">
      <motion.div
        {...navAnimation}
        className="hidden md:flex w-full bg-white/40 dark:bg-black/40 backdrop-blur-md border-b border-gray-200/20 dark:border-gray-800/20"
      >
        <div className="w-full max-w-7xl mx-auto px-4 py-4 grid grid-cols-5 gap-4 items-center">
          {/* Logo Section - 1fr */}
          <motion.div
            {...fadeInAnimation}
            className="flex justify-start items-center"
          >
            <Link href="/">
              <span className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-b from-slate-900/80 to-slate-900/20 dark:from-white/80 dark:to-white/20 hover:from-slate-800 hover:to-slate-800/20 dark:hover:from-white/60 dark:hover:to-white/10 transition-all">
                1Bid
              </span>
            </Link>
          </motion.div>

          <motion.div
            {...fadeInAnimation}
            className="col-span-3 px-4"
          >
            <form onSubmit={handleSearch} className="relative w-full max-w-2xl mx-auto flex items-stretch">
              <div className="flex-grow relative">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={handleSearchChange}
                  className="w-full h-11 px-4 py-2 rounded-l-full rounded-r-none bg-white dark:bg-black border-2 border-gray-300 dark:border-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:border-blue-500 dark:focus:border-blue-500 transition-all"
                />
                <div className="absolute inset-0 flex items-center pointer-events-none px-4">
                  {searchQuery ? (
                    <></>
                  ) : (
                    <>
                      <span className="text-gray-400">Search for </span>
                      <AnimatePresence mode="wait">
                        <motion.span
                          key={searchWords[currentSearchWord]}
                          initial={{ y: 10, opacity: 0 }}
                          animate={{ y: 0, opacity: 1 }}
                          exit={{ y: -10, opacity: 0 }}
                          transition={{ duration: 0.2 }}
                          className="text-gray-400 ml-1"
                        >
                          {searchWords[currentSearchWord]}
                        </motion.span>
                      </AnimatePresence>
                    </>
                  )}
                </div>
              </div>
              <Select defaultValue="all" onValueChange={(value) => setCategory(value)}>
                <SelectTrigger className="h-11 w-32 md:w-40 rounded-l-none rounded-r-full border-2 border-l-0 border-gray-300 dark:border-gray-700 bg-white dark:bg-black">
                  <SelectValue placeholder="All Categories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  <SelectItem value="electronics">Electronics</SelectItem>
                  <SelectItem value="vg_cons">Gaming</SelectItem>
                  <SelectItem value="fashion">Fashion</SelectItem>
                  <SelectItem value="toys">Toys</SelectItem>
                  <SelectItem value="books">Books</SelectItem>
                  <SelectItem value="home">Home & Garden</SelectItem>
                  <SelectItem value="services">Services</SelectItem>
                </SelectContent>
              </Select>
            </form>
          </motion.div>

          {/* User Section - 1fr */}
          <motion.div
            {...fadeInAnimation}
            className="flex items-center justify-end gap-6"
          >
            <AuthButton {...authButtonProps} />

            <div className="flex items-center gap-4 min-w-[120px]">
              <ThemeToggle />
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="relative"
              >
                <Image
                  src={bellIcon}
                  alt="Notifications"
                  width={24}
                  height={24}
                  className="dark:invert opacity-80 hover:opacity-100 transition-opacity"
                />
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="relative"
              >
                <Image
                  src={cartIcon}
                  alt="Cart"
                  width={24}
                  height={24}
                  className="dark:invert opacity-80 hover:opacity-100 transition-opacity"
                />
              </motion.button>
            </div>
          </motion.div>
        </div>
      </motion.div>
    </nav>
  );
};
