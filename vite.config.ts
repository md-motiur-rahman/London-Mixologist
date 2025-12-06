import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  // Load env file based on `mode` in the current working directory.
  // Set the third parameter to '' to load all env regardless of the `VITE_` prefix.
  const env = loadEnv(mode, (process as any).cwd(), '');
  return {
    plugins: [react()],
    define: {
      // Expose API_KEY to the client-side code as process.env.API_KEY
      // Uses the provided key if no environment variable is found
      'process.env.API_KEY': JSON.stringify(env.API_KEY || 'AIzaSyDQ5b9HVTdP6dB1vZ5YM0UKWHt4fAzJjLU'),
    }
  };
});