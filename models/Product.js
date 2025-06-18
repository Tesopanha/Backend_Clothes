const mongoose = require('mongoose');

const imageSchema = new mongoose.Schema({
    imageURL:{
        type: String,
        required: true,
    },
    cloudinaryId: {
        type: String,
        required: true,
    },
    isMain:{
        type: Boolean,
        default: false
    }
} , { timestamps: true});

const variantSchema = new mongoose.Schema({
    variantId: { 
        type: String, 
        required: true, 
        unique: true 
    },
    colors: [{ 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Color', 
        required: false 
    }],
    size: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Size', 
        required: true 
    },
    stock: { 
        type: Number, 
        required: true, 
        min: 0 
    },
    images: [imageSchema]
}, { 
    timestamps: true 
});

// Add method to check for duplicate variants
variantSchema.statics.isDuplicate = function(variants, newVariant) {
    return variants.some(variant => 
        variant.size.toString() === newVariant.size.toString() &&
        JSON.stringify(variant.colors.sort()) === JSON.stringify(newVariant.colors.sort())
    );
};

const productSchema = new mongoose.Schema({
    name: { 
        type: String, 
        required: true, 
        trim: true 
    },
    brand: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Brand', 
        required: true 
    },
    variants: [variantSchema]
}, { 
    timestamps: true 
});

// Add pre-save middleware to ensure variantId is unique
productSchema.pre('save', async function(next) {
    if (this.isModified('variants')) {
        const variantIds = new Set();
        for (const variant of this.variants) {
            if (variantIds.has(variant.variantId)) {
                throw new Error('Duplicate variantId found');
            }
            variantIds.add(variant.variantId);
        }
    }
    next();
});

// Add method to generate unique variantId
productSchema.statics.generateVariantId = function() {
    return 'V' + Date.now().toString(36) + Math.random().toString(36).substr(2, 5);
};

// Add indexes for better query performance
productSchema.index({ name: 1 });
productSchema.index({ brand: 1 });

module.exports = mongoose.model('Product', productSchema);