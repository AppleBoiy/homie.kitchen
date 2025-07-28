# API Routes Documentation

This document describes all the API endpoints available in the Homie Kitchen restaurant management system.

## Base URL
All endpoints are relative to `http://localhost:3000/api`

## Authentication Endpoints

### POST `/auth/login`
Authenticate a user and return user data.

**Request Body:**
```json
{
  "email": "admin@homie.kitchen",
  "password": "admin123"
}
```

**Response:**
```json
{
  "message": "Login successful",
  "user": {
    "id": 1,
    "email": "admin@homie.kitchen",
    "name": "Admin User",
    "role": "admin"
  }
}
```

### POST `/auth/register`
Register a new customer account.

**Request Body:**
```json
{
  "email": "customer@example.com",
  "password": "password123",
  "name": "John Doe"
}
```

**Response:**
```json
{
  "message": "Registration successful",
  "user": {
    "id": 2,
    "email": "customer@example.com",
    "name": "John Doe",
    "role": "customer"
  }
}
```

## Menu Endpoints

### GET `/menu`
Get all available menu items (for customers).

**Query Parameters:**
- `all` (optional): Set to `true` to get all menu items regardless of availability (for admin)

**Response:**
```json
[
  {
    "id": 1,
    "name": "Bruschetta",
    "description": "Toasted bread topped with tomatoes, garlic, and herbs",
    "price": 8.99,
    "category_id": 1,
    "image_url": "https://images.unsplash.com/photo-1572441713131-4d09e2c54c39?w=400&h=300&fit=crop",
    "is_available": 1,
    "type": "menu",
    "created_at": "2025-07-27 11:09:23",
    "category_name": "Appetizers"
  }
]
```

### POST `/menu`
Create a new menu item (admin only).

**Request Body:**
```json
{
  "name": "New Item",
  "description": "Item description",
  "price": 12.99,
  "category_id": 1,
  "image_url": "https://example.com/image.jpg",
  "type": "menu",
  "is_available": true
}
```

**Response:**
```json
{
  "message": "Menu item added successfully",
  "id": 7
}
```

### PUT `/menu/[id]`
Update an existing menu item (admin only).

**Request Body:**
```json
{
  "name": "Updated Item",
  "description": "Updated description",
  "price": 15.99,
  "category_id": 1,
  "image_url": "https://example.com/image.jpg",
  "is_available": true,
  "type": "menu"
}
```

**Response:**
```json
{
  "message": "Menu item updated successfully"
}
```

### DELETE `/menu/[id]`
Delete a menu item (admin only).

**Response:**
```json
{
  "message": "Menu item deleted successfully"
}
```

## Categories Endpoints

### GET `/categories`
Get all menu categories.

**Response:**
```json
[
  {
    "id": 1,
    "name": "Appetizers",
    "description": "Start your meal with our delicious appetizers"
  },
  {
    "id": 2,
    "name": "Main Course",
    "description": "Our signature main dishes"
  }
]
```

## Orders Endpoints

### GET `/orders`
Get orders for the authenticated user.

**Query Parameters:**
- `customerId` (required for customers): Customer ID to get their orders
- `role` (optional): Set to `admin` to get all orders (admin only)

**Response:**
```json
[
  {
    "id": 1,
    "customer_id": 2,
    "total_amount": 25.98,
    "status": "pending",
    "refund_status": "none",
    "refund_amount": 0,
    "refund_reason": null,
    "refunded_at": null,
    "created_at": "2025-07-27 12:00:00",
    "customer_name": "John Doe",
    "customer_email": "john@homie.kitchen",
    "items": [
      {
        "id": 1,
        "menu_item_id": 1,
        "quantity": 2,
        "price": 8.99,
        "note": "Extra spicy please",
        "item_name": "Bruschetta",
        "item_description": "Toasted bread topped with tomatoes, garlic, and herbs",
        "set_menu_id": null,
        "set_menu_name": null,
        "set_menu_price": null
      }
    ]
  }
]
```

### POST `/orders`
Create a new order.

**Request Body:**
```json
{
  "customerId": 2,
  "items": [
    {
      "menu_item_id": 1,
      "quantity": 2,
      "note": "Extra spicy please"
    },
    {
      "set_menu_id": 1,
      "quantity": 1
    }
  ]
}
```

