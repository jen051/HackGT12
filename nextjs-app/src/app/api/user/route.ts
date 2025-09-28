/**
 * User API Routes for Firebase Authentication
 * 
 * This API provides endpoints to manage user information and profiles:
 * 
 * GET /api/user - Retrieve current user information and profile
 * PUT /api/user - Update user profile information (full update)
 * PATCH /api/user - Partial update of user profile
 * DELETE /api/user - Delete user account (not implemented)
 * 
 * Authentication Methods:
 * 1. Pass user ID as query parameter: ?uid=user-id-here (GET requests only)
 * 2. Pass user ID in header: x-user-id: user-id-here
 * 3. Pass Firebase ID token in Authorization header: Bearer <token>
 * 4. Pass user ID in request body: { "uid": "user-id-here" } (POST/PUT/PATCH only)
 * 
 * Example Usage:
 * 
 * // Get user info (query parameter - easiest for GET requests)
 * const response = await fetch('/api/user?uid=user-uid-here');
 * 
 * // Get user info (header)
 * const response = await fetch('/api/user', {
 *   headers: { 'x-user-id': 'user-uid-here' }
 * });
 * 
 * // Update user profile
 * const response = await fetch('/api/user', {
 *   method: 'PUT',
 *   headers: { 'Content-Type': 'application/json' },
 *   body: JSON.stringify({
 *     uid: 'user-uid-here',
 *     name: 'New Name',
 *     profile: {
 *       allergies: ['nuts', 'dairy'],
 *       budget: 100,
 *       cuisine: ['italian', 'mexican']
 *     }
 *   })
 * });
 */

import { NextRequest, NextResponse } from 'next/server';
import { auth, db } from '@/firebase/config';
import { getDoc, doc, updateDoc, setDoc } from 'firebase/firestore';
import { getIdToken } from 'firebase/auth';
import OpenAI from 'openai';

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Interface for user profile data
interface UserProfile {
  allergies: string[];
  cuisine: string[];
  dietaryRestrictions: string[];
  nutritionalPref: string[];
  budget: number;
  maxTime: number;
  inventory: string;
}

// Interface for user data
interface UserData {
  uid: string;
  email: string | null;
  name: string;
  profile: UserProfile | null;
}

// Interface for grocery list response
interface GroceryListResponse {
  estimatedTotalCost: number;
  recipe: string;
  groceryList: Array<{
    item: string;
    quantity: number;
    category: string;
    estimatedPrice?: number;
    unit?: string;
    isEssential?: boolean;
    isSelected?: boolean;
  }>;
}

