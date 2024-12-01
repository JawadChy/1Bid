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
} from "@/components/ui/dropdown-menu";
import { createClient } from "@/lib/supabase/client";
import { User } from "@supabase/supabase-js";

interface UserProfile {
  id: string;
  first_name: string;
  last_name: string;
}

interface UserProfileDropdownProps {
  user: User;
}

export function ProfileDropdown({ user }: UserProfileDropdownProps) {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const supabase = createClient();
  const router = useRouter();

  useEffect(() => {
    async function getProfile() {
      try {
        const { data, error } = await supabase
          .from("profile")
          .select("id, first_name, last_name")
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
        Hi, {profile?.first_name}
    </DropdownMenu>
  );
}
