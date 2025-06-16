const mongoose = require('mongoose');

module.exports = {
    up: async () => {
        const Brand = mongoose.model('Brand', new mongoose.Schema({
            name: { 
                type: String, 
                required: true, 
                unique: true 
            },
            logoURL: { 
                type: String, 
                required: false 
            },
            cloudinaryId: { 
                type: String, 
                required: false 
            }
        }, { timestamps: true }));

        const Color = mongoose.model('Color', new mongoose.Schema({
            name: { 
                type: String, 
                required: true, 
                unique: true 
            }
        }, { timestamps: true }));

        const Size = mongoose.model('Size', new mongoose.Schema({
            name: { 
                type: String, 
                required: true, 
                unique: true 
            }
        }, { timestamps: true }));

        const productVariantSchema = new mongoose.Schema({
            variantId: { 
                type: String, 
                required: true, 
                unique: true 
            },
            colors: [{ 
                type: mongoose.Schema.Types.ObjectId, 
                ref: 'Color', 
                required: true 
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
            imageURL: { 
                type: String, 
                required: false 
            },
            cloudinaryId: { 
                type: String, 
                required: false 
            }
        }, { timestamps: true });

      

        const Product = mongoose.model('Product', new mongoose.Schema({
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
            variants: [productVariantSchema]
        }, {
            timestamps: true
        }));

        // Add indexes for better query performance
        Product.index({ name: 1 });
        Product.index({ brand: 1 });
       
    
        // Create collections if they do not exist
        await Brand.createCollection();
        await Color.createCollection();
        await Size.createCollection();
        await Product.createCollection();
    
        console.log('Collections created: Brand, Color, Size, Product');
    },

    down: async () => {
        const Brand = mongoose.model('Brand');
        const Color = mongoose.model('Color');
        const Size = mongoose.model('Size');
        const Product = mongoose.model('Product');
    
        // Drop collections
        await Brand.collection.drop();
        await Color.collection.drop();
        await Size.collection.drop();
        await Product.collection.drop();
    
        console.log('Collections dropped: Brand, Color, Size, Product');
    }
};