// Helper function to generate grocery list using OpenAI
async function generateGroceryList(profileData: UserProfile, userQuery: string = 'Generate a weekly grocery list based on my profile preferences'): Promise<GroceryListResponse | null> {
  try {
    const prompt = `
    You are an expert nutritional meal and grocery list planner.
    Generate a comprehensive grocery list and meal plan in JSON format.

    OUTPUT SHAPE (exact keys and types):
    - estimatedTotalCost: number
    - recipe: string (detailed recipe instructions)
    - groceryList: array of objects with keys:
      - item: string
      - quantity: number
      - category: string (one of: Protein, Dairy, Vegetables, Grains, Fruits, Pantry)
      - estimatedPrice: number (estimated price per unit)
      - unit: string (unit of measurement)
      - isEssential: boolean (whether this is an essential item)
      - isSelected: boolean (default to true)

    STRICT CONSTRAINTS (sourced directly from the user's database preferences):
    1. DIETARY RESTRICTION: The entire plan must be strictly no "${profileData.dietaryRestrictions?.join(', ') || 'None'}". If no dietary restrictions, consider all options.
    2. BUDGET: The estimated total cost MUST NOT exceed $${profileData.budget || 100}.
    3. SHOPPING LOCATION: Assume pricing and availability are based on Publix in Midtown Atlanta.
    4. CUISINES: Prefer recipes from these cuisines: ${profileData.cuisine?.join(', ') || 'None'}.
    5. INVENTORY: Use these existing ingredients from the user's inventory where possible: ${profileData.inventory || 'None'}.
    6. NUTRITION: Prioritize these nutritional preferences: ${profileData.nutritionalPref?.join(', ') || 'None'}.
    7. ALLERGIES: Absolutely avoid any ingredients that may contain or be cross-contaminated with: ${profileData.allergies?.join(', ') || 'None'}.
    8. MAX COOKING TIME: Recipes should take no longer than ${profileData.maxTime || 60} minutes to prepare.
    
    USER REQUEST: The specific request is: "${userQuery}".
    
    Do not include any other commentary, preamble, or text outside of the JSON block.
    `;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "user",
          content: prompt
        }
      ],
      response_format: { type: "json_object" },
      temperature: 0,
      max_tokens: 2000,
    });

    const responseText = completion.choices[0]?.message?.content;
    if (!responseText) {
      throw new Error('No response from OpenAI');
    }

    const parsedResponse = JSON.parse(responseText);
    
    // Add isSelected flag to all grocery items
    if (parsedResponse.groceryList && Array.isArray(parsedResponse.groceryList)) {
      parsedResponse.groceryList = parsedResponse.groceryList.map((item: any) => ({
        ...item,
        isSelected: true,
        isEssential: item.isEssential || false,
        unit: item.unit || 'piece',
        estimatedPrice: item.estimatedPrice || 0
      }));
    }

    return parsedResponse as GroceryListResponse;
  } catch (error) {
    console.error('Error generating grocery list with OpenAI:', error);
    return null;
  }
}

// Helper function to extract user ID from request
// Note: In a production app, you should verify the Firebase ID token on the server
// For now, we'll expect the user ID to be passed in the request body or headers
async function getUserId(request: Request): Promise<string | null> {
  try {
    // Method 1: Check for user ID in query parameters (works for GET requests)
    const url = new URL(request.url);
    const uidParam = url.searchParams.get('uid');
    if (uidParam) {
      console.log('Found UID in query params:', uidParam);
      return uidParam;
    }
    
    // Method 2: Check for user ID in headers (works for all request types)
    const uidHeader = request.headers.get('x-user-id');
    if (uidHeader) {
      console.log('Found UID in header:', uidHeader);
      return uidHeader;
    }
    
    // Method 3: Check for Firebase ID token in Authorization header
    const authHeader = request.headers.get('authorization');
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const idToken = authHeader.split('Bearer ')[1];
      console.log('Found auth token');
      // In a real app, you would verify this token with Firebase Admin SDK
      // For now, we'll assume the token is valid and extract UID from it
      // This is a simplified approach - in production, always verify tokens server-side
      try {
        const payload = JSON.parse(atob(idToken.split('.')[1]));
        const uid = payload.user_id || payload.sub || null;
        console.log('Extracted UID from token:', uid);
        return uid;
      } catch (error) {
        console.error('Error parsing token:', error);
        return null;
      }
    }
    
    // Method 4: Check for user ID in request body (only for POST/PUT/PATCH requests)
    try {
      const body = await request.clone().json();
      console.log('Request body:', body);
      if (body?.uid) {
        console.log('Found UID in body:', body.uid);
        return body.uid;
      }
    } catch (error) {
      // No body or not JSON - this is normal for GET requests
      console.log('No body or invalid JSON (normal for GET requests)');
    }
    
    console.log('No UID found in any method');
    return null;
  } catch (error) {
    console.error('Error getting user ID:', error);
    return null;
  }
}

