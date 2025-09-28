import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/firebase/config';
import { doc, getDoc, updateDoc, setDoc, serverTimestamp } from 'firebase/firestore';

// GET /api/user/grocery-list?uid=USER_ID - Get user's grocery list
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const uid = searchParams.get('uid');
    
    if (!uid) {
      return NextResponse.json(
        { success: false, error: 'User ID is required' },
        { status: 400 }
      );
    }

    const groceryListDocRef = doc(db, 'users', uid, 'groceryList', 'listData');
    const groceryListDoc = await getDoc(groceryListDocRef);

    if (!groceryListDoc.exists()) {
      return NextResponse.json({
        success: true,
        groceryList: {
          items: [],
          createdAt: new Date().toISOString()
        }
      });
    }

    return NextResponse.json({
      success: true,
      groceryList: groceryListDoc.data()
    });
  } catch (error) {
    console.error('Error getting grocery list:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to get grocery list' },
      { status: 500 }
    );
  }
}

// POST /api/user/grocery-list - Create or update user's grocery list
export async function POST(request: NextRequest) {
  try {
    const { uid, items } = await request.json();
    
    if (!uid) {
      return NextResponse.json(
        { success: false, error: 'User ID is required' },
        { status: 400 }
      );
    }

    if (!Array.isArray(items)) {
      return NextResponse.json(
        { success: false, error: 'Items must be an array' },
        { status: 400 }
      );
    }

    const groceryListDocRef = doc(db, 'users', uid, 'groceryList', 'listData');
    
    const groceryListData = {
      items: items,
      updatedAt: serverTimestamp(),
      createdAt: serverTimestamp() // This will only be set if document doesn't exist
    };

    // Use setDoc with merge to update existing or create new
    await setDoc(groceryListDocRef, groceryListData, { merge: true });

    return NextResponse.json({
      success: true,
      message: 'Grocery list updated successfully',
      groceryList: {
        items: items,
        updatedAt: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('Error updating grocery list:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update grocery list' },
      { status: 500 }
    );
  }
}

// PUT /api/user/grocery-list - Update specific items in grocery list
export async function PUT(request: NextRequest) {
  try {
    const { uid, items, action } = await request.json();
    
    if (!uid) {
      return NextResponse.json(
        { success: false, error: 'User ID is required' },
        { status: 400 }
      );
    }

    const groceryListDocRef = doc(db, 'users', uid, 'groceryList', 'listData');
    const groceryListDoc = await getDoc(groceryListDocRef);

    let currentItems = [];
    if (groceryListDoc.exists()) {
      currentItems = groceryListDoc.data()?.items || [];
    }

    let updatedItems = currentItems;

    switch (action) {
      case 'add':
        if (Array.isArray(items)) {
          updatedItems = [...currentItems, ...items];
        } else if (items) {
          updatedItems = [...currentItems, items];
        }
        break;
      
      case 'remove':
        if (Array.isArray(items)) {
          // Remove items by name or id
          updatedItems = currentItems.filter(item => 
            !items.some(removeItem => 
              item.name === removeItem.name || item.id === removeItem.id
            )
          );
        } else if (items) {
          updatedItems = currentItems.filter(item => 
            item.name !== items.name && item.id !== items.id
          );
        }
        break;
      
      case 'update':
        if (items) {
          updatedItems = currentItems.map(item => {
            const updatedItem = items.find(updateItem => 
              item.name === updateItem.name || item.id === updateItem.id
            );
            return updatedItem ? { ...item, ...updatedItem } : item;
          });
        }
        break;
      
      default:
        // If no action specified, replace entire list
        updatedItems = Array.isArray(items) ? items : [items];
    }

    await updateDoc(groceryListDocRef, {
      items: updatedItems,
      updatedAt: serverTimestamp()
    });

    return NextResponse.json({
      success: true,
      message: `Grocery list ${action || 'updated'} successfully`,
      groceryList: {
        items: updatedItems,
        updatedAt: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('Error updating grocery list:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update grocery list' },
      { status: 500 }
    );
  }
}
