# Elspace - Full-Stack Freelancing Platform

A comprehensive Next.js 14 and Express.js full-stack application for connecting freelancers with clients.

## Project Structure

```
elspace/
├── client/                 # Next.js 14 frontend application
│   ├── public/            # Static assets
│   ├── src/
│   │   ├── app/          # Next.js App Router
│   │   ├── components/   # Reusable React components
│   │   ├── hooks/        # Custom React hooks
│   │   ├── lib/          # Utilities and configurations
│   │   ├── types/        # TypeScript type definitions
│   │   └── styles/       # Global styles and themes
│   └── package.json
│
├── server/                # Express.js backend application
│   ├── src/
│   │   ├── app.ts        # Express app setup
│   │   ├── index.ts      # Entry point
│   │   ├── config/       # Configuration files
│   │   ├── modules/      # Feature modules (DDD)
│   │   ├── middleware/   # Express middleware
│   │   ├── database/     # Database setup (Prisma, MongoDB, Redis)
│   │   ├── utils/        # Utility functions
│   │   ├── types/        # TypeScript definitions
│   │   └── ...
│   ├── tests/            # Test files
│   └── package.json
│
└── README.md
```

## Getting Started

### Prerequisites
- Node.js >= 18.0.0
- npm >= 9.0.0
- PostgreSQL (for main database)
- Redis (optional, for caching)
- MongoDB (optional, alternative to PostgreSQL)

### Client Setup

1. **Navigate to client directory:**
   ```bash
   cd elspace/client
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Set up environment variables:**
   ```bash
   cp .env.example .env.local
   # Edit .env.local with your configuration
   ```

4. **Start development server:**
   ```bash
   npm run dev
   ```

   The application will be available at `http://localhost:3000`

### Server Setup

1. **Navigate to server directory:**
   ```bash
   cd elspace/server
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Set up environment variables:**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

4. **Set up database:**
   ```bash
   # Generate Prisma client
   npm run db:generate
   
   # Run migrations
   npm run db:migrate
   
   # Seed database (optional)
   npm run db:seed
   ```

5. **Start development server:**
   ```bash
   npm run dev
   ```

   The server will be available at `http://localhost:3001`

## Key Features

### Client Features
- **Authentication**: NextAuth with JWT and OAuth
- **Projects Management**: Create, browse, and manage projects
- **Freelancer Discovery**: Search and filter freelancers
- **Messaging**: Real-time communication with Socket.io
- **1v1 Sessions**: Book paid/free sessions with video calls
- **Wallet System**: Manage funds and transactions
- **Social Feed**: Share updates and connect with others
- **Communities**: Create and join communities
- **Dispute Resolution**: Built-in conflict resolution system
- **Admin Dashboard**: Manage users, projects, and platform metrics

### Server Features
- **Identity Management**: User authentication and authorization
- **Project Management**: Project creation, proposals, and milestones
- **Payment Processing**: Stripe, PayPal, and crypto payments
- **Real-time Communication**: Socket.io for messaging and notifications
- **File Management**: Cloudinary integration for file uploads
- **Database**: Prisma ORM with PostgreSQL, MongoDB support
- **Caching**: Redis for performance optimization
- **Job Queues**: BullMQ for async task processing
- **Webhooks**: Stripe and video provider webhooks
- **Analytics**: Event tracking and reporting

## Available Scripts

### Client
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run format` - Format code with Prettier
- `npm run type-check` - Run TypeScript type checking
- `npm test` - Run tests
- `npm run test:watch` - Run tests in watch mode

### Server
- `npm run dev` - Start development server with hot reload
- `npm run build` - Build TypeScript to JavaScript
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run lint:fix` - Fix ESLint issues
- `npm run format` - Format code with Prettier
- `npm run type-check` - Run TypeScript type checking
- `npm test` - Run tests
- `npm run db:generate` - Generate Prisma client
- `npm run db:migrate` - Run database migrations
- `npm run db:seed` - Seed database with sample data

