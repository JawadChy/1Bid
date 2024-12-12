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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from 'react-hot-toast';

interface Application {
  id: string;
  first_name: string;
  last_name: string;
  created_at: string;
  title: string;
  phone: string;
  email: string;
  referred_by: string;
  country: string;
  rating: number;
  status: string;
}

export function SuperApplicationsTable() {
  const [applications, setApplications] = useState<Application[]>([]);
  const [selectedApp, setSelectedApp] = useState<Application | null>(null);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    fetchApplications();
  }, []);

  const fetchApplications = async () => {
    const { data, error } = await supabase
      .from('superapplication')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching applications:', error);
      return;
    }

    setApplications(data || []);
    setLoading(false);
  };

  const handleAction = async (id: string, action: 'APPROVED' | 'DENIED') => {
    try {
      const response = await fetch('/api/superapplication', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          application_id: id,
          status: action
        })
      });

      if (!response.ok) throw new Error('Failed to update application');

      toast.success(`Application ${action.toLowerCase()}`);
      fetchApplications();
    } catch (error) {
      console.error('Error:', error);
      toast.error('Failed to process application');
    }
  };

  return (
    <>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Date</TableHead>
            <TableHead>Name</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {applications.map((app) => (
            <TableRow key={app.id}>
              <TableCell>
                {new Date(app.created_at).toLocaleDateString()}
              </TableCell>
              <TableCell>
                {app.first_name} {app.last_name}
              </TableCell>
              <TableCell>{app.status}</TableCell>
              <TableCell className="space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSelectedApp(app)}
                >
                  View
                </Button>
                {app.status === 'PENDING' && (
                  <>
                    <Button
                      size="sm"
                      onClick={() => handleAction(app.id, 'APPROVED')}
                    >
                      Accept
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleAction(app.id, 'DENIED')}
                    >
                      Deny
                    </Button>
                  </>
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <Dialog open={!!selectedApp} onOpenChange={() => setSelectedApp(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Application Details</DialogTitle>
          </DialogHeader>
          {selectedApp && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Title</label>
                  <p>{selectedApp.title}</p>
                </div>
                <div>
                  <label className="text-sm font-medium">Name</label>
                  <p>{selectedApp.first_name} {selectedApp.last_name}</p>
                </div>
                <div>
                  <label className="text-sm font-medium">Email</label>
                  <p>{selectedApp.email}</p>
                </div>
                <div>
                  <label className="text-sm font-medium">Phone</label>
                  <p>{selectedApp.phone}</p>
                </div>
                <div>
                  <label className="text-sm font-medium">Country</label>
                  <p>{selectedApp.country}</p>
                </div>
                <div>
                  <label className="text-sm font-medium">Referred By</label>
                  <p>{selectedApp.referred_by || 'N/A'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium">Rating</label>
                  <p>{selectedApp.rating || 'N/A'}</p>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
} 