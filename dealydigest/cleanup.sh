#!/bin/bash

# Check out a new branch
git checkout -b cleanup-branch

# Remove spellcast-ai directory from git repository (but not locally)
git rm -r --cached spellcast-ai 2>/dev/null || echo "No spellcast-ai directory in repo"

# Create a .gitignore entry to ensure spellcast-ai is not added back
if ! grep -q "spellcast-ai" .gitignore; then
  echo "# Ignore spellcast-ai folder" >> .gitignore
  echo "spellcast-ai/" >> .gitignore
  echo "Added spellcast-ai/ to .gitignore"
fi

# Check if we have changes to commit
if git status --porcelain | grep -q .; then
  # Commit changes
  git add .gitignore
  git commit -m "Remove spellcast-ai directory and update .gitignore"
  echo "Changes committed"
  
  # Push to main branch
  git checkout main
  git merge cleanup-branch
  git push origin main
  echo "Changes pushed to main branch"
else
  echo "No changes to commit"
fi

# Cleanup
git branch -D cleanup-branch

echo "Done!" 