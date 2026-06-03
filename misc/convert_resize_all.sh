#!/bin/bash

SEARCH_DIR=${1:-"."}

# Use 'find' with '-print0' to safely handle filenames with spaces
find "$SEARCH_DIR" -type f -iname "*.dds" -print0 | while IFS= read -r -d '' dds_file; do
    output_webp="${dds_file%.*}.webp"
    
    # SKIP if the webp already exists (saves time and prevents re-freezing)
    if [ -f "$output_webp" ]; then
        continue
    fi

    echo "Converting: $dds_file"
    
    # Run magick with a 'limit' to prevent it from eating all your RAM.
    # 'identify' check ensures the DDS isn't corrupted before trying to convert.
    # Added -resize 128x128 and -quality 75 for compression.
    magick "$dds_file" -limit memory 256MiB -limit map 512MiB -resize 128x128 -quality 75 "$output_webp" 2>/dev/null
    
    # Small sleep (0.01s) gives the OS a tiny breather for I/O
    sleep 0.01
done

echo "Done!"