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
  "image_url": "https://example.com/image.jpg"
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
  "is_available": true
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
- `role` (optional): Set to `admin` to get all orders (admin only)

**Response:**
```json
[
  {
    "id": 1,
    "customer_id": 2,
    "total_amount": 25.98,
    "status": "pending",
    "created_at": "2025-07-27 12:00:00",
    "customer_name": "John Doe",
    "items": [
      {
        "id": 1,
        "menu_item_id": 1,
        "quantity": 2,
        "price": 8.99,
        "menu_item_name": "Bruschetta"
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
      "quantity": 2
    },
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
  "message": "Order created successfully",
  "orderId": 1
}
```

### PUT `/orders/[id]`
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

## Error Responses

All endpoints may return the following error responses:

### 400 Bad Request
```json
{
  "error": "Validation error message"
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
- **Customer**: Can only access menu, orders (their own), and authentication endpoints

## Database Schema

The system uses SQLite with the following main tables:
- `users` - User accounts and authentication
- `categories` - Menu categories
- `menu_items` - Menu items with availability status
- `ingredients` - Inventory items
- `orders` - Customer orders
- `order_items` - Individual items in orders
 