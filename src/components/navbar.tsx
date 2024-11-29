"use client";
import { motion, AnimatePresence } from "framer-motion";
import { ThemeToggle } from "./ui/theme-toggle";
import Link from "next/link";
import Image from "next/image";
import bellIcon from "./icons/bell.svg";
import cartIcon from "./icons/cart.svg";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from 'next/navigation';

export const Navbar = () => {
  {
    /* add some other shit here too, i'm not good at being creative */
  }
  const searchWords = ["anything!", "goods", "services"];
  const [currentSearchWord, setCurrentSearchWord] = useState(0);
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();
  const router = useRouter();

  const [searchQuery, setSearchQuery] = useState("");

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };


  // useEffect(() => {
  //   console.log(`${searchQuery} is what current query is`)

  // }, [searchQuery]);



  useEffect(() => {
    // check initial auth state
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    // listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut();
      router.push('/');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSearchWord((prev) => (prev + 1) % searchWords.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const AuthButton = () => {
    if (!user) {
      return (
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="flex items-center gap-2"
        >
          <Link href="/auth/signin">
            <span className="text-center font-medium">
              Sign In
            </span>
          </Link>
        </motion.button>
      );
    }
    else {
      return (
        <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className="flex items-center gap-2"
        onClick={handleSignOut}
      >
          <span className="text-center font-medium">
            Sign Out
          </span>
      </motion.button>
      )
    }
  }

  return (
    <nav className="fixed top-0 w-full z-50">
      <motion.div
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.5 }}
        className="hidden md:flex w-full bg-white/40 dark:bg-black/40 backdrop-blur-md border-b border-gray-200/20 dark:border-gray-800/20"
      >
        <div className="w-full max-w-7xl mx-auto px-4 py-4 grid grid-cols-5 gap-4 items-center">
          {/* Logo Section - 1fr */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="flex justify-start items-center"
          >
            <Link href="/">
              <span className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-b from-slate-900/80 to-slate-900/20 dark:from-white/80 dark:to-white/20 hover:from-slate-800 hover:to-slate-800/20 dark:hover:from-white/60 dark:hover:to-white/10 transition-all">
                1Bid
              </span>
            </Link>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="col-span-3 px-4"
          >
            <div className="relative w-full max-w-2xl mx-auto">
              <input
                type="text"
                value={searchQuery}
                onChange={handleSearchChange}
                className="w-full px-4 py-2 rounded-full bg-white/50 dark:bg-black/50 border border-gray-200/20 dark:border-gray-800/20 backdrop-blur-sm text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
              />
              <div className="absolute inset-0 flex items-center pointer-events-none px-4">
                {searchQuery ? (
                  <span className="dark:text-white">{searchQuery}</span>
                ) : 
                (
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
          </motion.div>

          {/* User Section - 1fr */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="flex items-center justify-end gap-6"
          >
            <AuthButton />

            <div className="flex items-center gap-4">
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
