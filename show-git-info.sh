#!/bin/bash

# Show git remote information
echo "Git Remote Configuration:"
git remote -v

# Show branch information
echo -e "\nBranch Information:"
git branch -v

# Show current status
echo -e "\nCurrent Status:"
git status --short

# Show last commit
echo -e "\nLast Commit:"
git log -1 --oneline 