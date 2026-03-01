import { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Hadi Vahidi | Portfolio",
    short_name: "Hadi Vahidi",
    description: "Front-End Developer crafting exceptional digital experiences.",
    start_url: "/",
    display: "standalone",
    background_color: "#0f172a",
    theme_color: "#6366f1",
    icons: [
      {
        src: "/icon-192.png",
        sizes: "192x192",
        type: "image/png",
      },
      {
        src: "/icon-512.png",
        sizes: "512x512",
        type: "image/png",
      },
    ],
  };
}
