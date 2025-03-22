#!/bin/bash

# Create the blog images directory if it doesn't exist
mkdir -p public/blog

# Download placeholder images from Unsplash
# General roofing topics
curl -o public/blog/new-roof-signs.jpg "https://source.unsplash.com/1600x900/?roof,construction"
curl -o public/blog/roof-cost-guide.jpg "https://source.unsplash.com/1600x900/?roofing,house"
curl -o public/blog/emergency-repairs.jpg "https://source.unsplash.com/1600x900/?roof,repair"
curl -o public/blog/roofing-materials.jpg "https://source.unsplash.com/1600x900/?tiles,slate"
curl -o public/blog/winter-maintenance.jpg "https://source.unsplash.com/1600x900/?winter,roof"

# Location-specific images
curl -o public/blog/glasgow-roofers.jpg "https://source.unsplash.com/1600x900/?glasgow,architecture"
curl -o public/blog/london-roofing.jpg "https://source.unsplash.com/1600x900/?london,skyline"
curl -o public/blog/chichester-roofing.jpg "https://source.unsplash.com/1600x900/?chichester,cathedral"

# Make the script executable
chmod +x scripts/generate-blog-images.sh

echo "Blog images have been downloaded successfully!" 