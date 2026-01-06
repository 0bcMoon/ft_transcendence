import { defineConfig } from "vite";
import tailwindcss from "@tailwindcss/vite";
import path from "path"; // 1. Import path
export default defineConfig({
    server: {
        port: 5173,
        proxy: {
            "/api": {
                target: "http://localhost:3000",
                changeOrigin: true,
            },
            "/public": {
                target: "http://localhost:3000",
                changeOrigin: true,
            },
        },
    },

    plugins: [tailwindcss()],
    resolve: {
        alias: {
            "@": path.resolve(__dirname, "src"),
            "#root": path.resolve(__dirname),
        },
    },
});
