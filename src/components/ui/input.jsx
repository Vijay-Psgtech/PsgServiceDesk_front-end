import React from "react";

export const Input = React.forwardRef(({ className = "", ...props }, ref) => {
    return(
        <input 
            ref={ref}
            className={`flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${className}`}
            {...props}
        />
    );
});

Input.displayName = "Input";