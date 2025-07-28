# Deployment Guide for Homie Kitchen

This guide will help you deploy the Homie Kitchen application to Vercel with a PostgreSQL database.

## Prerequisites

- A Vercel account
- A GitHub repository with your code

## Step 1: Set up Vercel Postgres

1. **Create a new Vercel project** or go to your existing project
2. **Add Vercel Postgres**:
   - Go to your Vercel dashboard
   - Navigate to the "Storage" tab
   - Click "Create Database"
   - Select "Postgres"
   - Choose your preferred region
   - Click "Create"

3. **Get your database credentials**:
   - After creation, go to the "Environment Variables" section
   - Copy the following variables (they should be automatically added):
     - `POSTGRES_URL`
     - `POSTGRES_PRISMA_URL`
     - `POSTGRES_URL_NON_POOLING`
     - `POSTGRES_USER`
     - `POSTGRES_HOST`
     - `POSTGRES_PASSWORD`
     - `POSTGRES_DATABASE`

## Step 2: Deploy to Vercel

1. **Connect your GitHub repository** to Vercel
2. **Configure the project**:
   - Framework Preset: Next.js
   - Root Directory: `./` (default)
   - Build Command: `npm run build`
   - Output Directory: `.next` (default)
   - Install Command: `npm install`

3. **Environment Variables**: The Postgres environment variables should be automatically added

4. **Deploy**: Click "Deploy" and wait for the build to complete

## Step 3: Database Initialization

The application will automatically initialize the database schema and seed data on first deployment. This includes:

- Creating all necessary tables
- Adding default categories (Appetizers, Main Course, Desserts, Beverages)
- Creating default admin and staff users
- Adding sample ingredients and menu items
- Creating sample orders

## Default Login Credentials

After deployment, you can log in with these default accounts:

### Admin Account
- Email: `admin@homie.kitchen`
- Password: `admin123`

### Staff Account
- Email: `staff@homie.kitchen`
- Password: `staff123`

### Customer Account
- Email: `john@example.com`
- Password: `customer123`

## Database Schema

The application uses the following main tables:

- **users**: Customer, staff, and admin accounts
- **categories**: Menu categories
- **ingredients**: Inventory management
- **menu_items**: Individual menu items
- **orders**: Customer orders
- **order_items**: Items within each order
- **set_menus**: Pre-configured meal sets
- **set_menu_items**: Items within set menus

## Local Development

For local development, the application uses SQLite:

1. Install dependencies: `npm install`
2. Run the development server: `npm run dev`
3. The database will be automatically initialized with sample data

## Troubleshooting

### Build Errors
- Ensure all dependencies are properly installed
- Check that the `@vercel/postgres` package is included
- Verify that environment variables are set correctly

### Database Connection Issues
- Verify that the Postgres environment variables are set in Vercel
- Check that the database is accessible from your deployment region
- Ensure the database schema is properly initialized

### Performance Issues
- The application uses connection pooling for better performance
- Consider upgrading your Postgres plan if you experience slow queries
- Monitor your database usage in the Vercel dashboard

## Security Notes

- Change default passwords after first deployment
- Regularly update dependencies
- Monitor database access and usage
- Consider implementing rate limiting for production use

## Support

If you encounter issues:
1. Check the Vercel deployment logs
2. Verify environment variables are set correctly
3. Ensure the database is properly initialized
4. Check the application logs for specific error messages 