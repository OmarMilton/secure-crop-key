#!/bin/bash
# Auto-push script for Linux/Mac
# Run this script after making changes to automatically push to GitHub

echo "Adding all changes..."
git add .

echo "Committing changes..."
read -p "Enter commit message (or press Enter for default): " commit_message
if [ -z "$commit_message" ]; then
    commit_message="Update: $(date '+%Y-%m-%d %H:%M:%S')"
fi

git commit -m "$commit_message"

echo "Pushing to GitHub..."
git push origin main

echo "Done! Changes pushed to GitHub."

