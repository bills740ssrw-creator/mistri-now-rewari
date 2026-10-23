import type { MetadataRoute } from "next";
import { BRAND } from "@/lib/constants";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: BRAND.name,
    short_name: "Mistri Now",
    description:
      "Book verified home-service professionals in Rewari — plumbing, electrical, RO and AC.",
    start_url: "/",
    display: "standalone",
    background_color: "#fdfbf6",
    theme_color: "#0a805b",
    lang: "en-IN",
    categories: ["shopping", "business"],
    icons: [
      { src: "/icon.svg", sizes: "any", type: "image/svg+xml", purpose: "any" },
    ],
  };
}
