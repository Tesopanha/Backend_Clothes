# [Project Name]

## Project Overview
This project serves as a robust backend API for a modern digital menu or e-commerce platform, specifically designed for a clothing store. It provides comprehensive functionalities for managing brands, products, colors, sizes, and user authentication, with integrated image management via Cloudinary.

## Features
-   **User Authentication:** Secure login for admin users to manage resources.
-   **Brand Management:** Create, retrieve, update, and delete clothing brands, including logo image uploads.
-   **Product Management:** Full CRUD operations for products, supporting multiple variants (combinations of color and size) and multiple images per variant.
-   **Color Management:** CRUD operations for clothing colors.
-   **Size Management:** CRUD operations for clothing sizes.
-   **Image Uploads:** Seamless integration with Cloudinary for efficient image storage and delivery for brands and products.
-   **Database Migrations:** Scripts for managing schema changes and applying default data to existing records.
-   **Partial Updates:** Flexible API endpoints allowing partial updates to product data and variants.
-   **Dynamic Variant Handling:** Ability to add new variants to existing products without re-submitting all old variant data.

## Technologies Used
-   **Node.js:** JavaScript runtime environment.
-   **Express.js:** Web application framework for Node.js.
-   **MongoDB:** NoSQL database for data storage.
-   **Mongoose:** ODM (Object Data Modeling) library for MongoDB and Node.js.
-   **Cloudinary:** Cloud-based image and video management service.
-   **dotenv:** For managing environment variables.
-   **jsonwebtoken:** For implementing JWT-based authentication.
-   **bcryptjs:** For password hashing.
-   **express-validator:** For robust request body validation.
-   **multer:** Middleware for handling `multipart/form-data`, primarily for file uploads.

## Prerequisites
Before you begin, ensure you have met the following requirements:
*   Node.js (LTS version recommended)
*   npm (Node Package Manager)
*   MongoDB instance (local or cloud-hosted like MongoDB Atlas)
*   A Cloudinary account (free tier is sufficient for development)
*   Postman or a similar API testing tool

## Installation

1.  **Clone the repository:**
    ```bash
    git clone [Your Repository URL Here]
    cd backend-clothes-api
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    ```

3.  **Create a `.env` file:**
    In the root directory of the project, create a file named `.env` and add the following environment variables. Replace the placeholder values with your actual credentials.

    ```dotenv
    PORT=3000
    DB_URI=mongodb://localhost:27017/clothesStoreDB
    JWT_SECRET=your_jwt_secret_key
    CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
    CLOUDINARY_API_KEY=your_cloudinary_api_key
    CLOUDINARY_API_SECRET=your_cloudinary_api_secret
    ```
    *   `PORT`: The port your server will run on.
    *   `DB_URI`: Your MongoDB connection string.
    *   `JWT_SECRET`: A strong, random string for JWT token encryption.
    *   `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`: Your Cloudinary account credentials.

## Running the Application

To start the development server:
```bash
npm start
```
The server will typically run on `http://localhost:3000` (or the `PORT` specified in your `.env` file).

## Database Migrations

This project uses migration scripts to manage database schema changes and apply default data (e.g., for new image fields).

1.  **Configure Default Image URLs:**
    Before running migrations, ensure the default image URLs in your migration files (e.g., `migrations/20240318_add_logo_to_brands.js`, `migrations/20240318_add_profile_picture_to_users.js`) point to valid default images in your Cloudinary account. Replace `your-cloud-name` with your actual Cloudinary cloud name.

2.  **Run All Migrations:**
    ```bash
    npm run migrate:all
    ```
    This command will run all pending migrations, adding necessary fields and default values to your `brands` and `users` collections.

## API Endpoints (Using Postman)

Once the server is running, you can test the API endpoints using Postman.

### Authentication

-   **Admin Login**
    `POST /auth/login`
    Body (JSON): `{ "username": "your-admin-username", "password": "your-password" }`
    *   **Note:** Save the `token` from the response. You will use it in the `Authorization: Bearer <token>` header for all protected routes.

### Brands

-   **Create Brand (with Logo)**
    `POST /api/v1/brands`
    Headers: `Authorization: Bearer <token>`
    Body (form-data): `name` (Text), `logo` (File)
-   **Get All Brands**
    `GET /api/v1/brands`
-   **Update Brand (Partial)**
    `PUT /api/v1/brands/:id`
    Headers: `Authorization: Bearer <token>`
    Body (form-data): `name` (Text, optional), `logo` (File, optional)
    *   Update specific fields without affecting others.
-   **Delete Brand**
    `DELETE /api/v1/brands/:id`
    Headers: `Authorization: Bearer <token>`


### Colors

-   **Create Color**
    `POST /api/v1/colors`
    Headers: `Authorization: Bearer <token>`
    Body (JSON): `{ "name": "Red" }`
-   **Get All Colors**
    `GET /api/v1/colors`
-   **Update Color**
    `PUT /api/v1/colors/:id`
    Headers: `Authorization: Bearer <token>`
    Body (JSON): `{ "name": "Dark Red" }`
-   **Delete Color**
    `DELETE /api/v1/colors/:id`
    Headers: `Authorization: Bearer <token>`

### Sizes

-   **Create Size**
    `POST /api/v1/sizes`
    Headers: `Authorization: Bearer <token>`
    Body (JSON): `{ "name": "XL" }`
-   **Get All Sizes**
    `GET /api/v1/sizes`
