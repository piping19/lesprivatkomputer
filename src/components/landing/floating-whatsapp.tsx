"use client";

import { motion } from "framer-motion";
import { MessageCircle } from "lucide-react";
import { waLink, WA_MESSAGES } from "@/lib/site-config";

export function FloatingWhatsApp() {
  return (
    <motion.a
      href={waLink(WA_MESSAGES.general)}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Chat admin via WhatsApp"
      initial={{ opacity: 0, scale: 0 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: 1, type: "spring", stiffness: 260, damping: 18 }}
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.95 }}
      className="fixed bottom-5 right-5 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-emerald-500 text-white shadow-2xl shadow-emerald-300 transition-colors hover:bg-emerald-600 sm:bottom-6 sm:right-6"
    >
      <MessageCircle className="h-7 w-7" aria-hidden="true" />
      <span
        aria-hidden="true"
        className="absolute inset-0 -z-10 animate-ping rounded-full bg-emerald-400 opacity-30"
      />
    </motion.a>
  );
}
