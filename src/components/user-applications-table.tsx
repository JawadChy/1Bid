"use client";

import { createClient } from "@/lib/supabase/client";
import { useEffect, useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "./ui/button";
import { toast } from "react-hot-toast";
import { Check, X } from "lucide-react";

interface Application {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  password: string;
  status: string;
  created_at: string;
}

export function UserApplicationsTable() {
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  const fetchApplications = async () => {
    const { data, error } = await supabase
      .from('applications')
      .select('*')
      .eq('status', 'PENDING')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching applications:', error);
      return;
    }

    setApplications(data || []);
    setLoading(false);
  };

  useEffect(() => {
    fetchApplications();

    // Set up real-time subscription for applications
    const channel = supabase
      .channel('applications_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'applications',
          filter: 'status=eq.PENDING'
        },
        () => {
          fetchApplications();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const handleApplication = async (application: Application, status: 'APPROVED' | 'DENIED') => {
    try {
      // Optimistic update
      setApplications(prev => 
        prev.filter(app => app.id !== application.id)
      );

      if (status === 'APPROVED') {
        // Create the user in auth.users - Supabase will send confirmation email automatically
        const { data: authData, error: signUpError } = await supabase.auth.signUp({
          email: application.email,
          password: application.password,
        });

        if (signUpError) throw signUpError;
        if (!authData.user?.id) throw new Error('No user ID returned from signup');

        // Create profile with the auth user's ID
        const { error: profileError } = await supabase
          .from('profile')
          .insert([{
            id: authData.user.id,
            first_name: application.first_name,
            last_name: application.last_name,
            wallet_bal: 0,
            account_status: 'ACTIVE'
          }]);

        if (profileError) throw profileError;
      }

      // Update application status
      const { error: updateError } = await supabase
        .from('applications')
        .update({ status })
        .eq('id', application.id);

      if (updateError) throw updateError;

      toast.success(
        status === 'APPROVED' 
          ? '🎉 User Accepted! Confirmation Email Sent'
          : '✅ Application Denied',
        { duration: 5000 }
      );

    } catch (error) {
      // Revert optimistic update on error
      console.error('Action error:', error);
      toast.error('Failed to process application');
      fetchApplications(); // Refresh the actual data
    }
  };

  if (loading) {
    return <div>Loading applications...</div>;
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {applications.map((application) => (
            <TableRow key={application.id}>
              <TableCell>
                {application.first_name} {application.last_name}
              </TableCell>
              <TableCell>{application.email}</TableCell>
              <TableCell className="flex gap-2">
                <Button
                  onClick={() => handleApplication(application, 'APPROVED')}
                  variant="outline"
                  className="bg-green-500/10 hover:bg-green-500/20 text-green-600"
                >
                  <Check className="w-4 h-4 mr-1" />
                  Approve
                </Button>
                <Button
                  onClick={() => handleApplication(application, 'DENIED')}
                  variant="outline"
                  className="bg-red-500/10 hover:bg-red-500/20 text-red-600"
                >
                  <X className="w-4 h-4 mr-1" />
                  Deny
                </Button>
              </TableCell>
            </TableRow>
          ))}
          {applications.length === 0 && (
            <TableRow>
              <TableCell colSpan={3} className="text-center text-gray-500">
                No pending applications
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
} 