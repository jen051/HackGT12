import { NextRequest, NextResponse } from 'next/server';
import { auth, db } from '@/firebase/config';
import { doc, getDoc, updateDoc } from 'firebase/firestore';

// Helper function to verify Firebase ID token (placeholder for future implementation)
async function verifyFirebaseToken(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new Error('No authorization token provided');
    }

    const idToken = authHeader.split('Bearer ')[1];
    
    // For now, we'll return a mock token for development
    // In production, you should use Firebase Admin SDK for server-side verification
    return {
      uid: 'mock-user-id',
      email: 'user@example.com',
      name: 'John Doe',
      email_verified: true,
      picture: null,
      iat: Math.floor(Date.now() / 1000)
    };
  } catch (error) {
    console.error('Token verification failed:', error);
    throw new Error('Invalid or expired token');
  }
}

// GET /api/user - Get current user information
export async function GET(request: NextRequest) {
  try {
    // For development, we'll return mock data
    // In production, uncomment the verification code below
    
    // const decodedToken = await verifyFirebaseToken(request);
    
    // Mock user data for development
    const mockUser = {
      uid: 'mock-user-id',
      email: 'user@example.com',
      displayName: 'John Doe',
      emailVerified: true,
      photoURL: null,
      createdAt: new Date().toISOString(),
    };

    return NextResponse.json({
      success: true,
      user: mockUser
    });

    // Production code (uncomment when Firebase Admin is set up):
    /*
    return NextResponse.json({
      success: true,
      user: {
        uid: decodedToken.uid,
        email: decodedToken.email,
        displayName: decodedToken.name,
        emailVerified: decodedToken.email_verified,
        photoURL: decodedToken.picture,
        createdAt: new Date(decodedToken.iat * 1000).toISOString(),
      }
    });
    */
  } catch (error) {
    console.error('Error getting user info:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to get user information' },
      { status: 401 }
    );
  }
}

// POST /api/user/profile - Get user profile data from Firestore
export async function POST(request: NextRequest) {
  try {
    const { uid } = await request.json();
    
    if (!uid) {
      return NextResponse.json(
        { success: false, error: 'User ID is required' },
        { status: 400 }
      );
    }

    // Get user document
    const userDocRef = doc(db, 'users', uid);
    const userDoc = await getDoc(userDocRef);

    if (!userDoc.exists()) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      );
    }

    // Get user profile data
    const profileDocRef = doc(db, 'users', uid, 'userProfile', 'profileData');
    const profileDoc = await getDoc(profileDocRef);

    // Get grocery list data
    const groceryListDocRef = doc(db, 'users', uid, 'groceryList', 'listData');
    const groceryListDoc = await getDoc(groceryListDocRef);

    const userData = {
      uid: userDoc.id,
      ...userDoc.data(),
      profile: profileDoc.exists() ? profileDoc.data() : null,
      groceryList: groceryListDoc.exists() ? groceryListDoc.data() : null,
    };

    return NextResponse.json({
      success: true,
      user: userData
    });
  } catch (error) {
    console.error('Error getting user profile:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to get user profile' },
      { status: 500 }
    );
  }
}

// PUT /api/user/profile - Update user profile
export async function PUT(request: NextRequest) {
  try {
    const { uid, profileData } = await request.json();
    
    if (!uid) {
      return NextResponse.json(
        { success: false, error: 'User ID is required' },
        { status: 400 }
      );
    }

    if (!profileData) {
      return NextResponse.json(
        { success: false, error: 'Profile data is required' },
        { status: 400 }
      );
    }

    const userProfileDocRef = doc(db, 'users', uid, 'userProfile', 'profileData');
    
    const updatePayload: any = {
      allergies: profileData.allergies || [],
      cuisine: profileData.cuisinePreferences || [],
      dietaryRestrictions: profileData.dietaryRestrictions || [],
      nutritionalPref: profileData.nutritionGoals || [],
    };

    // Convert budget to number if it exists and is a valid number
    if (profileData.weeklyBudget) {
      const budget = parseFloat(profileData.weeklyBudget);
      if (!isNaN(budget)) {
        updatePayload.budget = budget;
      }
    }

    // Add maxTime if provided
    if (profileData.maxTime) {
      updatePayload.maxTime = parseInt(profileData.maxTime);
    }

    await updateDoc(userProfileDocRef, updatePayload);

    return NextResponse.json({
      success: true,
      message: 'Profile updated successfully',
      updatedData: updatePayload
    });
  } catch (error) {
    console.error('Error updating user profile:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update user profile' },
      { status: 500 }
    );
  }
}

// DELETE /api/user - Delete user account (placeholder)
export async function DELETE(request: NextRequest) {
  try {
    const { uid } = await request.json();
    
    if (!uid) {
      return NextResponse.json(
        { success: false, error: 'User ID is required' },
        { status: 400 }
      );
    }

    // Note: This would require Firebase Admin SDK to delete the user from Auth
    // For now, we'll just return a success message
    // In production, you should use Firebase Admin SDK to delete the user
    
    return NextResponse.json({
      success: true,
      message: 'User deletion not implemented yet. Requires Firebase Admin SDK.'
    });
  } catch (error) {
    console.error('Error deleting user:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete user' },
      { status: 500 }
    );
  }
}
