import React from "react";
import { useTrip } from "@/lib/hooks/useTrip";
import { Spinner } from "./Spinner";
import { ErrorMessage } from "./ErrorMessage";
import { NotFound } from "./NotFound";
import { TripEditForm } from "./TripEditForm";

interface TripEditContainerProps {
  id: string | undefined;
}

export default function TripEditContainer({ id }: TripEditContainerProps) {
  const { data, isLoading, error } = useTrip(id);

  // Loading state
  if (isLoading) {
    return <Spinner />;
  }

  // Error state (network errors, validation errors)
  if (error && error.error !== "Not found") {
    return <ErrorMessage message={error.message} />;
  }

  // Not found state (404)
  if (error?.error === "Not found" || !data) {
    return <NotFound message="Wycieczka o podanym ID nie istnieje" />;
  }

  // Success state with data
  return <TripEditForm trip={data} />;
}
