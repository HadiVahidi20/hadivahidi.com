"use client";

import { useState } from "react";
import { motion } from "framer-motion";

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.1, duration: 0.5 },
  }),
};

export default function Contact() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: "",
  });
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">(
    "idle",
  );

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("sending");

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      if (res.ok) {
        setStatus("sent");
        setFormData({ name: "", email: "", message: "" });
        setTimeout(() => setStatus("idle"), 3000);
      } else {
        setStatus("error");
        setTimeout(() => setStatus("idle"), 3000);
      }
    } catch {
      setStatus("error");
      setTimeout(() => setStatus("idle"), 3000);
    }
  }

  return (
    <section id="contact" className="py-24 px-4">
      <div className="max-w-2xl mx-auto">
        <motion.h2
          className="text-3xl sm:text-4xl font-bold mb-4"
          style={{ fontFamily: "var(--font-display)" }}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={fadeUp}
          custom={0}
        >
          Get In Touch
        </motion.h2>
        <motion.div
          className="w-16 h-1 rounded-full mb-6"
          style={{ backgroundColor: "var(--accent)" }}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={fadeUp}
          custom={1}
        />
        <motion.p
          className="mb-10"
          style={{ color: "var(--text-light)" }}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={fadeUp}
          custom={2}
        >
          Have a project in mind or just want to say hello? I&apos;d love to hear
          from you.
        </motion.p>

        <motion.form
          onSubmit={handleSubmit}
          className="space-y-5"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={fadeUp}
          custom={3}
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div className="space-y-1.5">
              <label htmlFor="name" className="text-sm font-medium">
                Name
              </label>
              <input
                id="name"
                type="text"
                required
                value={formData.name}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, name: e.target.value }))
                }
                className="w-full px-4 py-2.5 rounded-xl text-sm transition-colors focus:outline-none focus:ring-2"
                style={{
                  backgroundColor: "var(--bg-alt)",
                  border: "1px solid var(--border-color)",
                  color: "var(--text)",
                }}
                placeholder="Your name"
              />
            </div>
            <div className="space-y-1.5">
              <label htmlFor="email" className="text-sm font-medium">
                Email
              </label>
              <input
                id="email"
                type="email"
                required
                value={formData.email}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, email: e.target.value }))
                }
                className="w-full px-4 py-2.5 rounded-xl text-sm transition-colors focus:outline-none focus:ring-2"
                style={{
                  backgroundColor: "var(--bg-alt)",
                  border: "1px solid var(--border-color)",
                  color: "var(--text)",
                }}
                placeholder="you@example.com"
              />
            </div>
          </div>
          <div className="space-y-1.5">
            <label htmlFor="message" className="text-sm font-medium">
              Message
            </label>
            <textarea
              id="message"
              required
              rows={5}
              value={formData.message}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, message: e.target.value }))
              }
              className="w-full px-4 py-2.5 rounded-xl text-sm transition-colors focus:outline-none focus:ring-2 resize-none"
              style={{
                backgroundColor: "var(--bg-alt)",
                border: "1px solid var(--border-color)",
                color: "var(--text)",
              }}
              placeholder="Tell me about your project..."
            />
          </div>

          <div className="flex items-center gap-4">
            <button
              type="submit"
              disabled={status === "sending"}
              className="w-full sm:w-auto px-8 py-3 rounded-xl text-white font-medium transition-all hover:scale-105 disabled:opacity-50"
              style={{ backgroundColor: "var(--accent)" }}
            >
              {status === "sending"
                ? "Sending..."
                : status === "sent"
                  ? "Message Sent!"
                  : "Send Message"}
            </button>
            <span aria-live="polite" className="text-sm">
              {status === "error" && (
                <span style={{ color: "#ef4444" }}>Failed to send. Please try again.</span>
              )}
            </span>
          </div>
        </motion.form>
      </div>
    </section>
  );
}
