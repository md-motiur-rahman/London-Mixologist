import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, (process as any).cwd(), '');
  return {
    plugins: [react()],
    define: {
      'process.env.API_KEY': JSON.stringify(env.API_KEY),
      'process.env.SUPABASE_URL': JSON.stringify("https://ktwsxsiffczcxxiauxby.supabase.co"),
      'process.env.SUPABASE_KEY': JSON.stringify("eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt0d3N4c2lmZmN6Y3h4aWF1eGJ5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQ3NTcxNDksImV4cCI6MjA4MDMzMzE0OX0.AxiNNilaWEEezvMkhPZZ6o67u_G5eWBvpIbX-hO7znw")
    }
  };
});