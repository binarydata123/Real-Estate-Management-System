"use client";
import SingleProperty from "@/components/Customer/Properties/SingleProperty";
import { useParams } from "next/navigation";
import React from "react";

export default function Page() {
  const { slug } = useParams();

  return <SingleProperty propertyId={slug as string} />;
}
