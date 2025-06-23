import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'
import fs from 'fs'

// HTML files for different apps
const htmlFiles = {
  shoes: resolve(__dirname, 'shoes.html'),
  bags: resolve(__dirname, 'bags.html'),
  glasses: resolve(__dirname, 'glasses.html'),
  'shoes-bags': resolve(__dirname, 'shoes-bags.html'),
  'shoes-glasses': resolve(__dirname, 'shoes-glasses.html'),
  default: resolve(__dirname, 'index.html')
}

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const htmlFile = htmlFiles[mode as keyof typeof htmlFiles] || htmlFiles.default
  
  return {
    plugins: [
      react(),
      // Plugin to rename HTML file to index.html
      {
        name: 'rename-html',
        writeBundle(options, bundle) {
          // Find the HTML file in the bundle
          const htmlFiles = Object.keys(bundle).filter(name => name.endsWith('.html'))
          
          if (htmlFiles.length > 0 && htmlFiles[0] !== 'index.html') {
            const oldPath = resolve(options.dir || 'dist', htmlFiles[0])
            const newPath = resolve(options.dir || 'dist', 'index.html')
            
            if (fs.existsSync(oldPath)) {
              fs.renameSync(oldPath, newPath)
            }
          }
        }
      }
    ],
    build: {
      rollupOptions: {
        input: {
          main: htmlFile
        }
      },
      outDir: 'dist'
    }
  }
}) 