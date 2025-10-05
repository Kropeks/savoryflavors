import { NextResponse } from 'next/server';
import barcodeAPI from '@/lib/barcodeAPI';

export const dynamic = 'force-dynamic';

async function GET(request) {
  const { searchParams } = new URL(request.url);
  const barcode = searchParams.get('barcode');
  const upc = searchParams.get('upc');
  const test = searchParams.get('test');
  const code = barcode || upc;

  if (!code && !test) {
    return NextResponse.json(
      {
        message: 'Barcode, UPC, or test parameter is required',
        example: '/api/nutrition/barcode?barcode=123456789012 or /api/nutrition/barcode?test=true'
      },
      { status: 400 }
    );
  }

  try {
    let result;

    if (test === 'true') {
      // Return mock data for testing
      result = await barcodeAPI.getMockBarcode(barcode || upc || '123456789012');
    } else {
      // Use the real barcode lookup
      result = await barcodeAPI.lookupBarcode(barcode || upc);
    }

    if (!result || !result.found) {
      return NextResponse.json(
        {
          message: 'Product not found',
          barcode: barcode || upc,
          suggestions: result?.suggestions || []
        },
        { status: 404 }
      );
    }

    const response = {
      success: true,
      product: {
        name: result.product?.name,
        description: result.product?.description,
        category: result.product?.category,
        brand: result.product?.brand,
        image: result.product?.image,
        nutrition: result.product?.nutrition,
        ingredients: result.product?.ingredients,
        allergens: result.product?.allergens,
        servingSize: result.product?.servingSize,
        servingUnit: result.product?.servingUnit,
        confidence: result.product?.confidence,
        source: result.product?.source
      },
      lookupInfo: {
        sources: result.lookupResults || 1,
        bestMatch: result.bestMatch || { 
          source: result.product?.source, 
          confidence: result.product?.confidence 
        }
      }
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Barcode lookup error:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Failed to lookup barcode',
        error: error.message
      },
      { status: 500 }
    );
  }
}

export { GET }
