import traceback
import firebase_admin
from firebase_admin import credentials, firestore

def init_firestore():
    try:
        # Avoid "ValueError: the default Firebase app already exists"
        if not firebase_admin._apps:
            cred = credentials.Certificate("serviceAccountKey.json")
            firebase_admin.initialize_app(cred)
        return firestore.client()
    except Exception:
        print("Failed to initialize Firebase. Check your serviceAccountKey.json path/contents.")
        raise

def get_user_profile_by_name(db, username: str):
    """Query users by the 'name' field (may return multiple)."""
    users_ref = db.collection("users")
    return [dict(doc.to_dict(), id=doc.id) for doc in users_ref.where("name", "==", username).stream()]

def get_user_profile_by_id(db, user_id: str):
    """Fetch a user by document ID (fast, single read)."""
    snap = db.collection("users").document(user_id).get()
    return (dict(snap.to_dict(), id=snap.id) if snap.exists else None)

from pathlib import Path
import firebase_admin
from firebase_admin import credentials, firestore

# --- init (safe even if called multiple times) ---
def get_db():
    if not firebase_admin._apps:
        here = Path(__file__).resolve().parent
        key_path = here / "serviceAccountKey.json"          # sits next to this script
        cred = credentials.Certificate(str(key_path))
        firebase_admin.initialize_app(cred)
    return firestore.client()

db = get_db()

# ---------- helpers ----------
def get_user_doc_id_by_name(username: str) -> str | None:
    """Find the first user whose 'name' equals username and return its document ID."""
    snap_iter = db.collection("users").where("name", "==", username).limit(1).stream()
    for snap in snap_iter:
        return snap.id
    return None

def get_user_profile_by_user_id(user_id: str) -> dict | None:
    """
    Fetch the *single* document from subcollection users/{user_id}/userProfile
    and return its fields as a dict. Returns None if not found.
    """
    sub = db.collection("users").document(user_id).collection("userProfile")
    # If you expect only one doc, grab the first:
    docs = list(sub.limit(1).stream())
    if not docs:
        return None
    return docs[0].to_dict() | {"_profileDocId": docs[0].id}  # include profile doc id if you need it

def get_full_user_with_profile_by_name(username: str) -> dict | None:
    """
    Convenience: look up user by name, then pull their userProfile.
    Returns a merged dict with user fields + profile fields.
    """
    # 1) find the user
    q = db.collection("users").where("name", "==", username).limit(1)
    docs = list(q.stream())
    if not docs:
        return None
    user_snap = docs[0]
    user_data = user_snap.to_dict() | {"_userId": user_snap.id}

    # 2) get the profile
    profile = get_user_profile_by_user_id(user_snap.id)
    if profile:
        user_data["profile"] = profile
    else:
        user_data["profile"] = None
    return user_data


def parse_and_store_user_data(user) -> dict:
    user_info = {
    "userId": user.get("_userId"),
    "name": user.get("name"),
    "email": user.get("email"),
    "profile": {
        "allergies": user.get("profile", {}).get("allergies"),
        "budget": user.get("profile", {}).get("budget"),
        "cuisine": user.get("profile", {}).get("cuisine"),
        "dietaryRestrictions": user.get("profile", {}).get("dietaryRestrictions"),
        "inventory": user.get("profile", {}).get("inventory"),
        "maxTime": user.get("profile", {}).get("maxTime"),
        "nutritionalPref": user.get("profile", {}).get("nutritionPref"),
        }
    }
    return user_info



if __name__ == "__main__":
    try:
        db = init_firestore()

        # --- Option A: by name (your current approach) ---
        user = get_full_user_with_profile_by_name("Test User")
        if user:
            user_info = parse_and_store_user_data(user)
            print(user_info)
        else:
            print("No user found.")

        # --- Option B: by document ID (faster; change to your actual doc ID) ---
        # doc_id = "5QcNR67D10askK10nP5n"
        # one_user = get_user_profile_by_id(db, doc_id)
        # if one_user:
        #     print(f"[BY ID] User ID: {one_user['id']}")
        #     print(f"Name: {one_user.get('name')}")
        #     print(f"Email: {one_user.get('email')}")
        # else:
        #     print(f"No user found with document ID '{doc_id}'.")

    except Exception:
        traceback.print_exc()

    input("\nPress Enter to exit...")
