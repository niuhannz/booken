import * as React from "react"

const AlertDialog = ({ children, open, onOpenChange }: { children: React.ReactNode; open?: boolean; onOpenChange?: (open: boolean) => void }) => {
  const [isOpen, setIsOpen] = React.useState(open ?? false);
  React.useEffect(() => { if (open !== undefined) setIsOpen(open); }, [open]);
  const handleOpenChange = (v: boolean) => { setIsOpen(v); onOpenChange?.(v); };
  return <>{React.Children.map(children, child => React.isValidElement(child) ? React.cloneElement(child as React.ReactElement<any>, { __open: isOpen, __onOpenChange: handleOpenChange }) : child)}</>;
};

const AlertDialogTrigger = ({ children, __open, __onOpenChange, ...props }: any) => (
  <span onClick={() => __onOpenChange?.(true)} {...props}>{children}</span>
);

const AlertDialogContent = ({ children, __open, __onOpenChange, ...props }: any) => {
  if (!__open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="fixed inset-0 bg-black/50" onClick={() => __onOpenChange?.(false)} />
      <div className="relative z-50 w-full max-w-lg rounded-lg bg-white p-6 shadow-lg" {...props}>{children}</div>
    </div>
  );
};

const AlertDialogHeader = ({ children, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className="flex flex-col space-y-2 text-center sm:text-left" {...props}>{children}</div>
);

const AlertDialogTitle = ({ children, ...props }: React.HTMLAttributes<HTMLHeadingElement>) => (
  <h2 className="text-lg font-semibold" {...props}>{children}</h2>
);

const AlertDialogDescription = ({ children, ...props }: React.HTMLAttributes<HTMLParagraphElement>) => (
  <p className="text-sm text-gray-500" {...props}>{children}</p>
);

const AlertDialogAction = ({ children, ...props }: React.ButtonHTMLAttributes<HTMLButtonElement>) => (
  <button className="inline-flex h-10 items-center justify-center rounded-md bg-black px-4 py-2 text-sm font-semibold text-white" {...props}>{children}</button>
);

const AlertDialogCancel = ({ children, ...props }: React.ButtonHTMLAttributes<HTMLButtonElement>) => (
  <button className="inline-flex h-10 items-center justify-center rounded-md border px-4 py-2 text-sm font-semibold" {...props}>{children}</button>
);

export { AlertDialog, AlertDialogTrigger, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogAction, AlertDialogCancel };
