# Overview

GasFlow is a comprehensive LPG (Liquefied Petroleum Gas) delivery and management application that serves both administrators and customers. The system facilitates online ordering, inventory management, real-time order tracking, and customer communication through a modern web interface. It combines an Express.js backend with a React frontend, supporting features like offline functionality, real-time chat, and push notifications.

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Frontend Architecture
- **Framework**: React with Vite for fast development and build processes
- **Styling**: Tailwind CSS with shadcn/ui component library for consistent design
- **State Management**: React Query for server state and custom React Context for local state
- **Routing**: Wouter for lightweight client-side routing
- **Animations**: Framer Motion for smooth UI transitions
- **Offline Support**: IndexedDB for local storage of cart items, products, and user data

## Backend Architecture
- **Server**: Express.js with TypeScript for type safety
- **Database**: PostgreSQL with Drizzle ORM for schema management and migrations
- **Authentication**: JWT tokens with bcrypt for password hashing
- **Real-time Communication**: WebSocket server for live chat and order updates
- **File Structure**: Monorepo structure with shared schema and types between client and server

## Database Design
- **User Management**: Separate roles for customers and admins with profile information
- **Product Catalog**: LPG products with pricing, stock levels, and images
- **Order System**: Complete order lifecycle with status tracking and delivery addresses
- **Cart Management**: Persistent shopping cart with both new and swap pricing options
- **Communication**: Chat messages linked to orders for customer support

## Authentication & Authorization
- **JWT-based Authentication**: Stateless token system for API security
- **Role-based Access Control**: Admin and customer roles with specific permissions
- **Protected Routes**: Client-side route guards based on user authentication status
- **Session Management**: Token storage in localStorage with automatic expiration handling

## Real-time Features
- **WebSocket Integration**: Bidirectional communication for chat and order updates
- **Live Order Tracking**: Real-time status updates for delivery progress
- **Instant Messaging**: Customer-admin chat system tied to specific orders
- **Push Notifications**: Web Push API integration for browser notifications

## Offline Capabilities
- **Progressive Web App**: Service worker implementation for offline functionality
- **Local Data Storage**: IndexedDB for caching products, cart items, and user preferences
- **Sync Mechanism**: Automatic data synchronization when connection is restored
- **Offline-first Cart**: Local cart management with server sync

# External Dependencies

## Database & Hosting
- **Neon Database**: PostgreSQL hosting service for production database
- **Drizzle ORM**: Type-safe database queries and schema migrations

## UI & Styling
- **Radix UI**: Headless component primitives for accessible UI elements
- **Tailwind CSS**: Utility-first CSS framework for responsive design
- **Shadcn/ui**: Pre-built component library built on Radix and Tailwind

## Development Tools
- **Vite**: Fast build tool and development server
- **TypeScript**: Type safety across the entire application
- **ESBuild**: Fast JavaScript bundler for production builds

## Authentication & Security
- **bcrypt**: Password hashing library for secure user authentication
- **jsonwebtoken**: JWT token generation and verification

## Real-time & Communication
- **WebSocket (ws)**: Native WebSocket implementation for real-time features
- **React Query**: Server state management and caching

## Planned Integrations
- **Supabase**: Future integration for enhanced auth, real-time, and storage features
- **GCash**: Payment gateway integration for Philippine market
- **Google Maps**: Location services for delivery tracking and address management