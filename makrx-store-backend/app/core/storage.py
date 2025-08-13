"""
S3/MinIO storage utilities for file uploads and management
Presigned URLs, file operations, and storage management
"""

import boto3
from botocore.config import Config
from botocore.exceptions import ClientError, NoCredentialsError
from typing import Dict, Optional, BinaryIO
import logging
from datetime import datetime, timedelta
import hashlib
import mimetypes
import uuid

from app.core.config import settings

logger = logging.getLogger(__name__)

class StorageClient:
    """S3/MinIO storage client wrapper"""
    
    def __init__(self):
        self.client = self._create_client()
        self.bucket = settings.S3_BUCKET
    
    def _create_client(self):
        """Create S3 client with configuration"""
        try:
            # Configure client with custom endpoint for MinIO
            config = Config(
                region_name=settings.S3_REGION,
                retries={'max_attempts': 3, 'mode': 'adaptive'},
                max_pool_connections=50
            )
            
            client = boto3.client(
                's3',
                endpoint_url=settings.S3_ENDPOINT if not settings.S3_ENDPOINT.startswith('https://s3.') else None,
                aws_access_key_id=settings.S3_ACCESS_KEY,
                aws_secret_access_key=settings.S3_SECRET_KEY,
                config=config,
                use_ssl=settings.S3_USE_SSL
            )
            
            # Test connection
            client.head_bucket(Bucket=self.bucket)
            logger.info(f"Connected to S3/MinIO bucket: {self.bucket}")
            
            return client
            
        except Exception as e:
            logger.error(f"Failed to initialize storage client: {e}")
            raise
    
    async def generate_presigned_upload_url(
        self,
        file_key: str,
        content_type: str,
        expires_in: int = 3600,
        max_size: int = None
    ) -> Dict[str, any]:
        """Generate presigned URL for file upload"""
        try:
            conditions = []
            
            # Add content type condition
            if content_type:
                conditions.append({"Content-Type": content_type})
            
            # Add file size limit
            if max_size:
                conditions.append(["content-length-range", 1, max_size])
            
            # Generate presigned POST URL
            response = self.client.generate_presigned_post(
                Bucket=self.bucket,
                Key=file_key,
                Fields={"Content-Type": content_type},
                Conditions=conditions,
                ExpiresIn=expires_in
            )
            
            return {
                "upload_url": response["url"],
                "fields": response["fields"],
                "file_key": file_key,
                "expires_in": expires_in
            }
            
        except ClientError as e:
            logger.error(f"Failed to generate presigned upload URL: {e}")
            raise Exception(f"Storage error: {e}")
    
    async def generate_presigned_download_url(
        self,
        file_key: str,
        expires_in: int = 3600,
        filename: Optional[str] = None
    ) -> str:
        """Generate presigned URL for file download"""
        try:
            params = {
                'Bucket': self.bucket,
                'Key': file_key
            }
            
            # Set content disposition for download filename
            if filename:
                params['ResponseContentDisposition'] = f'attachment; filename="{filename}"'
            
            url = self.client.generate_presigned_url(
                'get_object',
                Params=params,
                ExpiresIn=expires_in
            )
            
            return url
            
        except ClientError as e:
            logger.error(f"Failed to generate presigned download URL: {e}")
            raise Exception(f"Storage error: {e}")
    
    async def get_file_info(self, file_key: str) -> Dict[str, any]:
        """Get file metadata"""
        try:
            response = self.client.head_object(Bucket=self.bucket, Key=file_key)
            
            return {
                "exists": True,
                "size": response.get("ContentLength", 0),
                "content_type": response.get("ContentType"),
                "last_modified": response.get("LastModified"),
                "etag": response.get("ETag", "").strip('"'),
                "metadata": response.get("Metadata", {})
            }
            
        except ClientError as e:
            if e.response['Error']['Code'] == '404':
                return {"exists": False}
            logger.error(f"Failed to get file info: {e}")
            raise Exception(f"Storage error: {e}")
    
    async def delete_file(self, file_key: str) -> bool:
        """Delete file from storage"""
        try:
            self.client.delete_object(Bucket=self.bucket, Key=file_key)
            logger.info(f"Deleted file: {file_key}")
            return True
            
        except ClientError as e:
            logger.error(f"Failed to delete file {file_key}: {e}")
            return False
    
    async def copy_file(self, source_key: str, dest_key: str) -> bool:
        """Copy file within the same bucket"""
        try:
            copy_source = {'Bucket': self.bucket, 'Key': source_key}
            self.client.copy_object(
                CopySource=copy_source,
                Bucket=self.bucket,
                Key=dest_key
            )
            return True
            
        except ClientError as e:
            logger.error(f"Failed to copy file {source_key} to {dest_key}: {e}")
            return False
    
    async def upload_file_directly(
        self,
        file_obj: BinaryIO,
        file_key: str,
        content_type: str,
        metadata: Optional[Dict[str, str]] = None
    ) -> bool:
        """Upload file directly (for server-side uploads)"""
        try:
            extra_args = {
                'ContentType': content_type
            }
            
            if metadata:
                extra_args['Metadata'] = metadata
            
            self.client.upload_fileobj(
                file_obj,
                self.bucket,
                file_key,
                ExtraArgs=extra_args
            )
            
            logger.info(f"Uploaded file: {file_key}")
            return True
            
        except ClientError as e:
            logger.error(f"Failed to upload file {file_key}: {e}")
            return False

# Global storage client instance
storage = StorageClient()

def generate_file_key(user_id: Optional[str], file_extension: str, prefix: str = "uploads") -> str:
    """Generate unique file key for storage"""
    timestamp = datetime.utcnow().strftime("%Y%m%d")
    unique_id = str(uuid.uuid4())
    
    if user_id:
        return f"{prefix}/{user_id}/{timestamp}/{unique_id}{file_extension}"
    else:
        return f"{prefix}/anonymous/{timestamp}/{unique_id}{file_extension}"

def get_content_type(filename: str) -> str:
    """Get content type from filename"""
    content_type, _ = mimetypes.guess_type(filename)
    return content_type or "application/octet-stream"

def validate_file_extension(filename: str) -> bool:
    """Validate file extension against allowed types"""
    extension = filename.lower().split('.')[-1] if '.' in filename else ''
    return f".{extension}" in settings.ALLOWED_UPLOAD_EXTENSIONS

def calculate_file_hash(file_obj: BinaryIO) -> str:
    """Calculate SHA-256 hash of file content"""
    sha256_hash = hashlib.sha256()
    
    # Reset file pointer
    file_obj.seek(0)
    
    # Read file in chunks
    for chunk in iter(lambda: file_obj.read(4096), b""):
        sha256_hash.update(chunk)
    
    # Reset file pointer again
    file_obj.seek(0)
    
    return sha256_hash.hexdigest()

async def cleanup_expired_files():
    """Cleanup expired upload files (called by background task)"""
    try:
        # This would typically query the database for expired uploads
        # and delete them from storage
        logger.info("Cleaning up expired files...")
        
        # Implementation would go here
        # 1. Query database for uploads with status='uploaded' and created_at < threshold
        # 2. Delete files from storage
        # 3. Update database records
        
    except Exception as e:
        logger.error(f"Failed to cleanup expired files: {e}")

# Storage health check
async def check_storage_health() -> bool:
    """Check storage connectivity and health"""
    try:
        # Try to list bucket to verify connection
        storage.client.head_bucket(Bucket=storage.bucket)
        return True
    except Exception as e:
        logger.error(f"Storage health check failed: {e}")
        return False
