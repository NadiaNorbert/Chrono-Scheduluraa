"use client";

import { useState } from "react";
import {
  Palette, Bell, Cpu, Shield, Download,
  ChevronRight, Check,
} from "lucide-react";
import { useTheme } from "@/hooks/useTheme";
import { cn } from "@/lib/utils";

interface ToggleProps {
  checked: boolean;
  onChange: (v: boolean) => void;
  label: string;
  description?: string;
}

function Toggle({ checked, onChange, label, description }: ToggleProps) {
  return (
    <label className="flex items-start justify-between gap-4 cursor-pointer py-3 border-b border-border last:border-0">
      <div>
        <p className="text-sm font-medium text-foreground">{label}</p>
        {description && <p className="text-xs text-muted-foreground mt-0.5">{description}</p>}
      </div>
      <button
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={cn(
          "relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent",
          "transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
          checked ? "bg-primary" : "bg-muted"
        )}
      >
        <span className={cn(
          "pointer-events-none inline-block size-4 rounded-full bg-white shadow-sm",
          "transform transition-transform",
          checked ? "translate-x-4" : "translate-x-0"
        )} />
      </button>
    </label>
  );
}

interface SettingSectionProps {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  children: React.ReactNode;
}

function SettingSection({ icon: Icon, title, children }: SettingSectionProps) {
  return (
    <div className="rounded-xl bg-card ring-1 ring-foreground/5 p-6 space-y-1">
      <h2 className="text-sm font-semibold text-foreground flex items-center gap-2 mb-3">
        <Icon className="size-4 text-primary" />
        {title}
      </h2>
      {children}
    </div>
  );
}

export default function SettingsPage() {
  const { resolvedTheme, setTheme } = useTheme();

  // Notification preferences (local state — wired to backend in a future update)
  const [notifPrefs, setNotifPrefs] = useState({
    taskReminders:    true,
    habitReminders:   true,
    aiSuggestions:    true,
    weeklyDigest:     false,
    emailNotifs:      false,
  });

  // AI preferences
  const [aiPrefs, setAiPrefs] = useState({
    smartScheduling:  true,
    focusBlocks:      true,
    deadlineWarnings: true,
    habitNudges:      false,
  });

  const toggle = (obj: Record<string, boolean>, key: string) => ({
    ...obj, [key]: !obj[key],
  });

  return (
    <div className="mx-auto max-w-2xl px-4 py-8 sm:px-6 lg:px-8 space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">Settings</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Customise Chrono Schedulura to fit your workflow.
        </p>
      </div>

      {/* Appearance */}
      <SettingSection icon={Palette} title="Appearance">
        <div className="space-y-3">
          <p className="text-sm font-medium text-foreground">Theme</p>
          <div className="flex items-center gap-2">
            {(["light", "dark", "system"] as const).map((t) => (
              <button
                key={t}
                onClick={() => setTheme(t)}
                className={cn(
                  "flex items-center gap-2 rounded-lg border px-3 py-2 text-sm cursor-pointer transition-all",
                  resolvedTheme === t || (t === "system" && !["light", "dark"].includes(resolvedTheme ?? ""))
                    ? "border-primary bg-primary/8 text-primary font-medium"
                    : "border-border text-muted-foreground hover:border-primary/50"
                )}
              >
                {resolvedTheme === t && <Check className="size-3.5" />}
                <span className="capitalize">{t}</span>
              </button>
            ))}
          </div>
        </div>
      </SettingSection>

      {/* Notifications */}
      <SettingSection icon={Bell} title="Notifications">
        <Toggle
          checked={notifPrefs.taskReminders}
          onChange={(v) => setNotifPrefs({ ...notifPrefs, taskReminders: v })}
          label="Task reminders"
          description="Get notified before task due dates"
        />
        <Toggle
          checked={notifPrefs.habitReminders}
          onChange={(v) => setNotifPrefs({ ...notifPrefs, habitReminders: v })}
          label="Habit reminders"
          description="Daily prompts to complete your habits"
        />
        <Toggle
          checked={notifPrefs.aiSuggestions}
          onChange={(v) => setNotifPrefs({ ...notifPrefs, aiSuggestions: v })}
          label="AI suggestions"
          description="Smart scheduling recommendations from Chrono"
        />
        <Toggle
          checked={notifPrefs.weeklyDigest}
          onChange={(v) => setNotifPrefs({ ...notifPrefs, weeklyDigest: v })}
          label="Weekly digest"
          description="A summary of your week every Monday morning"
        />
        <Toggle
          checked={notifPrefs.emailNotifs}
          onChange={(v) => setNotifPrefs({ ...notifPrefs, emailNotifs: v })}
          label="Email notifications"
          description="Receive important updates by email"
        />
      </SettingSection>

      {/* AI Planner */}
      <SettingSection icon={Cpu} title="AI Planner">
        <Toggle
          checked={aiPrefs.smartScheduling}
          onChange={(v) => setAiPrefs(toggle(aiPrefs, "smartScheduling") as typeof aiPrefs)}
          label="Smart scheduling"
          description="Let AI automatically schedule tasks into your calendar"
        />
        <Toggle
          checked={aiPrefs.focusBlocks}
          onChange={(v) => setAiPrefs(toggle(aiPrefs, "focusBlocks") as typeof aiPrefs)}
          label="Focus block suggestions"
          description="AI suggests protected time blocks for deep work"
        />
        <Toggle
          checked={aiPrefs.deadlineWarnings}
          onChange={(v) => setAiPrefs(toggle(aiPrefs, "deadlineWarnings") as typeof aiPrefs)}
          label="Deadline warnings"
          description="Get warned when deadlines are at risk"
        />
        <Toggle
          checked={aiPrefs.habitNudges}
          onChange={(v) => setAiPrefs(toggle(aiPrefs, "habitNudges") as typeof aiPrefs)}
          label="Habit nudges"
          description="AI reminds you when you're about to break a streak"
        />
      </SettingSection>

      {/* Privacy & Data */}
      <SettingSection icon={Shield} title="Privacy & Data">
        <div className="space-y-2">
          {[
            { label: "Export my data", desc: "Download all your tasks, events, and habits as JSON" },
            { label: "Delete account", desc: "Permanently delete your account and all data", danger: true },
          ].map(({ label, desc, danger }) => (
            <button
              key={label}
              className={cn(
                "w-full flex items-center justify-between py-3 border-b border-border last:border-0",
                "text-left hover:bg-muted/40 rounded-lg px-2 -mx-2 transition-colors cursor-pointer"
              )}
            >
              <div>
                <p className={cn("text-sm font-medium", danger ? "text-destructive" : "text-foreground")}>
                  {label}
                </p>
                <p className="text-xs text-muted-foreground mt-0.5">{desc}</p>
              </div>
              <ChevronRight className="size-4 text-muted-foreground shrink-0" />
            </button>
          ))}
        </div>
      </SettingSection>

      {/* App version */}
      <p className="text-center text-xs text-muted-foreground pt-2">
        Chrono Schedulura v1.0.0 · Built with ❤️
      </p>
    </div>
  );
}
