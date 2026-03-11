#!/bin/bash

cd /var/www/c41.ch-be

echo "Checking that vendor directory exists..."
if [ ! -d "vendor" ]; then
    echo "ERROR: The vendor directory does not exist"
    exit 1
fi

echo "Compressing vendor directory..."
tar -czf vendor.tar.gz vendor/

if [ -f "vendor.tar.gz" ]; then
    SIZE=$(du -h vendor.tar.gz | cut -f1)
    echo "✅ vendor.tar.gz created successfully"
    echo "Size: $SIZE"
    echo ""
    echo "Archive ready to upload: $(pwd)/vendor.tar.gz"
else
    echo "ERROR: vendor.tar.gz could not be created"
    exit 1
fi
