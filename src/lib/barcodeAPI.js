import nutritionAPI from './nutritionAPI';

export class BarcodeAPI {
  constructor() {
    // Common barcode databases and APIs
    this.barcodeAPIs = {
      upcitemdb: {
        baseURL: 'https://api.upcitemdb.com/prod/trial/lookup',
        key: process.env.UPCITEMDB_API_KEY || null
      },
      barcodeLookup: {
        baseURL: 'https://api.barcodelookup.com/v3/products',
        key: process.env.BARCODELOOKUP_API_KEY || null
      }
    };
  }

  // Enhanced barcode lookup with multiple APIs
  async lookupBarcode(barcode) {
    const results = [];

    // Try UPCItemDB
    try {
      if (this.barcodeAPIs.upcitemdb.key) {
        const response = await fetch(`${this.barcodeAPIs.upcitemdb.baseURL}?upc=${barcode}`, {
          headers: {
            'Authorization': this.barcodeAPIs.upcitemdb.key
          }
        });

        if (response.ok) {
          const data = await response.json();
          if (data.items && data.items.length > 0) {
            results.push({
              source: 'upcitemdb',
              product: data.items[0],
              confidence: 'high'
            });
          }
        }
      }
    } catch (error) {
      console.log('UPCItemDB lookup failed:', error.message);
    }

    // Try BarcodeLookup
    try {
      if (this.barcodeAPIs.barcodeLookup.key) {
        const response = await fetch(`${this.barcodeAPIs.barcodeLookup.baseURL}?barcode=${barcode}&key=${this.barcodeAPIs.barcodeLookup.key}`);

        if (response.ok) {
          const data = await response.json();
          if (data.products && data.products.length > 0) {
            results.push({
              source: 'barcoderlookup',
              product: data.products[0],
              confidence: 'high'
            });
          }
        }
      }
    } catch (error) {
      console.log('BarcodeLookup failed:', error.message);
    }

    // Fallback: Use barcode as search term in nutrition APIs
    if (results.length === 0) {
      try {
        const nutrition = await nutritionAPI.getNutritionInfoCombined(barcode);

        if (nutrition) {
          results.push({
            source: 'nutrition_api_fallback',
            product: {
              title: nutrition.name,
              description: `Nutrition data for ${nutrition.name}`,
              category: nutrition.category,
              nutrition: nutrition
            },
            confidence: 'medium'
          });
        }
      } catch (error) {
        console.log('Nutrition API fallback failed:', error.message);
      }
    }

    return results;
  }

  // Parse product data from different APIs
  parseProductData(result) {
    const product = result.product;

    return {
      barcode: result.barcode || product.upc || product.barcode,
      name: product.title || product.name || product.product_name,
      description: product.description || product.summary,
      category: product.category || product.category_name,
      brand: product.brand || product.manufacturer,
      image: product.images?.[0] || product.image,
      nutrition: product.nutrition || null,
      confidence: result.confidence,
      source: result.source,
      // Common fields
      ingredients: product.ingredients,
      allergens: product.allergens,
      servingSize: product.serving_size,
      servingUnit: product.serving_unit,
      price: product.price,
      currency: product.currency
    };
  }

  // Enhanced barcode search with multiple attempts
  async searchByBarcode(barcode) {
    const lookupResults = await this.lookupBarcode(barcode);

    if (lookupResults.length === 0) {
      return {
        found: false,
        barcode,
        message: 'Product not found in any barcode database'
      };
    }

    const bestResult = lookupResults[0];
    const parsedProduct = this.parseProductData(bestResult);

    // Try to get nutrition data if not available
    if (!parsedProduct.nutrition && parsedProduct.name) {
      try {
        const nutrition = await nutritionAPI.getNutritionInfoCombined(parsedProduct.name);
        if (nutrition) {
          parsedProduct.nutrition = nutrition;
        }
      } catch (error) {
        console.log('Could not get nutrition data for:', parsedProduct.name);
      }
    }

    return {
      found: true,
      barcode,
      product: parsedProduct,
      lookupResults: lookupResults.length,
      bestMatch: {
        source: bestResult.source,
        confidence: bestResult.confidence
      }
    };
  }

  // Batch barcode lookup
  async batchLookupBarcodes(barcodes) {
    const results = [];

    for (const barcode of barcodes) {
      const result = await this.searchByBarcode(barcode);
      results.push({
        barcode,
        ...result
      });
    }

    return results;
  }

  // Validate barcode format
  validateBarcode(barcode) {
    // Remove any non-alphanumeric characters
    const cleanBarcode = barcode.replace(/[^a-zA-Z0-9]/g, '');

    // Common barcode patterns
    const patterns = {
      upc12: /^\d{12}$/,
      upc11: /^\d{11}$/,
      ean13: /^\d{13}$/,
      ean8: /^\d{8}$/,
      code128: /^[a-zA-Z0-9]+$/,
      qrCode: /^[a-zA-Z0-9\s\-\_\.\(\)]+$/
    };

    for (const [type, pattern] of Object.entries(patterns)) {
      if (pattern.test(cleanBarcode)) {
        return {
          valid: true,
          type,
          barcode: cleanBarcode,
          length: cleanBarcode.length
        };
      }
    }

    return {
      valid: false,
      barcode: cleanBarcode,
      message: 'Barcode format not recognized'
    };
  }

  // Generate mock barcode data for testing
  generateMockBarcode(barcode) {
    const mockProducts = {
      '123456789012': {
        name: 'Apple',
        category: 'Fruits',
        nutrition: {
          calories: 52,
          protein: 0.3,
          carbs: 14,
          fat: 0.2,
          fiber: 2.4,
          sugar: 10.3
        }
      },
      '987654321098': {
        name: 'Banana',
        category: 'Fruits',
        nutrition: {
          calories: 89,
          protein: 1.1,
          carbs: 23,
          fat: 0.3,
          fiber: 2.6,
          sugar: 12.2
        }
      },
      '111111111111': {
        name: 'Chicken Breast',
        category: 'Protein',
        nutrition: {
          calories: 165,
          protein: 31,
          carbs: 0,
          fat: 3.6,
          fiber: 0,
          sugar: 0
        }
      }
    };

    if (mockProducts[barcode]) {
      return {
        found: true,
        barcode,
        product: {
          ...mockProducts[barcode],
          source: 'mock_data',
          confidence: 'high'
        }
      };
    }

    return {
      found: false,
      barcode,
      message: 'Mock product not found'
    };
  }
}

const barcodeAPI = new BarcodeAPI();
export default barcodeAPI;
