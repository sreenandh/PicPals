from fastapi import FastAPI, APIRouter, HTTPException, Depends, UploadFile, File, Header
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
from pathlib import Path
from pydantic import BaseModel, EmailStr
from typing import List, Optional, Annotated
import os
import logging
import jwt
from datetime import datetime
import base64
from supabase import create_client, Client
import uuid

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# Supabase Configuration
SUPABASE_URL = os.environ['SUPABASE_URL']
SUPABASE_SERVICE_ROLE_KEY = os.environ['SUPABASE_SERVICE_ROLE_KEY']
SUPABASE_JWT_SECRET = os.environ['SUPABASE_JWT_SECRET']

# Initialize Supabase client with service role key
supabase: Client = create_client(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

# Create the main app
app = FastAPI(title="PicPals API")

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Pydantic Models
class ProfileCreate(BaseModel):
    username: str
    email: EmailStr

class ProfileUpdate(BaseModel):
    username: Optional[str] = None
    bio: Optional[str] = None
    avatar_url: Optional[str] = None

class PostCreate(BaseModel):
    caption: Optional[str] = None
    media_type: str = 'photo'  # 'photo' or 'reel'
    visibility: str = 'public'

class PostResponse(BaseModel):
    id: str
    user_id: str
    caption: Optional[str]
    media_url: str
    media_type: str
    visibility: str
    created_at: str
    username: str
    avatar_url: Optional[str]
    like_count: int
    comment_count: int
    is_liked: bool

class CommentCreate(BaseModel):
    content: str
    parent_id: Optional[str] = None

class ProductCreate(BaseModel):
    name: str
    description: Optional[str]
    points_cost: int
    image_url: Optional[str]
    quantity_available: int

class RedemptionCreate(BaseModel):
    product_id: str
    shipping_address: Optional[str]

# JWT Verification Dependency
async def verify_token(authorization: Annotated[str, Header()]) -> str:
    """Verify JWT token and return user_id"""
    try:
        if not authorization.startswith('Bearer '):
            raise HTTPException(status_code=401, detail="Invalid authorization header")
        
        token = authorization.replace('Bearer ', '')
        payload = jwt.decode(
            token,
            SUPABASE_JWT_SECRET,
            algorithms=["HS256"],
            audience="authenticated"
        )
        user_id = payload.get("sub")
        if not user_id:
            raise HTTPException(status_code=401, detail="Invalid token")
        return user_id
    except jwt.InvalidTokenError as e:
        logger.error(f"JWT validation error: {e}")
        raise HTTPException(status_code=401, detail="Invalid or expired token")

# Health Check
@api_router.get("/")
async def root():
    return {"message": "PicPals API is running", "status": "healthy"}

# Profile Endpoints
@api_router.get("/profile")
async def get_profile(user_id: Annotated[str, Depends(verify_token)]):
    """Get current user's profile"""
    try:
        response = supabase.table("profiles").select("*").eq("id", user_id).execute()
        if not response.data:
            raise HTTPException(status_code=404, detail="Profile not found")
        return response.data[0]
    except Exception as e:
        logger.error(f"Error fetching profile: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@api_router.put("/profile")
async def update_profile(
    profile: ProfileUpdate,
    user_id: Annotated[str, Depends(verify_token)]
):
    """Update user profile"""
    try:
        update_data = profile.model_dump(exclude_unset=True)
        if not update_data:
            raise HTTPException(status_code=400, detail="No data to update")
        
        response = supabase.table("profiles").update(update_data).eq("id", user_id).execute()
        return response.data[0] if response.data else None
    except Exception as e:
        logger.error(f"Error updating profile: {e}")
        raise HTTPException(status_code=500, detail=str(e))

# Posts Endpoints
@api_router.get("/posts")
async def get_posts(
    user_id: Annotated[str, Depends(verify_token)],
    limit: int = 20,
    offset: int = 0
):
    """Get feed of posts"""
    try:
        # Get posts with profile info
        response = supabase.table("posts").select(
            "*, profiles(username, avatar_url)"
        ).order("created_at", desc=True).range(offset, offset + limit - 1).execute()
        
        posts = []
        for post in response.data:
            # Get like count
            like_response = supabase.table("likes").select("id", count="exact").eq("post_id", post['id']).execute()
            like_count = like_response.count or 0
            
            # Check if current user liked
            user_like = supabase.table("likes").select("id").eq("post_id", post['id']).eq("user_id", user_id).execute()
            is_liked = len(user_like.data) > 0
            
            # Get comment count
            comment_response = supabase.table("comments").select("id", count="exact").eq("post_id", post['id']).execute()
            comment_count = comment_response.count or 0
            
            posts.append({
                **post,
                "username": post['profiles']['username'],
                "avatar_url": post['profiles'].get('avatar_url'),
                "like_count": like_count,
                "comment_count": comment_count,
                "is_liked": is_liked
            })
        
        return posts
    except Exception as e:
        logger.error(f"Error fetching posts: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@api_router.post("/posts")
async def create_post(
    post: PostCreate,
    user_id: Annotated[str, Depends(verify_token)]
):
    """Create a new post"""
    try:
        # Note: media_url should be provided after uploading to storage
        post_data = {
            "user_id": user_id,
            "caption": post.caption,
            "media_type": post.media_type,
            "visibility": post.visibility,
            "media_url": ""  # Will be updated after upload
        }
        
        response = supabase.table("posts").insert(post_data).execute()
        return response.data[0] if response.data else None
    except Exception as e:
        logger.error(f"Error creating post: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@api_router.delete("/posts/{post_id}")
async def delete_post(
    post_id: str,
    user_id: Annotated[str, Depends(verify_token)]
):
    """Delete a post"""
    try:
        # Verify ownership
        post = supabase.table("posts").select("user_id").eq("id", post_id).execute()
        if not post.data or post.data[0]['user_id'] != user_id:
            raise HTTPException(status_code=403, detail="Not authorized to delete this post")
        
        supabase.table("posts").delete().eq("id", post_id).execute()
        return {"message": "Post deleted successfully"}
    except Exception as e:
        logger.error(f"Error deleting post: {e}")
        raise HTTPException(status_code=500, detail=str(e))

# Like Endpoints
@api_router.post("/posts/{post_id}/like")
async def toggle_like(
    post_id: str,
    user_id: Annotated[str, Depends(verify_token)]
):
    """Toggle like on a post"""
    try:
        # Check if already liked
        existing_like = supabase.table("likes").select("id").eq("post_id", post_id).eq("user_id", user_id).execute()
        
        if existing_like.data:
            # Unlike
            supabase.table("likes").delete().eq("post_id", post_id).eq("user_id", user_id).execute()
            
            # Deduct points
            profile = supabase.table("profiles").select("points").eq("id", user_id).execute()
            current_points = profile.data[0]['points']
            supabase.table("profiles").update({"points": current_points - 1}).eq("id", user_id).execute()
            
            # Record transaction
            supabase.table("points_transactions").insert({
                "user_id": user_id,
                "amount": -1,
                "reason": "Unlike post",
                "reference_id": post_id
            }).execute()
            
            return {"liked": False, "points_earned": -1}
        else:
            # Like
            supabase.table("likes").insert({
                "post_id": post_id,
                "user_id": user_id
            }).execute()
            
            # Award points
            profile = supabase.table("profiles").select("points").eq("id", user_id).execute()
            current_points = profile.data[0]['points']
            supabase.table("profiles").update({"points": current_points + 1}).eq("id", user_id).execute()
            
            # Record transaction
            supabase.table("points_transactions").insert({
                "user_id": user_id,
                "amount": 1,
                "reason": "Like post",
                "reference_id": post_id
            }).execute()
            
            return {"liked": True, "points_earned": 1}
    except Exception as e:
        logger.error(f"Error toggling like: {e}")
        raise HTTPException(status_code=500, detail=str(e))

# Comments Endpoints
@api_router.get("/posts/{post_id}/comments")
async def get_comments(
    post_id: str,
    user_id: Annotated[str, Depends(verify_token)]
):
    """Get comments for a post"""
    try:
        response = supabase.table("comments").select(
            "*, profiles(username, avatar_url)"
        ).eq("post_id", post_id).order("created_at", desc=False).execute()
        
        return response.data
    except Exception as e:
        logger.error(f"Error fetching comments: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@api_router.post("/posts/{post_id}/comments")
async def create_comment(
    post_id: str,
    comment: CommentCreate,
    user_id: Annotated[str, Depends(verify_token)]
):
    """Add a comment to a post"""
    try:
        comment_data = {
            "post_id": post_id,
            "user_id": user_id,
            "content": comment.content,
            "parent_id": comment.parent_id
        }
        
        response = supabase.table("comments").insert(comment_data).execute()
        return response.data[0] if response.data else None
    except Exception as e:
        logger.error(f"Error creating comment: {e}")
        raise HTTPException(status_code=500, detail=str(e))

# Products Endpoints
@api_router.get("/products")
async def get_products(user_id: Annotated[str, Depends(verify_token)]):
    """Get all available products"""
    try:
        response = supabase.table("products").select("*").eq("is_active", True).execute()
        return response.data
    except Exception as e:
        logger.error(f"Error fetching products: {e}")
        raise HTTPException(status_code=500, detail=str(e))

# Redemptions Endpoints
@api_router.post("/redemptions")
async def create_redemption(
    redemption: RedemptionCreate,
    user_id: Annotated[str, Depends(verify_token)]
):
    """Redeem a product"""
    try:
        # Get product
        product = supabase.table("products").select("*").eq("id", redemption.product_id).execute()
        if not product.data:
            raise HTTPException(status_code=404, detail="Product not found")
        
        product_data = product.data[0]
        points_cost = product_data['points_cost']
        
        # Check user points
        profile = supabase.table("profiles").select("points").eq("id", user_id).execute()
        user_points = profile.data[0]['points']
        
        if user_points < points_cost:
            raise HTTPException(status_code=400, detail="Insufficient points")
        
        # Create redemption
        redemption_data = {
            "user_id": user_id,
            "product_id": redemption.product_id,
            "points_spent": points_cost,
            "shipping_address": redemption.shipping_address,
            "status": "pending"
        }
        
        redemption_response = supabase.table("redemptions").insert(redemption_data).execute()
        
        # Deduct points
        supabase.table("profiles").update({"points": user_points - points_cost}).eq("id", user_id).execute()
        
        # Record transaction
        supabase.table("points_transactions").insert({
            "user_id": user_id,
            "amount": -points_cost,
            "reason": f"Redeemed {product_data['name']}",
            "reference_id": redemption_response.data[0]['id']
        }).execute()
        
        return redemption_response.data[0]
    except Exception as e:
        logger.error(f"Error creating redemption: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@api_router.get("/redemptions")
async def get_redemptions(user_id: Annotated[str, Depends(verify_token)]):
    """Get user's redemptions"""
    try:
        response = supabase.table("redemptions").select(
            "*, products(name, description, image_url)"
        ).eq("user_id", user_id).order("redeemed_at", desc=True).execute()
        
        return response.data
    except Exception as e:
        logger.error(f"Error fetching redemptions: {e}")
        raise HTTPException(status_code=500, detail=str(e))

# File Upload Endpoint
@api_router.post("/upload")
async def upload_file(
    file: UploadFile = File(...),
    user_id: Annotated[str, Depends(verify_token)] = None,
    folder: str = "media"
):
    """Upload a file to Supabase Storage"""
    try:
        # Read file content
        contents = await file.read()
        
        # Validate file size (max 10MB)
        if len(contents) > 10 * 1024 * 1024:
            raise HTTPException(status_code=400, detail="File too large (max 10MB)")
        
        # Generate unique filename
        file_extension = file.filename.split('.')[-1] if '.' in file.filename else 'jpg'
        unique_filename = f"{user_id}/{folder}/{uuid.uuid4()}.{file_extension}"
        
        # Convert to base64 for storage (simplified approach)
        base64_data = base64.b64encode(contents).decode('utf-8')
        
        # For now, return base64 data URL (in production, upload to Supabase Storage)
        data_url = f"data:{file.content_type};base64,{base64_data}"
        
        return {
            "url": data_url,
            "filename": unique_filename,
            "size": len(contents)
        }
    except Exception as e:
        logger.error(f"Error uploading file: {e}")
        raise HTTPException(status_code=500, detail=str(e))

# Include the router in the main app
app.include_router(api_router)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8001)
