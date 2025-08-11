# Overview

ClassikLust is an anime-themed idle clicker game built as a modern web application. The game features character collection, upgrade systems, chat functionality, and administrative tools. Players tap to earn points, unlock characters, purchase upgrades, and interact with AI-powered character personalities through a chat system.

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite for development and production builds
- **Routing**: Wouter for client-side routing
- **State Management**: TanStack Query (React Query) for server state management
- **UI Framework**: Radix UI components with shadcn/ui design system
- **Styling**: Tailwind CSS with custom game-themed variables and gradients
- **Component Structure**: Modular component architecture with separate pages for game, admin, and error handling

## Backend Architecture
- **Runtime**: Node.js with Express.js server
- **Language**: TypeScript with ES modules
- **API Design**: RESTful API endpoints organized by feature domains
- **File Structure**: Monorepo structure with shared schema between client and server
- **Development**: Hot module replacement via Vite integration in development mode

## Data Storage Solutions
- **Database**: PostgreSQL with Drizzle ORM for type-safe database operations
- **Database Provider**: Neon Database (configured via DATABASE_URL)
- **Schema Management**: Shared TypeScript schema definitions between frontend and backend
- **Migrations**: Drizzle Kit for database migrations and schema evolution
- **Data Models**: Users, characters, upgrades, chat messages, game stats, and media files

## Key Game Systems
- **Core Gameplay**: Tap-to-earn mechanics with energy system and cooldowns
- **Character System**: Unlockable characters with level requirements and personality traits
- **Upgrade System**: Progressive upgrade paths with level and prerequisite requirements
- **Chat System**: AI-powered character interactions with message history
- **Admin Panel**: Administrative interface for user management and system monitoring
- **Media Management**: File upload system for character images and media

## Authentication and Authorization
- **Admin Access**: Role-based access control with admin flag in user model
- **Session Management**: Designed for session-based authentication (implementation pending)
- **Route Protection**: Admin routes protected by role-based middleware

# External Dependencies

## Core Framework Dependencies
- **@tanstack/react-query**: Server state management and caching
- **wouter**: Lightweight client-side routing
- **drizzle-orm**: Type-safe PostgreSQL ORM
- **@neondatabase/serverless**: Neon database connection driver

## UI and Styling
- **@radix-ui/***: Comprehensive set of accessible UI primitives
- **tailwindcss**: Utility-first CSS framework
- **class-variance-authority**: Component variant management
- **clsx**: Conditional className utility

## Development Tools
- **vite**: Frontend build tool and development server
- **typescript**: Static type checking
- **drizzle-kit**: Database migration and introspection tool
- **esbuild**: Fast JavaScript bundler for production builds

## Planned Integrations
- **File Storage**: System designed for media file uploads and management
- **AI Chat**: Framework ready for AI-powered character personality responses
- **Session Management**: Architecture prepared for user authentication system