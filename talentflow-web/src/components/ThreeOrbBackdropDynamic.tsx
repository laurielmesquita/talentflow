"use client";

import dynamic from "next/dynamic";

const ThreeOrbBackdrop = dynamic(() => import("@/components/ThreeOrbBackdrop"), {
  ssr: false,
});

export default function ThreeOrbBackdropDynamic() {
  return <ThreeOrbBackdrop />;
}