**Response:**
```json
{
  "message": "Order created successfully",
  "orderId": 1,
  "totalAmount": 25.98
}
```

### PUT `/orders/[id]/status`
Update order status (admin only).

**Request Body:**
```json
{
  "status": "preparing"
}
```

**Response:**
```json
{
  "message": "Order status updated successfully"
}
```

### PUT `/orders/[id]`
Process refund for an order (admin only).

**Request Body:**
```json
{
  "action": "process_refund",
  "refund_amount": 10.00,
  "refund_reason": "Customer requested refund"
}
```

**Response:**
```json
{
  "message": "Refund processed successfully"
}
```

## Set Menus Endpoints

### GET `/set-menus`
Get all available set menus.

**Response:**
```json
[
  {
    "id": 1,
    "name": "Lunch Set",
    "description": "Burger + Salad + Drink",
    "price": 25.99,
    "is_available": 1,
    "created_at": "2025-07-27 11:09:23",
    "items": [
      {
        "quantity": 1,
        "item_name": "Beef Burger",
        "item_description": "Juicy beef patty with lettuce, tomato, and special sauce",
        "type": "menu"
      },
      {
        "quantity": 1,
        "item_name": "Caesar Salad",
        "item_description": "Fresh romaine lettuce with Caesar dressing and croutons",
        "type": "menu"
      }
    ]
  }
]
```

### POST `/set-menus`
Create a new set menu (admin only).

**Request Body:**
```json
{
  "name": "Dinner Set",
  "description": "Steak + Potatoes + Wine",
  "price": 45.99,
  "is_available": true,
  "items": [
    {
      "menu_item_id": 3,
      "quantity": 1
    },
    {
      "menu_item_id": 4,
      "quantity": 2
    }
  ]
}
```

**Response:**
```json
{
  "message": "Set menu created successfully"
}
```

### PUT `/set-menus`
Update an existing set menu (admin only).

**Request Body:**
```json
{
  "id": 1,
  "name": "Updated Lunch Set",
  "description": "Updated description",
  "price": 29.99,
  "is_available": true,
  "items": [
    {
      "menu_item_id": 3,
      "quantity": 1
    }
  ]
}
```

**Response:**
```json
{
  "message": "Set menu updated successfully"
}
```

### DELETE `/set-menus`
Delete a set menu (admin only).

**Request Body:**
```json
{
  "id": 1
}
```

**Response:**
```json
{
  "message": "Set menu deleted successfully"
}
```

## Ingredients Endpoints

### GET `/ingredients`
Get all ingredients (admin only).

**Response:**
```json
[
  {
    "id": 1,
    "name": "Tomatoes",
    "description": "Fresh tomatoes",
    "stock_quantity": 50,
    "unit": "pieces",
    "min_stock_level": 10,
    "created_at": "2025-07-27 11:09:23"
  }
]
```

### POST `/ingredients`
Create a new ingredient (admin only).

**Request Body:**
```json
{
  "name": "New Ingredient",
  "description": "Ingredient description",
  "stock_quantity": 100,
  "unit": "kg",
  "min_stock_level": 20
}
```

**Response:**
```json
{
  "message": "Ingredient added successfully",
  "id": 9
}
```

### PUT `/ingredients/[id]`
Update an existing ingredient (admin only).

**Request Body:**
```json
{
  "name": "Updated Ingredient",
  "description": "Updated description",
  "stock_quantity": 150,
  "unit": "kg",
  "min_stock_level": 25
}
```

**Response:**
```json
{
  "message": "Ingredient updated successfully"
}
```

### DELETE `/ingredients/[id]`
Delete an ingredient (admin only).

**Response:**
```json
{
  "message": "Ingredient deleted successfully"
}
```

## Users Endpoints

### GET `/users`
Get all users (admin only).

**Response:**
```json
[
  {
    "id": 1,
    "email": "admin@homie.kitchen",
    "name": "Admin User",
    "role": "admin",
    "created_at": "2025-07-27 11:09:23"
  },
  {
    "id": 2,
    "email": "john@homie.kitchen",
    "name": "John Customer",
    "role": "customer",
    "created_at": "2025-07-27 11:09:23"
  }
]
```

### POST `/users`
Create a new user (admin only).

**Request Body:**
```json
{
  "email": "newuser@example.com",
  "password": "password123",
  "name": "New User",
  "role": "customer"
}
```

