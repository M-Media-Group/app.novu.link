// vite.config.ts at /workspaces/app.novu.link/
import { defineConfig } from 'vite';
import path from 'path';

export default defineConfig({
    resolve: {
        alias: {
            src: path.resolve(__dirname, 'apps/main/src'),
            '@': path.resolve(__dirname, 'apps/main/src'),
        },
    },
});
