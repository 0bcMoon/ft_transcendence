import { defineConfig } from "vite";
import tailwindcss from "@tailwindcss/vite";
import path from "path"; // 1. Import path
export default defineConfig({
    build: {
        chunkSizeWarningLimit: 100,
        rollupOptions: {
            onwarn(warning, warn) {
                if (warning.code === "MODULE_LEVEL_DIRECTIVE") {
                    return;
                }
                warn(warning);
            },
        },
    },
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
