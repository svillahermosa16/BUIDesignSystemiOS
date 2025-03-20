import os
import json
import shutil
import argparse
import sys
from pathlib import Path
import logging

# Set up logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    datefmt='%Y-%m-%d %H:%M:%S'
)
logger = logging.getLogger('xcassets-generator')

def create_xcassets(icons_dir, xcassets_dir):
    try:
        # Ensure input directory exists
        if not os.path.isdir(icons_dir):
            logger.error(f"Error: Source directory '{icons_dir}' does not exist")
            return False
            
        # Create the appiconset directory
        appiconset_dir = os.path.join(xcassets_dir, "AppIcon.appiconset")
        os.makedirs(appiconset_dir, exist_ok=True)
        logger.info(f"Created directory: {appiconset_dir}")
        
        images = []
        valid_extensions = (".png", ".jpg", ".jpeg")
        
        # Process each icon file
        for icon in os.listdir(icons_dir):
            if icon.lower().endswith(valid_extensions):
                try:
                    source_path = os.path.join(icons_dir, icon)
                    dest_path = os.path.join(appiconset_dir, icon)
                    
                    # Extract scale from filename
                    scale = "1x"
                    if "2x" in icon:
                        scale = "2x"
                    elif "3x" in icon:
                        scale = "3x"
                    
                    # Add to images list
                    images.append({
                        "filename": icon,
                        "idiom": "universal",
                        "scale": scale,
                    })
                    
                    # Copy file using shutil instead of os.system
                    shutil.copy2(source_path, dest_path)
                    logger.info(f"Copied {icon} to {appiconset_dir}")
                    
                except Exception as e:
                    logger.error(f"Error processing {icon}: {e}")
        
        if not images:
            logger.warning(f"No valid image files found in {icons_dir}")
            return False
            
        # Create and write Contents.json
        contents = {
            "images": images,
            "info": {
                "version": 1,
                "author": "xcode"
            }
        }
        
        with open(os.path.join(appiconset_dir, "Contents.json"), "w") as f:
            json.dump(contents, f, indent=2)
            
        logger.info(f"Successfully created AppIcon.appiconset with {len(images)} icons")
        return True
        
    except Exception as e:
        logger.error(f"Error creating xcassets: {e}")
        return False

if __name__ == "__main__":
    # Default paths based on your original script
    default_icons_dir = "Sources/BUIDesignSystemiOS/PNGIcons"
    default_xcassets_dir = "BUI-Icons.xcassets"
    
    # Get current user for logging purposes
    current_user = os.environ.get('USER', 'unknown')
    logger.info(f"Script started by user: {current_user}")
    
    parser = argparse.ArgumentParser(description='Create xcassets for iOS app icons.')
    parser.add_argument('--icons-dir', default=default_icons_dir, 
                        help=f'Directory containing icon files (default: {default_icons_dir})')
    parser.add_argument('--xcassets-dir', default=default_xcassets_dir, 
                        help=f'Output xcassets directory (default: {default_xcassets_dir})')
    args = parser.parse_args()
    
    logger.info(f"Processing icons from {args.icons_dir} to {args.xcassets_dir}")
    success = create_xcassets(args.icons_dir, args.xcassets_dir)
    
    if success:
        logger.info("Script completed successfully")
        sys.exit(0)
    else:
        logger.error("Script failed")
        sys.exit(1)
