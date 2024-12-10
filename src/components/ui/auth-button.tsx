'use client';

import Link from 'next/link';
import { useAuth } from '@/app/auth/auth-context';
import { useRouter } from 'next/navigation';
import { ProfileDropdown } from './profile-dropdown';
import { Button } from './button';
import { LogIn } from 'lucide-react';

export const AuthButton = () => {
  const { user, signOut } = useAuth();
  const router = useRouter();

  const handleSignOut = async () => {
    try {
      await signOut();
      router.push('/');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  if (!user) {
    return (
        <Link href="/auth/signup">
            <Button variant="expandIcon" Icon={LogIn} iconPlacement="right">
                    Get Started
            </Button>
        </Link>
    );
  }

  return (
    <ProfileDropdown user={user}></ProfileDropdown>
  );
};