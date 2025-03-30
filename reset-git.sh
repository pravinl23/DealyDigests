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

# Print status before reset
echo "Current git status:"
git status

# Reset any staged changes
echo -e "\nResetting staged changes..."
git reset

# Add all files in the current directory (not parent directories)
echo -e "\nAdding all files in the current project directory..."
git add .

# Install the missing heroicons package
echo -e "\nInstalling @heroicons/react package..."
npm install @heroicons/react

# Check status after reset
echo -e "\nGit status after reset:"
git status

echo -e "\nNow you can commit your changes with:"
echo "git commit -m \"Your commit message\""
echo "git push origin main" 