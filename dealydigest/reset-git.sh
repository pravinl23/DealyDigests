#!/bin/bash

# Exit if any command fails
set -e

echo "Resetting git configuration and pushing to GitHub..."

# Make sure we're in the project root directory
cd "$(dirname "$0")"

# Remove existing git config if any
rm -rf .git

# Initialize a new git repository
git init

# Add all files
git add .

# Commit all changes
git commit -m "Initial commit: Dynamic transaction graph with real-time updates"

# Add the remote repository
git remote add origin https://github.com/pravinl23/DealyDigests.git

# Push to GitHub
git push -u origin main --force

echo "Git reset and push completed successfully!" 