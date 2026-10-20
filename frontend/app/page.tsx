"use client";

import { useState } from "react";
import { ApiError, getStatus, injectItems } from "@/lib/pocketPoke";
import ACNHItemExplorer from "@/components/ItemExplorer";
import ItemExplorer from "@/components/ItemExplorer";

export default function HomePage() {

  return (
    <main>
      <ItemExplorer/>
    </main>
  );
}