## Technology Stack

### Frontend
- **Framework**: Next.js 14 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: shadcn/ui
- **State Management**: Zustand
- **Forms**: React Hook Form + Zod
- **API Client**: Axios
- **Real-time**: Socket.io
- **Auth**: NextAuth.js
- **Video**: Daily.co

### Backend
- **Framework**: Express.js
- **Language**: TypeScript
- **Database**: PostgreSQL with Prisma
- **Alternative DB**: MongoDB with Mongoose
- **Caching**: Redis
- **Auth**: Passport.js, JWT
- **Payments**: Stripe, PayPal
- **File Upload**: Cloudinary
- **Real-time**: Socket.io
- **Job Queue**: BullMQ
- **Email**: Nodemailer
- **Testing**: Jest, Supertest
- **Logging**: Winston

## Database Schema

The Prisma schema includes models for:
- Users (with roles: ADMIN, CLIENT, FREELANCER)
- Profiles and Freelancer/Client specific data
- Projects, Proposals, and Milestones
- Messages and Conversations
- Sessions (1v1 paid/free)
- Wallet and Transactions
- Reviews and Ratings
- Social Feed, Comments, and Likes
- Communities
- Disputes and Evidence
- Notifications
- Admin audit logs

## Configuration Files

### Client Configuration
- `next.config.js` - Next.js configuration
- `tailwind.config.ts` - Tailwind CSS configuration
- `tsconfig.json` - TypeScript configuration
- `.eslintrc.json` - ESLint configuration
- `.prettierrc` - Prettier configuration
- `jest.config.js` - Jest testing configuration

### Server Configuration
- `tsconfig.json` - TypeScript configuration
- `.eslintrc.json` - ESLint configuration
- `.prettierrc` - Prettier configuration
- `jest.config.js` - Jest testing configuration
- `nodemon.json` - Nodemon configuration
- `.env.example` - Environment variables template

## Environment Variables

### Client (.env.local)
```
NEXT_PUBLIC_API_URL=http://localhost:3001
NEXT_PUBLIC_WS_URL=ws://localhost:3001
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret-key
```

### Server (.env)
```
NODE_ENV=development
PORT=3001
DATABASE_URL=postgresql://user:password@localhost:5432/elspace
JWT_SECRET=your-jwt-secret
```

See `.env.example` files for complete list of variables.

## Deployment

### Client (Vercel)
```bash
vercel deploy
```

### Server (Docker/Any Node Host)
```bash
npm run build
npm start
```

## Testing

### Run Tests
```bash
# Client tests
cd elspace/client && npm test

# Server tests
cd elspace/server && npm test
```

### Run Tests with Coverage
```bash
# Client
cd elspace/client && npm run test:coverage

# Server
cd elspace/server && npm run test:coverage
```

## Contributing

1. Create a feature branch
2. Make your changes
3. Run tests and linting
4. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

For support, open an issue on GitHub or contact the development team.

## Architecture Notes

- **Frontend**: Uses Next.js 14 App Router with client/server components
- **Backend**: RESTful API with Socket.io for real-time features
- **Database**: Prisma ORM provides type-safe database access
- **Authentication**: JWT-based with NextAuth.js on frontend, Passport.js on backend
- **Real-time**: Socket.io for messaging, notifications, and live updates
- **Async Jobs**: BullMQ for background tasks (emails, notifications, etc.)
- **File Storage**: Cloudinary for image and file uploads
- **Payments**: Stripe webhook integration for secure transactions

## Performance Optimization

- Redis caching layer for frequently accessed data
- Database query optimization with Prisma
- Image optimization with Next.js Image component
- API rate limiting
- Gzip compression
- CDN for static assets

## Security Features

- CORS protection
- Helmet.js security headers
- Password hashing with bcrypt
- JWT token authentication
- Rate limiting
- Input validation with Zod
- SQL injection prevention via Prisma
- XSS protection

---

**Elspace v1.0.0** - Building the future of freelancing
