"use client";
import SingleProperty from "@/components/Agent/Properties/SingleProperty";
import { useParams } from "next/navigation";
import React from "react";

export default function Page() {
  // get id from url edit-property/48973242
  const { slug } = useParams();

  return <SingleProperty propertyId={slug as string} />;
}