// GET /api/user - Get current user information and profile
export async function POST(request: Request) {
  console.log('request', request);
  try {
    const uid = await getUserId(request);
    console.log('uid', uid);
    if (!uid) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get user document from Firestore
    const userDocRef = doc(db, 'users', uid);
    const userDoc = await getDoc(userDocRef);
    
    if (!userDoc.exists()) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    const userData = userDoc.data();
    
    // Get user profile data
    const profileDocRef = doc(db, 'users', uid, 'userProfile', 'profileData');
    const profileDoc = await getDoc(profileDocRef);
    
    const profileData = profileDoc.exists() ? profileDoc.data() as UserProfile : null;

    // Generate grocery list using OpenAI
    let groceryListData = null;
    if (profileData) {
      try {
        groceryListData = await generateGroceryList(
          profileData, 
          'Generate a weekly grocery list based on my profile preferences'
        );
        
        if (groceryListData) {
          console.log('OpenAI grocery list generated:', groceryListData);
        } else {
          console.log('Failed to generate grocery list with OpenAI');
        }
      } catch (openaiError) {
        console.error('Error calling OpenAI:', openaiError);
        // Continue without grocery list data if OpenAI fails
      }
    }

    const response: UserData & { groceryList?: any } = {
      uid,
      email: userData.email,
      name: userData.name || '',
      profile: profileData,
      ...(groceryListData && { groceryList: groceryListData })
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Error fetching user data:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PUT /api/user - Update user profile information
export async function PUT(request: Request) {
  try {
    const uid = await getUserId(request);
    
    if (!uid) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { name, profile } = body;

    // Update user basic information if provided
    if (name !== undefined) {
      const userDocRef = doc(db, 'users', uid);
      await updateDoc(userDocRef, { name });
    }

    // Update user profile if provided
    if (profile) {
      const profileDocRef = doc(db, 'users', uid, 'userProfile', 'profileData');
      
      // Check if profile document exists
      const profileDoc = await getDoc(profileDocRef);
      
      if (profileDoc.exists()) {
        // Update existing profile
        await updateDoc(profileDocRef, profile);
      } else {
        // Create new profile document
        await setDoc(profileDocRef, {
          allergies: profile.allergies || [],
          cuisine: profile.cuisine || [],
          dietaryRestrictions: profile.dietaryRestrictions || [],
          nutritionalPref: profile.nutritionalPref || [],
          budget: profile.budget || 0,
          maxTime: profile.maxTime || 0,
          inventory: profile.inventory || '',
        });
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating user data:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PATCH /api/user - Partial update of user profile
export async function PATCH(request: Request) {
  try {
    const uid = await getUserId(request);
    
    if (!uid) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    
    // Update user basic information
    if (body.name !== undefined) {
      const userDocRef = doc(db, 'users', uid);
      await updateDoc(userDocRef, { name: body.name });
    }

    // Update specific profile fields
    const profileFields = [
      'allergies', 'cuisine', 'dietaryRestrictions', 
      'nutritionalPref', 'budget', 'maxTime', 'inventory'
    ];
    
    const profileUpdates: any = {};
    let hasProfileUpdates = false;
    
    profileFields.forEach(field => {
      if (body[field] !== undefined) {
        profileUpdates[field] = body[field];
        hasProfileUpdates = true;
      }
    });

    if (hasProfileUpdates) {
      const profileDocRef = doc(db, 'users', uid, 'userProfile', 'profileData');
      
      // Check if profile document exists
      const profileDoc = await getDoc(profileDocRef);
      
      if (profileDoc.exists()) {
        await updateDoc(profileDocRef, profileUpdates);
      } else {
        // Create new profile document with provided fields
        const defaultProfile = {
          allergies: [],
          cuisine: [],
          dietaryRestrictions: [],
          nutritionalPref: [],
          budget: 0,
          maxTime: 0,
          inventory: '',
        };
        
        await setDoc(profileDocRef, { ...defaultProfile, ...profileUpdates });
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error partially updating user data:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE /api/user - Delete user account (optional)
export async function DELETE(request: Request) {
  try {
    const uid = await getUserId(request);
    
    if (!uid) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Delete user document and all subcollections
    const userDocRef = doc(db, 'users', uid);
    
    // Note: This is a simplified deletion. In production, you might want to:
    // 1. Delete the user from Firebase Auth using Admin SDK
    // 2. Delete all subcollections (userProfile, groceryList, etc.)
    // 3. Handle any related data cleanup
    
    return NextResponse.json(
      { error: 'User deletion not implemented' },
      { status: 501 }
    );
  } catch (error) {
    console.error('Error deleting user:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
