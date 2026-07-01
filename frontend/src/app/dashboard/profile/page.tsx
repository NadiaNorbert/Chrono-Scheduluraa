"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useUser, useClerk } from "@clerk/nextjs";
import { useMutation, useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  User, Mail, Globe, Calendar, Shield,
  Loader2, LogOut, Camera,
} from "lucide-react";
import { apiClient } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { getInitials } from "@/lib/utils";

const TIMEZONES = [
  "UTC", "America/New_York", "America/Chicago", "America/Denver",
  "America/Los_Angeles", "Europe/London", "Europe/Paris", "Europe/Berlin",
  "Asia/Tokyo", "Asia/Shanghai", "Asia/Kolkata", "Australia/Sydney",
];

const profileSchema = z.object({
  displayName: z.string().min(2, "At least 2 characters").max(80).optional().or(z.literal("")),
  timezone:    z.string().optional(),
});
type ProfileValues = z.infer<typeof profileSchema>;

/** Fetch the backend user record. */
async function fetchMe() {
  const res = await apiClient.get("/api/v1/users/me");
  return res.data;
}

export default function ProfilePage() {
  const { user: clerkUser, isLoaded } = useUser();
  const { signOut } = useClerk();
  const [avatarHover, setAvatarHover] = useState(false);

  const { data: backendUser } = useQuery({
    queryKey: ["users", "me"],
    queryFn:  fetchMe,
    retry: false,
  });

  const displayName = clerkUser?.fullName
    ?? (backendUser as Record<string, string> | undefined)?.display_name
    ?? clerkUser?.primaryEmailAddress?.emailAddress
    ?? "User";

  const { register, handleSubmit, formState: { errors, isSubmitting } } =
    useForm<ProfileValues>({
      resolver: zodResolver(profileSchema),
      values: {
        displayName: (backendUser as Record<string, string> | undefined)?.display_name ?? clerkUser?.fullName ?? "",
        timezone:    (backendUser as Record<string, string> | undefined)?.timezone ?? "UTC",
      },
    });

  const updateProfile = useMutation({
    mutationFn: async (values: ProfileValues) => {
      await apiClient.patch("/api/v1/users/me", {
        display_name: values.displayName || null,
        timezone:     values.timezone || null,
      });
    },
    onSuccess: () => toast.success("Profile updated"),
    onError:   () => toast.error("Failed to update profile."),
  });

  const memberSince = clerkUser?.createdAt
    ? new Date(clerkUser.createdAt).toLocaleDateString("en-US", { month: "long", year: "numeric" })
    : "—";

  return (
    <div className="mx-auto max-w-2xl px-4 py-8 sm:px-6 lg:px-8 space-y-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">Profile</h1>
        <p className="mt-1 text-sm text-muted-foreground">Manage your account and preferences.</p>
      </div>

      {/* Avatar + name */}
      <div className="flex items-center gap-5">
        <div
          className="relative cursor-pointer"
          onMouseEnter={() => setAvatarHover(true)}
          onMouseLeave={() => setAvatarHover(false)}
        >
          <Avatar size="lg" className="size-20">
            <AvatarImage src={clerkUser?.imageUrl} alt={displayName} />
            <AvatarFallback className="text-xl">{getInitials(displayName)}</AvatarFallback>
          </Avatar>
          {avatarHover && (
            <div className="absolute inset-0 flex items-center justify-center rounded-full bg-black/40">
              <Camera className="size-5 text-white" />
            </div>
          )}
        </div>
        <div>
          <p className="text-lg font-semibold text-foreground">{displayName}</p>
          <p className="text-sm text-muted-foreground flex items-center gap-1.5 mt-0.5">
            <Mail className="size-3.5" />
            {clerkUser?.primaryEmailAddress?.emailAddress ?? "—"}
          </p>
          <p className="text-xs text-muted-foreground flex items-center gap-1.5 mt-0.5">
            <Calendar className="size-3.5" />
            Member since {memberSince}
          </p>
        </div>
      </div>

      {/* Profile form */}
      <form
        onSubmit={handleSubmit((v) => updateProfile.mutate(v))}
        className="rounded-xl bg-card ring-1 ring-foreground/5 p-6 space-y-5"
      >
        <h2 className="text-sm font-semibold text-foreground flex items-center gap-2">
          <User className="size-4 text-primary" />
          Personal information
        </h2>

        <div className="space-y-4">
          {/* Display name */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-foreground">Display name</label>
            <Input
              placeholder="How should we call you?"
              aria-invalid={!!errors.displayName}
              {...register("displayName")}
            />
            {errors.displayName && (
              <p className="text-xs text-destructive">{errors.displayName.message}</p>
            )}
          </div>

          {/* Email (read-only — managed by Clerk) */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-foreground">Email address</label>
            <div className="flex items-center gap-2">
              <Input
                value={clerkUser?.primaryEmailAddress?.emailAddress ?? ""}
                readOnly
                className="opacity-60 cursor-not-allowed"
              />
              <span className="shrink-0 rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-semibold text-primary">
                Verified
              </span>
            </div>
            <p className="text-xs text-muted-foreground">
              Email is managed by your authentication provider.
            </p>
          </div>

          {/* Timezone */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-foreground flex items-center gap-1.5">
              <Globe className="size-3.5 text-muted-foreground" />
              Timezone
            </label>
            <select
              className="w-full h-8 rounded-lg border border-input bg-transparent px-2.5 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring cursor-pointer"
              {...register("timezone")}
            >
              {TIMEZONES.map((tz) => (
                <option key={tz} value={tz}>{tz.replace(/_/g, " ")}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex justify-end">
          <Button type="submit" size="sm" disabled={isSubmitting || updateProfile.isPending}>
            {(isSubmitting || updateProfile.isPending) && <Loader2 className="size-3.5 animate-spin" />}
            Save changes
          </Button>
        </div>
      </form>

      {/* Account section */}
      <div className="rounded-xl bg-card ring-1 ring-foreground/5 p-6 space-y-4">
        <h2 className="text-sm font-semibold text-foreground flex items-center gap-2">
          <Shield className="size-4 text-primary" />
          Account
        </h2>

        <div className="flex items-center justify-between py-3 border-b border-border">
          <div>
            <p className="text-sm font-medium text-foreground">Authentication</p>
            <p className="text-xs text-muted-foreground">
              Managed by Clerk — social login and MFA available
            </p>
          </div>
          <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-semibold text-primary">
            Active
          </span>
        </div>

        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-foreground">Sign out</p>
            <p className="text-xs text-muted-foreground">Sign out of all devices</p>
          </div>
          <Button
            variant="destructive"
            size="sm"
            onClick={() => signOut({ redirectUrl: "/" })}
            className="gap-1.5"
          >
            <LogOut className="size-3.5" />
            Sign out
          </Button>
        </div>
      </div>
    </div>
  );
}
