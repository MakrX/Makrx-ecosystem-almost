#!/usr/bin/env python3
"""
Startup script for MakrCave Backend API

This script starts the FastAPI server with proper configuration.
"""

import uvicorn
import os
import sys
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

def main():
    """Main startup function"""
    # Configuration
    host = os.getenv("HOST", "0.0.0.0")
    port = int(os.getenv("PORT", 8000))
    reload = os.getenv("DEBUG", "True").lower() == "true"
    log_level = os.getenv("LOG_LEVEL", "info").lower()
    
    print("🚀 Starting MakrCave Backend API...")
    print(f"📍 Host: {host}")
    print(f"🔌 Port: {port}")
    print(f"🔄 Reload: {reload}")
    print(f"📊 Log Level: {log_level}")
    print(f"📚 API Docs: http://{host}:{port}/docs")
    print("=" * 50)
    
    # Start the server
    try:
        uvicorn.run(
            "main:app",
            host=host,
            port=port,
            reload=reload,
            log_level=log_level,
            access_log=True
        )
    except KeyboardInterrupt:
        print("\n👋 Shutting down MakrCave Backend API...")
    except Exception as e:
        print(f"❌ Error starting server: {e}")
        sys.exit(1)

if __name__ == "__main__":
    main()
