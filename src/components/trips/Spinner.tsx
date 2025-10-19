import React from "react";

export function Spinner() {
  return (
    <div className="flex items-center justify-center py-12">
      <div className="relative">
        <div className="size-12 rounded-full border-4 border-muted"></div>
        <div className="absolute inset-0 size-12 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
      </div>
    </div>
  );
}
