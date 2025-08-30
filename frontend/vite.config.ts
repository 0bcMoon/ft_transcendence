import { defineConfig } from "vite";
import tailwindcss from "@tailwindcss/vite";
import path from "path"; // 1. Import path
export default defineConfig({
    plugins: [tailwindcss()],
    resolve: {
        alias: {
            "@": path.resolve(__dirname, "src"),
            "#root": path.resolve(__dirname),
        },
    },
});
