import os
import json

def create_xcassets(icons_dir, xcassets_dir):
    appiconset_dir = os.path.join(xcassets_dir, "AppIcon.appiconset")
    os.makedirs(appiconset_dir, exist_ok=True)

    images = []
    for icon in os.listdir(icons_dir):
        if icon.endswith((".png", ".jpg", ".jpeg")):
            filename = os.path.basename(icon)
            images.append({
                "filename": filename,
                "idiom": "universal",
                "scale": "1x" if "1x" in filename else "2x" if "2x" in filename else "3x",
            })
            # Copy the icon file to the appiconset directory
            os.system(f"cp {os.path.join(icons_dir, icon)} {appiconset_dir}")

    contents = {
        "images": images,
        "info": {
            "version": 1,
            "author": "xcode"
        }
    }

    with open(os.path.join(appiconset_dir, "Contents.json"), "w") as f:
        json.dump(contents, f, indent=2)

if __name__ == "__main__":
    # Update this path to the correct sub-directory inside Sources
    icons_dir = "Sources/BUIDesignSystemiOS/PNGIcons"
    xcassets_dir = "BUI-Icons.xcassets"
    create_xcassets(icons_dir, xcassets_dir)
