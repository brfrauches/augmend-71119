
# AugMend Health - Backend Setup

This document provides instructions for setting up and running the AugMend Health backend server.

## Prerequisites

- Node.js (v14 or higher)
- MongoDB (local or Atlas cloud instance)

## Setup Instructions

1. Create a `.env` file in the `server` directory based on `.env.example`:
   ```
   PORT=5000
   MONGODB_URI=mongodb://localhost:27017/augmend-health
   NODE_ENV=development
   ```

2. Install dependencies:
   ```
   cd server
   npm install
   ```

3. Start the development server:
   ```
   npm run dev
   ```

4. For production build:
   ```
   npm run build
   npm start
   ```

## API Endpoints

### Reflections API

- `GET /api/v1/reflections` - Get all reflections
- `GET /api/v1/reflections/:id` - Get a reflection by ID
- `POST /api/v1/reflections` - Create a new reflection
- `PUT /api/v1/reflections/:id` - Update a reflection
- `DELETE /api/v1/reflections/:id` - Delete a reflection

## Future Development

This is phase 1 of the backend implementation, focused on the Reflection Journal feature. Future phases will include:

- Authentication system
- Health metrics API
- User management
- Content management
- Achievement tracking

## Contributing

When contributing to the backend, please follow these guidelines:

- Use the repository pattern for data access
- Implement proper validation and error handling
- Write clean, maintainable code with proper comments
- Follow RESTful API design principles