**Response:**
```json
{
  "message": "User created successfully"
}
```

### PUT `/users`
Update an existing user (admin only).

**Request Body:**
```json
{
  "id": 2,
  "email": "updated@example.com",
  "password": "newpassword123",
  "name": "Updated User",
  "role": "customer"
}
```

**Response:**
```json
{
  "message": "User updated successfully"
}
```

### DELETE `/users`
Delete a user (admin only).

**Request Body:**
```json
{
  "id": 2
}
```

**Response:**
```json
{
  "message": "User deleted successfully"
}
```

## Profile Endpoints

### GET `/profile`
Get user profile information.

**Query Parameters:**
- `userId` (required): User ID to get profile for

**Response:**
```json
{
  "id": 2,
  "email": "john@homie.kitchen",
  "name": "John Customer",
  "role": "customer",
  "created_at": "2025-07-27 11:09:23"
}
```

### PUT `/profile`
Update user profile information.

**Request Body:**
```json
{
  "userId": 2,
  "name": "Updated Name",
  "currentPassword": "oldpassword",
  "newPassword": "newpassword123"
}
```

**Response:**
```json
{
  "message": "Profile updated successfully"
}
```

## Analytics Endpoints

### GET `/analytics`
Get analytics data (admin only).

**Query Parameters:**
- `period` (optional): Time period for analytics (e.g., "7d", "30d", "90d")
- `type` (optional): Type of analytics data (e.g., "overview", "customers", "items", "sales", "inventory")

**Response:**
```json
{
  "overview": {
    "totalOrders": 150,
    "totalRevenue": 2500.50,
    "averageOrderValue": 16.67,
    "totalCustomers": 45
  },
  "customers": {
    "newCustomers": 12,
    "returningCustomers": 33,
    "topCustomers": [
      {
        "id": 2,
        "name": "John Customer",
        "orderCount": 8,
        "totalSpent": 145.67
      }
    ]
  },
  "items": {
    "topItems": [
      {
        "id": 1,
        "name": "Bruschetta",
        "quantity": 45,
        "revenue": 404.55
      }
    ],
    "lowStockItems": [
      {
        "id": 3,
        "name": "Salmon",
        "stock_quantity": 5,
        "min_stock_level": 10
      }
    ]
  },
  "sales": {
    "dailySales": [
      {
        "date": "2025-07-27",
        "orders": 15,
        "revenue": 250.75
      }
    ],
    "categorySales": [
      {
        "category": "Appetizers",
        "orders": 25,
        "revenue": 224.75
      }
    ]
  },
  "inventory": {
    "totalIngredients": 8,
    "lowStockIngredients": 2,
    "ingredients": [
      {
        "id": 1,
        "name": "Tomatoes",
        "stock_quantity": 50,
        "min_stock_level": 10,
        "status": "good"
      }
    ]
  }
}
```

## Error Responses

All endpoints may return the following error responses:

### 400 Bad Request
```json
{
  "error": "Validation error message"
}
```

### 401 Unauthorized
```json
{
  "error": "Authentication required"
}
```

### 403 Forbidden
```json
{
  "error": "Insufficient permissions"
}
```

### 404 Not Found
```json
{
  "error": "Resource not found"
}
```

### 500 Internal Server Error
```json
{
  "error": "Internal server error"
}
```

## Authentication

Most endpoints require authentication. The system uses session-based authentication stored in localStorage. Users must be logged in to access protected endpoints.

## Role-Based Access

- **Admin**: Can access all endpoints and manage the entire system
- **Customer**: Can only access menu, orders (their own), profile, and authentication endpoints

## Default Login Credentials

### Admin Account
- **Email**: `admin@homie.kitchen`
- **Password**: `admin123`

### Customer Accounts
- **Email**: `john@homie.kitchen`
- **Password**: `customer123`
- **Email**: `sarah@homie.kitchen`
- **Password**: `customer123`
- **Email**: `mike@homie.kitchen`
- **Password**: `customer123`

## Database Schema

The system uses SQLite with the following main tables:
- `users` - User accounts and authentication
- `categories` - Menu categories
- `menu_items` - Menu items with availability status and type (menu/goods/free)
- `ingredients` - Inventory items
- `orders` - Customer orders with refund support
- `order_items` - Individual items in orders
- `set_menus` - Pre-configured meal sets
- `set_menu_items` - Items included in set menus
 