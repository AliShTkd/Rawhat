# Dev Server Run Doc

## How to reproduce the artifacts
1. Copy `.env.local` from the main checkout if missing (contains VITE_API_BASE_URL, etc.)
2. Ensure Node.js 22+ via nvm: `export NVM_DIR="$HOME/.nvm" && . "$NVM_DIR/nvm.sh" && nvm use 22`
3. Dependencies are pre-installed via pnpm. If not: `pnpm install`

## How to run the server
```bash
cd /home/cocoshayan/Desktop/Rawhat/front
export NVM_DIR="$HOME/.nvm" && . "$NVM_DIR/nvm.sh" && nvm use 22
node node_modules/vite/bin/vite.js --port 5173 --host 0.0.0.0
```

## Notes
- Port 5173 is the default Vite port
- No backend API server is running — API calls will fail with ERR_CONNECTION_RESET (expected)
- The app is a SolidJS SPA with @solidjs/router for client-side routing
- Pages that work: Home (/), Products (/products), Login (/login), Cart (/cart)
