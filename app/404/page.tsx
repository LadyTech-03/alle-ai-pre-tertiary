"use client";

import { NotFoundPage } from "@/components/features/not-found/404";

export default function NotFoundPage404() {
  return (
    <NotFoundPage
      title="Page Not Found"
      description="Oops! Looks like you've ventured into uncharted territory."
      showHomeButton={true}
    />
  );
}
