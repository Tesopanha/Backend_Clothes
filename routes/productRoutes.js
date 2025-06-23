const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');
const { validateProduct, validateProductUpdate, validateObjectIdParam } = require('../middleware/validation');
const auth = require('../middleware/auth');
const { upload } = require('../config/cloudinary');

// Product Routes
router.post('/products', 
    [auth, validateProduct, upload.any()], // Allow up to 10 images
    productController.createProduct
);

router.get('/products', productController.getProducts);
router.get('/products/:id', validateObjectIdParam, productController.getProduct);

router.patch('/products/:id', 
    [auth, validateObjectIdParam, validateProductUpdate, upload.array('images', 10)],
    productController.updateProduct
);

router.delete('/products/:id', [auth, validateObjectIdParam], productController.deleteProduct);

// Update variant image
router.patch('/products/:productId/variants/:variantId/images',
    [auth, validateObjectIdParam, upload.any()],
    productController.updateVariantImage
);

module.exports = router;