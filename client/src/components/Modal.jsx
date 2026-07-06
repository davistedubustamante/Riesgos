import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';

export default function Modal({ open, onClose, title, children, footer, size = 'md' }) {
  const sizeMap = { sm: 'max-w-md', md: 'max-w-2xl', lg: 'max-w-4xl' };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className={sizeMap[size]}>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription />
        </DialogHeader>
        <div className="overflow-y-auto">{children}</div>
        {footer ? (
          <div className="flex justify-end gap-2 pt-4 border-t">{footer}</div>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}
