import React, { useState } from "react";
import { Button } from "@/components/ui/button";

interface UserMenuProps {
  userEmail: string;
}

export default function UserMenu({ userEmail }: UserMenuProps) {
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async () => {
    setIsLoggingOut(true);

    // TODO: API call will be implemented later
    // For now, just simulate the logout
    setTimeout(() => {
      console.log("Logging out user:", userEmail);
      // window.location.href = "/login?message=logout_success";
    }, 500);
  };

  return (
    <div className="flex items-center gap-4 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-lg border border-white/20">
      <span className="text-sm text-gray-700 font-medium">{userEmail}</span>
      <Button
        onClick={handleLogout}
        disabled={isLoggingOut}
        variant="outline"
        size="sm"
        className="bg-white hover:bg-gray-100"
      >
        {isLoggingOut ? "Wylogowywanie..." : "Wyloguj"}
      </Button>
    </div>
  );
}
