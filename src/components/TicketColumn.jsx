import React from "react";
import { motion, Reorder } from "framer-motion";
import { Clock } from "lucide-react";

export default function TicketColumn ({
    title,
    color,
    dotColor,
    headerColor,
    tickets,
    onTicketClick,
}){
    return(
        <div className={`rounded-2xl border ${color} bg-white/80 shadow-lg`}>
            {/* Column Header */}
            <div className={`p-4 rounded-t-2xl font-bold ${headerColor} text-center`}>
                {title} ({tickets.length})
            </div>
            
            {/* Tickets List */}
            <div className="p-4 space-y-3">
                {tickets.length ? (
                    <Reorder.Group axis="y" values={tickets} onReorder={() => {}}>
                        {tickets.map((t, index) => {
                            const remainingTime = t.estimatedTime - t.completedTime;
                            return(
                                <Reorder.Item key={t.id} value={t}>
                                    <motion.div
                                        layout
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                        onClick={() => onTicketClick(t)}
                                        className="cursor-pointer p-3 rounded-xl bg-white border border-gray-200 shadow-sm flex flex-col gap-1 hover:shadow-md transition"
                                    >
                                        <div className="flex justify-between items-center text-sm font-medium text-indigo-700">
                                            {t.id}
                                            <span 
                                                className={`h-2.5 w-2.5 rounded-full ${dotColor}`}
                                            />
                                        </div>
                                        <div className="text-gray-700 font-semibold">{t.service}</div>
                                        <div className="flex justify-between items-center text-xs text-gray-500">
                                            <span>{t.priority}</span>
                                            <span>
                                                <Clock size={12} className="inline mr-1" />
                                                {t.status === "Resolved" ? `${t.completedTime}h`: `${remainingTime}h left` }
                                            </span>
                                        </div>
                                        <div className="text-xs text-gray-400">{t.assignedTo}</div>
                                    </motion.div>
                                </Reorder.Item>
                            )
                        })}
                    </Reorder.Group>
                ) : (
                    <p className="text-center text-gray-400 text-sm mt-4">No tickets</p>
                )}
            </div>
        </div>
    );
}