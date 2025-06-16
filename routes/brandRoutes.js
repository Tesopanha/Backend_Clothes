const express = require('express');
const router = express.Router();
const brandController = require('../controllers/brandController');
const { validateBrand, validateObjectIdParam } = require('../middleware/validation');
const auth = require('../middleware/auth');
const { uploadBrand } = require('../config/cloudinary');

// Brand Routes
router.post('/brands', 
    [auth, validateBrand, uploadBrand.single('logo')], 
    brandController.createBrand
);

router.get('/brands', brandController.getBrands);

router.put('/brands/:id', 
    [auth, validateObjectIdParam, validateBrand, uploadBrand.single('logo')], 
    brandController.updateBrand
);

router.delete('/brands/:id', 
    [auth, validateObjectIdParam], 
    brandController.deleteBrand
);

module.exports = router;