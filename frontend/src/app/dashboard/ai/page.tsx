"use client";

import { useState, useRef } from "react";
import {
  Sparkles, Send, Loader2, RefreshCw,
  CheckSquare, CalendarDays, Flame, Target, Lightbulb,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface Message {
  id:      string;
  role:    "user" | "assistant";
  content: string;
  ts:      Date;
}

interface Suggestion {
  icon:    React.ComponentType<{ className?: string }>;
  label:   string;
  prompt:  string;
  color:   string;
}

const QUICK_SUGGESTIONS: Suggestion[] = [
  { icon: CalendarDays, label: "Plan my week",
    prompt: "Help me plan my upcoming week. I want to balance deep work, meetings, and habits.",
    color: "bg-primary/8 text-primary border-primary/20" },
  { icon: CheckSquare,  label: "Prioritise my tasks",
    prompt: "Look at my tasks and tell me what I should focus on today and why.",
    color: "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-800" },
  { icon: Flame, label: "Protect my habits",
    prompt: "I want to make sure my daily habits don't get pushed out by meetings. How should I block time?",
    color: "bg-orange-50 text-orange-700 border-orange-200 dark:bg-orange-900/20 dark:text-orange-400 dark:border-orange-800" },
  { icon: Target, label: "Review my goals",
    prompt: "Review my goals and suggest the most important next steps I should take this week.",
    color: "bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-900/20 dark:text-purple-400 dark:border-purple-800" },
];

/** Simulated AI response — replaced by real Gemini API in backend integration. */
async function simulateAIResponse(prompt: string): Promise<string> {
  await new Promise((r) => setTimeout(r, 1200 + Math.random() * 800));

  const responses: Record<string, string> = {
    week: "Here's your AI-optimised week plan:\n\n**Monday & Tuesday** — Deep work blocks 9–12 AM for your most important tasks. Schedule meetings in the afternoon only.\n\n**Wednesday** — Mid-week check-in: review task progress, adjust priorities if needed.\n\n**Thursday** — Creative and collaborative work. Good day for team syncs.\n\n**Friday** — Wrap up loose ends and do your weekly review before 3 PM.\n\nI've protected 2-hour focus blocks each morning and ensured your habits are scheduled before 8 AM. Would you like me to apply this to your calendar?",
    tasks: "Based on your current task list, here's your priority order for today:\n\n🔴 **High priority** — \"Prepare Q3 budget summary\" (due in 5 hours)\n🟡 **Medium priority** — \"Write weekly team update\" (due today)\n🟢 **Can wait** — \"Research design system options\" (flexible deadline)\n\nI recommend starting with the budget summary first — it has the tightest deadline and requires the most focused thinking. Aim for 45 minutes uninterrupted. Want me to block time for this right now?",
    habits: "To protect your habits, I recommend:\n\n1. **Morning habits (6–7:30 AM)** — Block this as \"Personal time\" in your calendar so meetings can't be scheduled here.\n\n2. **Enable buffer protection** — I'll add a 15-minute buffer after your last habit before the first meeting.\n\n3. **Evening wind-down (9–10 PM)** — Block for reading/reflection habits.\n\nYour current 7-day streak is impressive! Protecting these windows will help you maintain consistency. Shall I add these blocks to your calendar?",
    goals: "Here's your goal progress review:\n\n🚀 **Portfolio website** (60% complete) — Next step: Write 2 case studies this week. Estimated time: 3 hours.\n\n📖 **Read 12 books** (42% complete) — You're slightly behind. Aim to finish your current book by Sunday.\n\nMy suggestion: Dedicate 30 minutes each evening to reading and 90 minutes on Saturday morning to writing. This will put both goals back on track. Want me to schedule these sessions?",
  };

  const lower = prompt.toLowerCase();
  if (lower.includes("week") || lower.includes("plan"))   return responses.week;
  if (lower.includes("task") || lower.includes("prior"))  return responses.tasks;
  if (lower.includes("habit"))                             return responses.habits;
  if (lower.includes("goal"))                              return responses.goals;

  return "I've analysed your schedule and here's what I suggest:\n\nYour current week looks busy with meetings taking up **40% of your working hours**. To improve your productivity:\n\n1. Block 2-hour deep work sessions every morning before 11 AM\n2. Batch your meetings to Tuesday and Thursday afternoons\n3. Protect Friday mornings for planning and review\n\nThis pattern matches your peak energy times based on your past activity. Would you like me to apply these changes to your calendar automatically?";
}

export default function AIPage() {
  const [messages,   setMessages]   = useState<Message[]>([]);
  const [input,      setInput]      = useState("");
  const [isLoading,  setIsLoading]  = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  async function send(prompt: string) {
    if (!prompt.trim() || isLoading) return;

    const userMsg: Message = {
      id: crypto.randomUUID(), role: "user", content: prompt.trim(), ts: new Date(),
    };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsLoading(true);

    try {
      const reply = await simulateAIResponse(prompt);
      const aiMsg: Message = {
        id: crypto.randomUUID(), role: "assistant", content: reply, ts: new Date(),
      };
      setMessages((prev) => [...prev, aiMsg]);
    } finally {
      setIsLoading(false);
      setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: "smooth" }), 50);
    }
  }

  return (
    <div className="flex flex-col h-[calc(100vh-3.5rem)]">
      {/* Header */}
      <div className="px-4 sm:px-6 lg:px-8 py-5 border-b border-border shrink-0">
        <div className="flex items-center gap-3">
          <div className="flex size-9 items-center justify-center rounded-xl bg-primary text-primary-foreground">
            <Sparkles className="size-5" />
          </div>
          <div>
            <h1 className="text-lg font-semibold text-foreground">AI Planner</h1>
            <p className="text-xs text-muted-foreground">
              Powered by Gemini · Your personal scheduling assistant
            </p>
          </div>
        </div>
      </div>

      {/* Messages area */}
      <div className="flex-1 overflow-y-auto px-4 sm:px-6 lg:px-8 py-4 space-y-4">

        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full gap-8 text-center pb-8">
            <div className="space-y-2">
              <div className="flex size-16 items-center justify-center rounded-2xl bg-primary/10 mx-auto">
                <Sparkles className="size-8 text-primary" />
              </div>
              <h2 className="text-xl font-semibold text-foreground">How can I help you today?</h2>
              <p className="text-sm text-muted-foreground max-w-sm">
                Ask me anything about your schedule, tasks, or goals. I'll give you smart, personalised suggestions.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full max-w-xl">
              {QUICK_SUGGESTIONS.map((s) => {
                const Icon = s.icon;
                return (
                  <button
                    key={s.label}
                    onClick={() => send(s.prompt)}
                    className={cn(
                      "flex items-center gap-3 rounded-xl border p-3 text-left cursor-pointer",
                      "hover:shadow-sm transition-all",
                      s.color
                    )}
                  >
                    <Icon className="size-4 shrink-0" />
                    <span className="text-sm font-medium">{s.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {messages.map((msg) => (
          <div
            key={msg.id}
            className={cn("flex", msg.role === "user" ? "justify-end" : "justify-start")}
          >
            {msg.role === "assistant" && (
              <div className="flex size-7 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground mr-2 mt-0.5">
                <Sparkles className="size-3.5" />
              </div>
            )}
            <div
              className={cn(
                "max-w-[85%] rounded-2xl px-4 py-3 text-sm",
                msg.role === "user"
                  ? "bg-primary text-primary-foreground rounded-tr-sm"
                  : "bg-card ring-1 ring-foreground/5 text-foreground rounded-tl-sm"
              )}
            >
              {/* Render markdown-style bold */}
              {msg.content.split("\n").map((line, i) => {
                const formatted = line.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>");
                return (
                  <p
                    key={i}
                    className={cn("leading-relaxed", i > 0 && line === "" ? "mt-2" : i > 0 ? "mt-1" : "")}
                    dangerouslySetInnerHTML={{ __html: formatted }}
                  />
                );
              })}
              <p className="text-[10px] opacity-50 mt-2">
                {msg.ts.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })}
              </p>
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="flex items-center gap-2">
            <div className="flex size-7 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground">
              <Sparkles className="size-3.5" />
            </div>
            <div className="bg-card ring-1 ring-foreground/5 rounded-2xl rounded-tl-sm px-4 py-3">
              <div className="flex items-center gap-1.5">
                {[0, 1, 2].map((i) => (
                  <span
                    key={i}
                    className="size-1.5 rounded-full bg-muted-foreground animate-bounce"
                    style={{ animationDelay: `${i * 150}ms` }}
                  />
                ))}
              </div>
            </div>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Input bar */}
      <div className="shrink-0 border-t border-border px-4 sm:px-6 lg:px-8 py-4">
        {messages.length > 0 && (
          <div className="flex gap-2 mb-3 flex-wrap">
            {QUICK_SUGGESTIONS.slice(0, 2).map((s) => (
              <button
                key={s.label}
                onClick={() => send(s.prompt)}
                disabled={isLoading}
                className="flex items-center gap-1.5 rounded-full border border-border bg-muted/50 px-3 py-1 text-xs text-muted-foreground hover:text-foreground hover:border-primary/50 transition-colors cursor-pointer disabled:opacity-50"
              >
                <Lightbulb className="size-3" />
                {s.label}
              </button>
            ))}
          </div>
        )}

        <div className="flex items-end gap-2">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                send(input);
              }
            }}
            placeholder="Ask Chrono AI anything… (Enter to send)"
            rows={1}
            disabled={isLoading}
            className={cn(
              "flex-1 resize-none rounded-xl border border-input bg-transparent px-4 py-3 text-sm",
              "placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
              "disabled:opacity-50 max-h-40 overflow-y-auto"
            )}
            style={{ minHeight: "48px" }}
          />
          <Button
            onClick={() => send(input)}
            disabled={!input.trim() || isLoading}
            size="icon"
            className="size-12 rounded-xl shrink-0"
            aria-label="Send message"
          >
            {isLoading ? <Loader2 className="size-4 animate-spin" /> : <Send className="size-4" />}
          </Button>
        </div>
        <p className="text-center text-[10px] text-muted-foreground mt-2">
          AI responses are simulated · Real Gemini integration coming soon
        </p>
      </div>
    </div>
  );
}
