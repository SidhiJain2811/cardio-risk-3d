"""
Launch Script for Cardio3D Full-Stack Application
"""

import os
import sys
import uvicorn

if __name__ == "__main__":
    base_dir = os.path.dirname(os.path.abspath(__file__))
    backend_dir = os.path.join(base_dir, "backend")
    if backend_dir not in sys.path:
        sys.path.insert(0, backend_dir)
    
    print("=" * 60)
    print("  Cardio3D: Cardiovascular Risk Visualization & Prediction")
    print("  Multimodal AI Hackathon 2026 - Track A")
    print("  Server running at: http://localhost:8000")
    print("=" * 60)
    
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=False)
