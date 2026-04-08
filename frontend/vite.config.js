import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default defineConfig({
	plugins: [react()],
	resolve: {
		alias: {
			'@': path.resolve(__dirname, './src'),
			'@components': path.resolve(__dirname, './src/components'),
			'@features': path.resolve(__dirname, './src/features'),
			'@pages': path.resolve(__dirname, './src/pages'),
			'@services': path.resolve(__dirname, './src/services'),
			'@utils': path.resolve(__dirname, './src/utils'),
			'@hooks': path.resolve(__dirname, './src/hooks'),
			'@assets': path.resolve(__dirname, './src/assets'),
		},
	},
	server: {
		port: 3000,
		proxy: {
			'/api': {
				target: 'http://localhost:8080',
				changeOrigin: true,
			},
			'/uploads': {
				target: 'http://localhost:8080',
				changeOrigin: true,
			},
		},
	},
});
