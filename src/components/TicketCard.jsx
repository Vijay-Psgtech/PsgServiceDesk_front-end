import React from "react";
import { motion } from "framer-motion";
import { MessageCircle, Edit3, MoreHorizontal, Loader2 } from "lucide-react";

export default function TicketCard({ ticket }){
    const isWorking = ticket.status === "In Progress";
    return(
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="bg-white boreder border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-all duration-300 p-3 cursor-pointer group relative overflow-hidden"
        >
            {/* Animated Border for Active tickets */}
            {isWorking && (
                <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 0.5 }}
                    transition={{ duration: 0.8, repeat: Infinity, repeatType: "mirror" }}
                    className="absolute inset-0 rounded-lg bg-gradient-to-r from-rose-200 via-pink-100 to-rose-200 pointer-events-none"
                />
            )}

            {/* Priority + menu */}
            <div className="flex justify-between items-center mb-1 relative z-10">
                <span 
                    className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                        ticket.priority === "High" 
                        ? "bg-red-100 text-red-600"
                        : ticket.priority === "Medium"
                        ? "bg-yellow-100 text-yellow-600"
                        : "bg-green-100 text-green-600"
                    }`}
                >
                    {ticket.priority}
                </span>
                <MoreHorizontal 
                    size={16}
                    className="text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity"
                />
            </div>

            {/* Ticket title */}
            <h3 className="text-sm font-semibold text-gray-800 mb-1 relative z-10">
                #{ticket.code || ticket.id}
            </h3>
            <p className="text-xs text-gray-500 truncate mb-3 relative z-10">
                {ticket.title || ticket.description}
            </p>

            {/* Working Status Animation */}
            {isWorking && (
                <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.6, ease: "easeInOut" }}
                    className="flex items-center gap-2 mb-3 relative z-10"
                >
                    <Loader2 
                        size={14}
                        className="animate-spin text-rose-500"
                        strokeWidth={2.5}
                    />
                    <span className="text-xs font-medium text-rose-600 animate-pulse">
                        Working...
                    </span>
                </motion.div>
            )}

            {/* Footer */}
            <div className="flex justify-between items-center relative z-10">
                {/* User avatar */}
                <div className="flex -space-x-1">
                    <div className="w-6 h-6 rounded-full bg-rose-200 flex items-center justify-center text-xs font-bold text-rose-700">
                        {ticket.assignee?.chartAt(0) || "U"}
                    </div>
                </div>

                {/* Icons */}
                <div className="flex gap-2 text-gray-400">
                    <MessageCircle 
                        size={16}
                        className="hover:text-rose-600 cursor-pointer"
                    />
                    <Edit3 size={16} className="hover:text-rose-600 cursor-pointer" />
                </div>
            </div>
        </motion.div>
    );
}