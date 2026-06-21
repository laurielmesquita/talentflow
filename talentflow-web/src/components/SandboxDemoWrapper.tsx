"use client";

import React from "react";
import dynamic from "next/dynamic";

const SandboxDemo = dynamic(() => import("./SandboxDemo"), { ssr: false });

export default function SandboxDemoWrapper() {
  return <SandboxDemo />;
}
