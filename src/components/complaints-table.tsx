"use client";

import { createClient } from "@/lib/supabase/client";
import { useEffect, useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
import { ContentDialog } from "./ui/content-dialog";

interface Complaint {
  id: string;
  listing_id: string;
  complainant_id: string;
  accused_id: string;
  content: string;
  status: string;
  created_at: string;
  complainant: {
    first_name: string;
    last_name: string;
  };
  accused: {
    first_name: string;
    last_name: string;
  };
  listing: {
    title: string;
  };
}

export function ComplaintsTable() {
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();
  const [selectedContent, setSelectedContent] = useState<{ title: string; content: string } | null>(null);

  const fetchComplaints = async () => {
    const { data, error } = await supabase
      .from('complaint')
      .select(`
        *,
        complainant:complainant_id(first_name, last_name),
        accused:accused_id(first_name, last_name),
        listing:listing_id(title)
      `)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching complaints:', error);
      return;
    }

    setComplaints(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchComplaints();
  }, []);

  const handleStatusChange = async (complaintId: string, newStatus: string) => {
    const { error } = await supabase
      .from('complaint')
      .update({ status: newStatus })
      .eq('id', complaintId);

    if (error) {
      toast.error('Failed to update status');
      return;
    }

    toast.success('Status updated successfully');
    fetchComplaints(); // Refresh the data
  };

  const handleAction = async (complaintId: string, accusedId: string, action: string) => {
    try {
      switch (action) {
        case 'SUSPEND':
          // Temporarily suspend user's account
          const { error: suspendError } = await supabase
            .from('profile')
            .update({ account_status: 'SUSPENDED' })
            .eq('id', accusedId);
          
          if (suspendError) throw suspendError;
          toast.success('User has been suspended');
          break;

        case 'BAN':
          // Permanently ban user's account
          const { error: banError } = await supabase
            .from('profile')
            .update({ account_status: 'BANNED' })
            .eq('id', accusedId);
          
          if (banError) throw banError;
          toast.success('User has been banned');
          break;

        case 'NONE':
          // Take no action against the user
          toast.success('No action taken');
          break;
      }
      
      // Mark complaint as resolved
      await supabase
        .from('complaint')
        .update({ status: 'RESOLVED' })
        .eq('id', complaintId);

      fetchComplaints();
    } catch (error) {
      toast.error('Failed to perform action');
      console.error('Action error:', error);
    }
  };

  if (loading) {
    return <div>Loading complaints...</div>;
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Date</TableHead>
            <TableHead>Listing</TableHead>
            <TableHead>Complainant</TableHead>
            <TableHead>Accused</TableHead>
            <TableHead>Content</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Action</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {complaints.map((complaint) => (
            <TableRow key={complaint.id}>
              <TableCell>
                {new Date(complaint.created_at).toLocaleDateString()}
              </TableCell>
              <TableCell>{complaint.listing.title}</TableCell>
              <TableCell>
                {complaint.complainant.first_name} {complaint.complainant.last_name}
              </TableCell>
              <TableCell>
                {complaint.accused.first_name} {complaint.accused.last_name}
              </TableCell>
              <TableCell 
                className="max-w-xs truncate cursor-pointer hover:text-blue-500"
                onClick={() => setSelectedContent({
                  title: `Complaint about ${complaint.listing.title}`,
                  content: complaint.content
                })}
              >
                {complaint.content}
              </TableCell>
              <TableCell>
                <Select
                  defaultValue={complaint.status}
                  onValueChange={(value) => handleStatusChange(complaint.id, value)}
                >
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="PENDING">Pending</SelectItem>
                    <SelectItem value="INVESTIGATING">Investigating</SelectItem>
                    <SelectItem value="RESOLVED">Resolved</SelectItem>
                    <SelectItem value="REJECTED">Rejected</SelectItem>
                  </SelectContent>
                </Select>
              </TableCell>
              <TableCell>
                <Select
                  onValueChange={(value) => handleAction(complaint.id, complaint.accused_id, value)}
                >
                  <SelectTrigger className="w-32">
                    <SelectValue placeholder="Select action" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="NONE">No Action</SelectItem>
                    <SelectItem value="SUSPEND">Suspend User</SelectItem>
                    <SelectItem value="BAN">Ban User</SelectItem>
                  </SelectContent>
                </Select>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      {selectedContent && (
        <ContentDialog
          isOpen={!!selectedContent}
          onClose={() => setSelectedContent(null)}
          title={selectedContent.title}
          content={selectedContent.content}
        />
      )}
    </div>
  );
} 