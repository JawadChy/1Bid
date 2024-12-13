import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "./dialog";
import { Button } from "./button";
import { Textarea } from "./textarea";
import { useState, useEffect } from "react";
import { toast } from "react-hot-toast";
import { createClient } from "@/lib/supabase/client";

interface ComplaintDialogProps {
  isOpen: boolean;
  onClose: () => void;
  listingId?: string;
  accusedId?: string;
}

export function ComplaintDialog({ isOpen, onClose, listingId, accusedId }: ComplaintDialogProps) {
  if (!listingId || !accusedId) {
    return null;
  }

  const [content, setContent] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [existingComplaint, setExistingComplaint] = useState(false);
  const supabase = createClient();

  useEffect(() => {
    const checkExistingComplaint = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('complaint')
        .select('id')
        .match({
          listing_id: listingId,
          complainant_id: user.id,
          accused_id: accusedId
        })
        .single();

      if (data) {
        setExistingComplaint(true);
      }
    };

    if (isOpen) {
      checkExistingComplaint();
    }
  }, [isOpen, listingId, accusedId, supabase]);

  const handleSubmit = async () => {
    if (!content.trim()) {
      toast.error("Please enter your complaint");
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch("/api/complaints", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          listing_id: listingId,
          accused_id: accusedId,
          content: content.trim()
        })
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to submit complaint");
      }

      toast.success("Complaint submitted successfully");
      onClose();
      setContent("");
      setExistingComplaint(true);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to submit complaint");
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Submit a Complaint</DialogTitle>
        </DialogHeader>
        {existingComplaint ? (
          <div className="text-center py-4 text-red-500">
            You have already submitted a complaint for this listing.
          </div>
        ) : (
          <>
            <Textarea
              placeholder="Describe your complaint..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="min-h-[150px]"
            />
            <DialogFooter>
              <Button variant="outline" onClick={onClose}>Cancel</Button>
              <Button 
                variant="destructive" 
                onClick={handleSubmit}
                disabled={isSubmitting}
              >
                {isSubmitting ? "Submitting..." : "Submit Complaint"}
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
} 