-   **Update Size**
    `PUT /api/v1/sizes/:id`
    Headers: `Authorization: Bearer <token>`
    Body (JSON): `{ "name": "XXL" }`
-   **Delete Size**
    `DELETE /api/v1/sizes/:id`
    Headers: `Authorization: Bearer <token>`

### Products

#### Create Product
```http
POST /api/v1/products
Headers: 
- Authorization: Bearer <token>
- Content-Type: multipart/form-data

Body (form-data):
- data: {
    "name": "Product Name",
    "brandId": "brand_id_here",
    "variants": [
        {
            "size": "size_id_here",
            "colors": ["color_id_1", "color_id_2"],
            "stock": 10
        }
    ]
}
- files[0]: [image file for first variant]
- files[1]: [image file for second variant]
```

#### Get All Products
```http
GET /api/v1/products
Query Parameters:
- page: number (default: 1)
- limit: number (default: 10)
- search: string (optional)
- brand: brand_id (optional)
```

#### Get Single Product
```http
GET /api/v1/products/:id
```

#### Update Product
```http
PUT /api/v1/products/:id
Headers: 
- Authorization: Bearer <token>
- Content-Type: application/json

Body (raw JSON):
{
    "name": "Updated Name",  // optional
    "brandId": "new_brand_id",  // optional
    "variants": [  // optional
        {
            "variantId": "existing_variant_id",  // for updating existing variant
            "colors": ["color_id_1", "color_id_2"],
            "size": "size_id",
            "stock": 15
        },
        {
            "size": "size_id",  // for adding new variant
            "colors": ["color_id_1"],
            "stock": 20
        }
    ]
}
```

#### Update Variant Image
```http
PUT /api/v1/products/:productId/variants/:variantId/image
Headers: 
- Authorization: Bearer <token>
- Content-Type: multipart/form-data

Body (form-data):
- image: [new image file]
```

#### Delete Product
```http
DELETE /api/v1/products/:id
Headers: 
- Authorization: Bearer <token>
```

### Example Responses

#### Successful Create/Update
```json
{
    "success": true,
    "data": {
        "_id": "product_id",
        "name": "Product Name",
        "brand": {
            "_id": "brand_id",
            "name": "Brand Name"
        },
        "variants": [
            {
                "variantId": "V123",
                "colors": [
                    {
                        "_id": "color_id_1",
                        "name": "Red"
                    }
                ],
                "size": {
                    "_id": "size_id",
                    "name": "M"
                },
                "stock": 10,
                "imageURL": "https://cloudinary.com/image.jpg",
                "cloudinaryId": "cloudinary_id"
            }
        ]
    },
    "message": "Product created/updated successfully"
}
```

#### Error Response
```json
{
    "success": false,
    "message": "Error message here"
}
```

### Common Update Scenarios

1. **Update Product Name Only**
```json
{
    "name": "New Product Name"
}
```

2. **Update Brand Only**
```json
{
    "brandId": "new_brand_id"
}
```

3. **Update Variant Colors**
```json
{
    "variants": [
        {
            "variantId": "V123",
            "colors": ["color_id_1", "color_id_2"]
        }
    ]
}
```

4. **Update Variant Size**
```json
{
    "variants": [
        {
            "variantId": "V123",
            "size": "new_size_id"
        }
    ]
}
```

5. **Update Variant Stock**
```json
{
    "variants": [
        {
            "variantId": "V123",
            "stock": 15
        }
    ]
}
```

6. **Add New Variant**
```json
{
    "variants": [
        {
            "size": "size_id",
            "colors": ["color_id_1"],
            "stock": 10
        }
    ]
}
```

### Important Notes

1. **For Create Product:**
   - Use `form-data` for file uploads
   - JSON data should be in a field named "data"
   - Image files should be named "files[0]", "files[1]", etc.
   - Number of images should match number of variants

2. **For Update Product:**
   - Use `raw` (JSON) for text/number updates
   - Use `form-data` only for image updates
   - Only include fields you want to update
   - Existing data will be preserved for fields not included

3. **For Variant Updates:**
   - Use `variantId` to identify existing variants
   - Omit `variantId` for new variants
   - Can update individual fields (colors, size, stock)
   - Can add new variants while updating existing ones

4. **For Image Updates:**
   - Use separate endpoint for variant image updates
   - Old images will be automatically deleted from Cloudinary
   - New images will be uploaded to Cloudinary  

### Health Check
-   **Check API Health**
    `GET /api/health`

## Troubleshooting

*   **`500 Internal Server Error` / `ValidationError: Path `name` is required.`**: Ensure you are sending JSON data (not form-data) for Color/Size creation/update, and that all required fields are present.
*   **`ValidationError: Validation failed: variants.0.cloudinaryId: Path `cloudinaryId` is required.`**: This typically means that a field required by the Mongoose schema was not provided in the request body for a variant. This should be mitigated by the latest code changes. Ensure your server is restarted after model/controller changes.
*   **Image Loss on Update**: Ensure your server is restarted. If providing old image data, make sure `imageURL` and `cloudinaryId` are explicitly included in the variant data for existing variants.
*   **`TypeError: Cannot read properties of undefined (reading '_id')`**: This usually indicates an issue with how `form-data` is structured, potentially leading to sparse arrays. Ensure you are not skipping indices in your `variants` array in Postman, or that you are using the latest `productController.js` code with appropriate checks.

## Contributing
Pull requests are welcome. For major changes, please open an issue first to discuss what you would like to change.

## License
[MIT](./LICENSE)





