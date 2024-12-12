import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface ContentDialogProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  content: string;
}

export function ContentDialog({ isOpen, onClose, title, content }: ContentDialogProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        <div className="mt-4 text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
          {content}
        </div>
      </DialogContent>
    </Dialog>
  );
} 