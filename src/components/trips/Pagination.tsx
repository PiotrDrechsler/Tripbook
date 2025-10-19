import React from "react";
import type { PaginationDto } from "@/types";
import { Button } from "@/components/ui/button";

interface PaginationProps {
  pagination: PaginationDto;
  onPageChange: (page: number) => void;
}

export function Pagination({ pagination, onPageChange }: PaginationProps) {
  const { page, total_pages, total } = pagination;

  const isFirstPage = page === 1;
  const isLastPage = page === total_pages;

  const handlePrevious = () => {
    if (!isFirstPage) {
      onPageChange(page - 1);
    }
  };

  const handleNext = () => {
    if (!isLastPage) {
      onPageChange(page + 1);
    }
  };

  // Don't render pagination if there's only one page or no pages
  if (total_pages <= 1) {
    return null;
  }

  return (
    <div className="flex items-center justify-between border-t border-border pt-4">
      <div className="text-sm text-muted-foreground">
        Strona <span className="font-medium">{page}</span> z <span className="font-medium">{total_pages}</span> (
        <span className="font-medium">{total}</span> wycieczek)
      </div>
      <div className="flex gap-2">
        <Button variant="outline" size="sm" onClick={handlePrevious} disabled={isFirstPage}>
          <svg
            className="size-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Poprzednia
        </Button>
        <Button variant="outline" size="sm" onClick={handleNext} disabled={isLastPage}>
          Następna
          <svg
            className="size-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </Button>
      </div>
    </div>
  );
}
