import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
 plugins: [react()],
 base: '/PJT-sales/',
 server: { 
    port: 5179, 
    strictPort: true, 
    proxy: { '/api': 'http://localhost:8088' } 
},
 preview: { 
    port: 5179, 
    strictPort: true 
},
})
