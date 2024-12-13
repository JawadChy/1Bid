"use client";
import React from "react";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
import { createClient } from "@/lib/supabase/client";
import { User } from "@supabase/supabase-js";
import { Wallet, ChevronDown, Settings, Plus, LogOut, ListIcon, LayoutDashboard, Crown } from "lucide-react";
import { Button } from "./button";
import Link from "next/link";
import { useAuth } from '@/app/auth/auth-context';

interface UserProfile {
  id: string;
  first_name: string;
  last_name: string;
  role: string;
  is_vip: boolean;
}

interface UserProfileDropdownProps {
  user: User;
}

export function ProfileDropdown({ user }: UserProfileDropdownProps) {
  const { signOut } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const supabase = createClient();
  const router = useRouter();

  useEffect(() => {
    async function getProfile() {
      try {
        const { data, error } = await supabase
          .from("profile")
          .select("id, first_name, last_name, role, is_vip")
          .eq("id", user.id)
          .single();

        if (error) throw error;
        setProfile(data);
      } catch (error) {
        console.error("Error fetching profile:", error);
      } finally {
        return;
      }
    }

    if (user) getProfile();
  }, [user]);

  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut();
      router.push("/");
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline">
          {profile ? `Hi ${profile.first_name}` : "👋"}
          <ChevronDown className="ml-2 h-4 w-4 text-gray-500" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56">
        <div className="flex items-center gap-4 p-2">
          <div className="h-10 w-10 rounded-full bg-blue-500/10 flex items-center justify-center">
            <span className="text-base font-medium text-blue-600 dark:text-blue-400">
              {profile?.first_name?.[0] || user.email?.[0]?.toUpperCase()}
            </span>
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-medium">
              {profile?.first_name} {profile?.last_name}
            </span>
            <span className="text-xs text-gray-500 dark:text-gray-400">
              {user.email}
            </span>
          </div>
        </div>

        {profile?.is_vip && (
          <div className="px-2 py-1.5 mx-2 my-1 rounded-md bg-amber-50 dark:bg-amber-950/30">
            <span className="flex items-center gap-2 text-sm font-medium text-amber-900 dark:text-amber-100">
              <Crown className="h-4 w-4 text-amber-500" />
              VIP Member
            </span>
          </div>
        )}

        <DropdownMenuSeparator />

        <Link href="/createlisting">
          <DropdownMenuItem className="cursor-pointer">
            <Plus className="mr-2 h-4 w-4 text-emerald-600 dark:text-emerald-400" />
            <span className="text-emerald-600 dark:text-emerald-400">Create Listing</span>
          </DropdownMenuItem>
        </Link>

        <DropdownMenuItem onClick={() => router.push('/wallet')} className="cursor-pointer">
          <Wallet className="mr-2 h-4 w-4 text-sky-600 dark:text-sky-400" />
          <span className="text-sky-600 dark:text-sky-400">Wallet</span>
        </DropdownMenuItem>

        {profile?.role === 'S' ? (
          <DropdownMenuItem asChild>
            <Link href="/dashboard" className="w-full cursor-pointer">
              <LayoutDashboard className="mr-2 h-4 w-4 text-amber-600 dark:text-amber-400" />
              <span className="text-amber-600 dark:text-amber-400">Dashboard</span>
            </Link>
          </DropdownMenuItem>
        ) : (
          <DropdownMenuItem asChild>
            <Link href="/mylistings" className="w-full cursor-pointer">
              <ListIcon className="mr-2 h-4 w-4 text-violet-600 dark:text-violet-400" />
              <span className="text-violet-600 dark:text-violet-400">My Listings</span>
            </Link>
          </DropdownMenuItem>
        )}

        <DropdownMenuSeparator />

        <DropdownMenuItem asChild>
          <Link href="/settings" className="flex w-full items-center cursor-pointer">
            <Settings className="mr-2 h-4 w-4" />
            <span>Account Settings</span>
          </Link>
        </DropdownMenuItem>

        <DropdownMenuItem
          onClick={handleSignOut}
          className="cursor-pointer text-red-600 dark:text-red-400 focus:text-red-600 dark:focus:text-red-400"
        >
          <LogOut className="mr-2 h-4 w-4" />
          <span>Sign out</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
