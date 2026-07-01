"use client";

import { AlertTriangle, RefreshCw } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface DashboardErrorProps {
  /** Error message to display. Falls back to a generic string. */
  message?: string;
  /** Called when the user clicks "Try again". */
  onRetry?: () => void;
}

/**
 * Full-section error state for dashboard data-loading failures.
 * Shown when a TanStack Query returns an error.
 */
export function DashboardError({ message, onRetry }: DashboardErrorProps) {
  return (
    <Card>
      <CardContent className="flex flex-col items-center justify-center gap-4 py-12 text-center">
        <div className="flex size-12 items-center justify-center rounded-full bg-destructive/10">
          <AlertTriangle
            className="size-5 text-destructive"
            aria-hidden="true"
          />
        </div>

        <div>
          <p className="text-sm font-medium text-foreground">
            Something went wrong
          </p>
          <p className="mt-1 text-xs text-muted-foreground max-w-xs">
            {message ?? "We couldn't load your dashboard data. Please try again."}
          </p>
        </div>

        {onRetry && (
          <Button
            variant="outline"
            size="sm"
            onClick={onRetry}
            className="gap-1.5"
          >
            <RefreshCw className="size-3.5" aria-hidden="true" />
            Try again
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
