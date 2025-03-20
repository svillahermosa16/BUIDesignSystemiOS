import os
import json
import shutil
import sys
import logging
from datetime import datetime

# Set up logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    datefmt='%Y-%m-%d %H:%M:%S'
)
logger = logging.getLogger('xcassets-generator')

def create_xcassets(icons_dir, xcassets_dir):
    try:
        # Print current working directory for debugging
        cwd = os.getcwd()
        logger.info(f"Current working directory: {cwd}")
        
        # Log absolute paths
        abs_icons_dir = os.path.abspath(icons_dir)
        abs_xcassets_dir = os.path.abspath(xcassets_dir)
        logger.info(f"Using icons from: {abs_icons_dir}")
        logger.info(f"Creating xcassets at: {abs_xcassets_dir}")
        
        # Check if icons directory exists
        if not os.path.isdir(icons_dir):
            logger.error(f"Error: Source directory '{icons_dir}' does not exist")
            # List parent directory contents to help debugging
            parent_dir = os.path.dirname(icons_dir)
            if os.path.exists(parent_dir):
                logger.info(f"Contents of parent directory '{parent_dir}':")
                for item in os.listdir(parent_dir):
                    logger.info(f"  - {item}")
            return False
            
        # List contents of icons directory
        logger.info(f"Contents of icons directory '{icons_dir}':")
        icon_files = os.listdir(icons_dir)
        for item in icon_files:
            logger.info(f"  - {item}")
            
        if not icon_files:
            logger.error("No files found in the icons directory")
            return False
            
        # Create the appiconset directory
        appiconset_dir = os.path.join(xcassets_dir, "AppIcon.appiconset")
        os.makedirs(appiconset_dir, exist_ok=True)
        logger.info(f"Created directory: {appiconset_dir}")
        
        images = []
        valid_extensions = (".png", ".jpg", ".jpeg")
        processed_files = 0
        
        # Process each icon file
        for icon in icon_files:
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
                    processed_files += 1
                    
                except Exception as e:
                    logger.error(f"Error processing {icon}: {e}")
        
        logger.info(f"Processed {processed_files} image files")
        
        if not images:
            logger.error(f"No valid image files found in {icons_dir}")
            return False
            
        # Create and write Contents.json
        contents = {
            "images": images,
            "info": {
                "version": 1,
                "author": "xcode"
            }
        }
        
        contents_path = os.path.join(appiconset_dir, "Contents.json")
        with open(contents_path, "w") as f:
            json.dump(contents, f, indent=2)
        
        logger.info(f"Created Contents.json at {contents_path}")
        logger.info(f"Successfully created AppIcon.appiconset with {len(images)} icons")
        
        # List contents of xcassets directory after generation
        logger.info(f"Contents of xcassets directory after creation:")
        for root, dirs, files in os.walk(xcassets_dir):
            for name in files:
                logger.info(f"  File: {os.path.join(root, name)}")
            for name in dirs:
                logger.info(f"  Dir: {os.path.join(root, name)}")
                
        return True
        
    except Exception as e:
        logger.error(f"Unexpected error creating xcassets: {e}")
        import traceback
        logger.error(traceback.format_exc())
        return False

if __name__ == "__main__":
    # Log script startup
    logger.info(f"Script started at: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    logger.info(f"Script run by: {os.environ.get('USER', 'unknown')}")
    
    # Default paths based on your original script
    icons_dir = "Sources/BUIDesignSystemiOS/PNGIcons"
    xcassets_dir = "BUI-Icons.xcassets"
    
    logger.info(f"Using default paths: icons_dir={icons_dir}, xcassets_dir={xcassets_dir}")
    
    # Check command line arguments (can be added later if needed)
    
    success = create_xcassets(icons_dir, xcassets_dir)
    
    if success:
        logger.info("Script completed successfully")
        sys.exit(0)
    else:
        logger.error("Script failed")
        sys.exit(1)sys.exit(1)
