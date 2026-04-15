# Elspace Development Guide

## Quick Start Guide

### 1. Clone and Set Up

```bash
# Clone the repository
git clone <repository-url>
cd elspace

# Set up client
cd client
npm install
cp .env.example .env.local
npm run dev

# In another terminal, set up server
cd ../server
npm install
cp .env.example .env

# Set up database
npm run db:generate
npm run db:migrate
npm run db:seed

# Start server
npm run dev
```

### 2. Project Structure Overview

#### Client (`/client`)
- **`src/app`** - Next.js pages and routes (App Router)
- **`src/components`** - React components organized by feature
- **`src/hooks`** - Custom React hooks
- **`src/lib`** - Utilities, API clients, and stores
- **`src/types`** - TypeScript type definitions
- **`src/styles`** - Global styles and Tailwind config

Key files:
- `next.config.js` - Next.js configuration
- `tailwind.config.ts` - Tailwind CSS configuration
- `.env.example` - Environment variables template

#### Server (`/server`)
- **`src/app.ts`** - Express application setup
- **`src/config`** - Configuration for database, auth, email, etc.
- **`src/modules`** - Feature modules (Domain-Driven Design)
  - Each module has: controller, service, routes, model, validation, dto
- **`src/middleware`** - Express middleware
- **`src/database`** - Database setup (Prisma, MongoDB, Redis)
- **`src/utils`** - Utility functions
- **`src/websocket`** - Socket.io setup and handlers
- **`tests`** - Unit, integration, and e2e tests

Key files:
- `src/index.ts` - Server entry point
- `tsconfig.json` - TypeScript configuration
- `prisma/schema.prisma` - Database schema
- `.env.example` - Environment variables template

### 3. Common Development Tasks

#### Adding a New Feature (Module)

**Backend:**
1. Create a new module directory in `src/modules/{feature}`
2. Create: `{feature}.controller.ts`, `{feature}.service.ts`, `{feature}.routes.ts`
3. Create DTOs in `dto/` directory
4. Add validation logic
5. Create tests in `tests/`

**Frontend:**
1. Create page in `src/app/{route}/page.tsx`
2. Create components in `src/components/{feature}/`
3. Create types in `src/types/{feature}.types.ts`
4. Create API hooks in `src/lib/api/{feature}.ts`
5. Create Zustand store if needed in `src/lib/stores/{feature}Store.ts`

#### Modifying Database Schema

1. Edit `server/src/database/prisma/schema.prisma`
2. Create migration:
   ```bash
   npm run db:migrate
   ```
3. Generate Prisma client:
   ```bash
   npm run db:generate
   ```

#### Running Tests

```bash
# Client tests
cd client && npm test

# Server tests
cd server && npm test

# With coverage
npm run test:coverage
```

#### Code Formatting

```bash
# Client
cd client && npm run format

# Server
cd server && npm run format
```

#### Linting

```bash
# Client
cd client && npm run lint

# Server
cd server && npm run lint
cd server && npm run lint:fix
```

### 4. Environment Variables

**Client** (`.env.local`):
```
NEXT_PUBLIC_API_URL=http://localhost:3001
NEXT_PUBLIC_WS_URL=ws://localhost:3001
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=dev-secret-key-change-in-production
```

**Server** (`.env`):
```
NODE_ENV=development
PORT=3001
DATABASE_URL=postgresql://user:password@localhost:5432/elspace
JWT_SECRET=dev-jwt-secret-key-change-in-production
REDIS_URL=redis://localhost:6379
```

### 5. Database Setup (PostgreSQL)

```bash
# Install PostgreSQL (if not already installed)
# macOS with Homebrew
brew install postgresql

# Start PostgreSQL service
brew services start postgresql

# Create database
createdb elspace

# Update DATABASE_URL in .env
DATABASE_URL="postgresql://postgres:password@localhost:5432/elspace"

# Run migrations
cd server && npm run db:migrate

# Optional: Seed database
npm run db:seed
```

### 6. API Routes

All API routes in server follow RESTful conventions:

```
GET    /api/{resource}           - List all
GET    /api/{resource}/:id       - Get one
POST   /api/{resource}           - Create
PUT    /api/{resource}/:id       - Update
DELETE /api/{resource}/:id       - Delete
```

### 7. Authentication Flow

**Client:**
1. User fills login form
2. NextAuth handles authentication
3. JWT token stored in session
4. Axios client includes token in requests

**Server:**
1. JWT middleware verifies token
2. User info attached to request
3. Route handlers process authenticated request

### 8. Real-time Features (Socket.io)

Client connects on app load:
```typescript
const socket = io(process.env.NEXT_PUBLIC_WS_URL);
socket.on('message:new', (data) => {
  // Handle new message
});
```

Server listens for connections:
```typescript
io.on('connection', (socket) => {
  socket.on('message:send', (data) => {
    // Broadcast to relevant users
  });
});
```

### 9. File Upload

Using Cloudinary:
1. Configure in `server/.env`: `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`
2. Use upload endpoint: `POST /api/upload`
3. Client receives URL for display

### 10. Payment Integration

Using Stripe:
1. Configure in `.env`: `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`
2. Create payment session endpoint
3. Handle webhook for payment confirmation
4. Update wallet balance

### 11. Debugging

**Client:**
- Browser DevTools (F12)
- React DevTools extension
- NextAuth debugging in browser console

**Server:**
- VS Code debugger
- Console logs with Winston logger
- Postman for API testing

### 12. Useful Commands Reference

```bash
# Client
npm run dev              # Start dev server
npm run build            # Build for production
npm test                 # Run tests
npm run type-check       # Type check
npm run lint             # Lint code
npm run format           # Format code

# Server
npm run dev              # Start with hot reload
npm run build            # Build TypeScript
npm test                 # Run tests
npm run db:migrate       # Run migrations
npm run db:generate      # Generate Prisma client
npm run db:seed          # Seed database
```

### 13. Troubleshooting

**"Cannot find module" error:**
- Check path aliases in `tsconfig.json`
- Ensure all imports use correct paths
- Run `npm install` to install dependencies

**Database connection error:**
- Verify `DATABASE_URL` in `.env`
- Check PostgreSQL is running
- Ensure database exists

**Port already in use:**
- Change PORT in `.env` (default 3001)
- Or kill process: `lsof -ti:3001 | xargs kill -9`

**CORS error:**
- Check `CORS_ORIGIN` in server `.env`
- Ensure client URL matches

### 14. Performance Tips

- Use React DevTools Profiler to identify slow components
- Check Network tab for slow API calls
- Use Redis for caching frequently accessed data
- Optimize database queries with Prisma
- Enable image optimization in Next.js

### 15. Security Checklist

- [ ] Change JWT secrets in production
- [ ] Enable HTTPS in production
- [ ] Set secure cookies
- [ ] Enable rate limiting
- [ ] Validate all inputs
- [ ] Use environment variables for secrets
- [ ] Regular security audits
- [ ] Keep dependencies updated

---

Happy coding! 🚀

For more details, see [README.md](./README.md)
