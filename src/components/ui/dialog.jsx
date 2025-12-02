import React from "react";


export const DialogOverlay = ({ className = "", ...props }) => (
  <RadixDialog.Overlay
    className={`fixed inset-0 bg-black/40 backdrop-blur-sm ${className}`}
    {...props}
  />
);

export const DialogContent = ({ className = "", children, ...props }) => (
  <RadixDialog.Content
    className={`fixed left-1/2 top-1/2 w-full max-w-md -translate-x-1/2 -translate-y-1/2 rounded-2xl bg-white p-6 shadow-xl ${className}`}
    {...props}
  >
    {children}
  </RadixDialog.Content>
);

export const DialogHeader = ({ children, className = "", ...props }) => (
  <div className={`mb-2 ${className}`} {...props}>
    {children}
  </div>
);

export const DialogTitle = ({ children, className = "", ...props }) => (
  <RadixDialog.Title
    className={`text-lg font-semibold text-gray-800 ${className}`}
    {...props}
  >
    {children}
  </RadixDialog.Title>
);

export const DialogFooter = ({ children, className = "", ...props }) => (
  <div className={`mt-6 flex justify-end gap-3 ${className}`} {...props}>
    {children}
  </div>
);

export const DialogClose = RadixDialog.Close;

