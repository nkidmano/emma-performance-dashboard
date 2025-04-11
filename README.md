# Emma Dashboard - Project Document

## Project Overview
The Emma Dashboard is a web application built with Next.js that integrates with Google's PageSpeed Insights API to monitor and analyze website performance metrics. The project uses Supabase for database management and authentication.

## Tech Stack
- **Node**: version 20^
- **Frontend**: Next.js, Tailwind CSS
- **Backend**: Next.js API Routes
- **Database**: PostgreSQL (via Supabase)
- **ORM**: Prisma
- **Authentication**: Custom implementation with sessions
- **External APIs**: Google PageSpeed Insights API

## Project Structure
```
emma-dashboard/
├── prisma/              # Database schema and migrations
├── repositories/        # Database access layer
├── src/
│   ├── actions/        # Server actions
│   ├── app/            # Next.js app router pages
│   ├── components√/     # React components
│   ├── features/       # Feature-specific code
│   ├── lib/           # Utility functions and configurations
│   ├── types/         # TypeScript type definitions
│   └── utils/         # Helper functions
```

## Database Schema
The application uses a PostgreSQL database with the following main models:

### User Management
- `User`: Stores user credentials and authentication data
- `Session`: Manages user sessions

### PageSpeed Analytics
- `PagespeedTest`: Stores individual test results
- `PagespeedMetric`: Stores specific metrics from tests
- `PagespeedDistribution`: Stores metric distribution data

## Environment Setup
1. Clone the repository
2. Install dependencies:
   ```bash
   npm install --force
   ```
3. Generate prisma schema type safe
   ```bash
   npm run prisma:generate
   ```
4. Set up environment variables in `.env`:
   ```
   PAGESPEED_API_KEY=your_api_key
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_key
   DATABASE_URL=your_database_url
   DIRECT_URL=your_direct_database_url
   ```
5. Run code base locally
   ```bash
   npm run dev
   ```

## Key Features
1. **User Authentication**
   - Custom session-based authentication
   - User repository for database operations

2. **PageSpeed Analytics**
   - Integration with Google PageSpeed Insights API
   - Performance metric tracking
   - Distribution analysis

3. **Dashboard Interface**
   - Performance metrics visualization
   - Historical data analysis
   - Device-specific testing (mobile/desktop)

## Development Guidelines
1. **Code Style**
   - Follow TypeScript best practices
   - Use Prisma for database operations
   - Implement proper error handling
   - Write unit tests for critical functionality

2. **Database Operations**
   - Use the repository pattern for database access
   - Implement proper indexing for performance
   - Follow Prisma best practices for migrations

3. **API Integration**
   - Handle API rate limits appropriately
   - Implement proper error handling
   - Cache results when possible

## Deployment
1. **Database**
   - Supabase provides the PostgreSQL database
   - Use connection pooling for better performance
   - Regular backups are handled by Supabase

2. **Application**
   - Deploy to Vercel or similar platform
   - Set up proper environment variables
   - Configure proper CORS settings

## Maintenance
1. **Regular Tasks**
   - Monitor API usage and rate limits
   - Check database performance
   - Update dependencies regularly

## Additional Resources
- [Prisma Documentation](https://www.prisma.io/docs)
- [Next.js Documentation](https://nextjs.org/docs)
- [Supabase Documentation](https://supabase.com/docs)
- [PageSpeed Insights API Documentation](https://developers.google.com/speed/docs/insights/v5/get-started) 