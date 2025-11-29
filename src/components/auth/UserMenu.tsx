import React, { useState } from "react";
import { Button } from "@/components/ui/button";

interface UserMenuProps {
  userEmail: string;
}

export default function UserMenu({ userEmail }: UserMenuProps) {
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async () => {
    setIsLoggingOut(true);

    try {
      // Call logout API endpoint
      const response = await fetch("/api/auth/logout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        // eslint-disable-next-line no-console
        console.error("Logout failed:", await response.text());
        setIsLoggingOut(false);
        return;
      }

      // Success - redirect to login page with success message
      window.location.href = "/login?message=logout_success";
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error("Logout error:", error);
      setIsLoggingOut(false);
    }
  };

  return (
    <div className="flex items-center gap-3">
      <span className="text-sm text-gray-600 hidden sm:inline">{userEmail}</span>
      <Button onClick={handleLogout} disabled={isLoggingOut} variant="outline" size="sm">
        {isLoggingOut ? "Wylogowywanie..." : "Wyloguj"}
      </Button>
    </div>
  );
}
