"""
TravelMate AI - Supabase Client
"""
from supabase import create_client, Client
from app.core.config import settings
import logging

logger = logging.getLogger(__name__)


def get_supabase_client() -> Client:
    """Get Supabase client with anon key (for user-level access)"""
    if not settings.SUPABASE_URL or not settings.SUPABASE_ANON_KEY:
        logger.warning("Supabase not configured - running in demo mode")
        return None
    return create_client(settings.SUPABASE_URL, settings.SUPABASE_ANON_KEY)


def get_supabase_admin_client() -> Client:
    """Get Supabase client with service role key (for admin operations)"""
    if not settings.SUPABASE_URL or not settings.SUPABASE_SERVICE_KEY:
        logger.warning("Supabase admin not configured - running in demo mode")
        return None
    return create_client(settings.SUPABASE_URL, settings.SUPABASE_SERVICE_KEY)
