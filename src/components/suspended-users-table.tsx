'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import toast from 'react-hot-toast';

interface SuspendedUser {
  id: string;
  first_name: string;
  last_name: string;
  suspension_count: number;
  account_status: string;
}

export function SuspendedUsersTable() {
  const [users, setUsers] = useState<SuspendedUser[]>([]);
  const supabase = createClient();

  useEffect(() => {
    fetchSuspendedUsers();
  }, []);

  const fetchSuspendedUsers = async () => {
    const { data, error } = await supabase
      .from('profile')
      .select('*')
      .eq('is_suspended', true)
      .order('suspension_count', { ascending: false });

    if (error) {
      console.error('Error fetching suspended users:', error);
      return;
    }

    setUsers(data || []);
  };

  const handleReactivate = async (userId: string) => {
    try {
      const { error } = await supabase
        .from('profile')
        .update({
          is_suspended: false,
          account_status: 'ACTIVE'
        })
        .eq('id', userId);

      if (error) throw error;

      toast.success('User reactivated successfully');
      fetchSuspendedUsers();
    } catch (error) {
      console.error('Error:', error);
      toast.error('Failed to reactivate user');
    }
  };

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Name</TableHead>
          <TableHead>Suspension Count</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {users.map((user) => (
          <TableRow key={user.id}>
            <TableCell>
              {user.first_name} {user.last_name}
            </TableCell>
            <TableCell>{user.suspension_count}</TableCell>
            <TableCell>{user.account_status}</TableCell>
            <TableCell>
              <Button
                size="sm"
                onClick={() => handleReactivate(user.id)}
              >
                Reactivate
              </Button>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
} 