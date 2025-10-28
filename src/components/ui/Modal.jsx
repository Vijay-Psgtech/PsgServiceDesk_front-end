import React from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function Modal({ open, onClose, children }){
    return(
        <AnimatePresence>
            {open && (
                <>
                    {/*Overlay*/}
                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 0.5 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black z-40"
                        onClick={onClose}
                    />
                    {/*Modal Content*/}
                    <motion.div
                        initial={{ opacity: 0, y: 50 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 50 }}
                        className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-white p-6 rounded-2xl shadow-lg z-50 w-full max-w-md"
                    >
                        {children}
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
} 