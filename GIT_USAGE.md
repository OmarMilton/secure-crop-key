# Git Usage Guide

## Initial Setup (Already Done ✅)

The repository has been configured with:
- **Git User**: OmarMilton
- **Git Email**: llimsy3172574@outlook.com
- **Remote URL**: https://github.com/OmarMilton/secure-crop-key.git

## How to Push Changes to GitHub

### Method 1: Use Auto-Push Script (Recommended)

#### Windows (PowerShell)
```powershell
.\auto-push.ps1
```

#### Linux/Mac (Bash)
```bash
chmod +x auto-push.sh
./auto-push.sh
```

The script will:
1. Add all changes
2. Ask for a commit message (or use default timestamp)
3. Commit changes
4. Push to GitHub

### Method 2: Manual Git Commands

```bash
# Add all changes
git add .

# Commit with message
git commit -m "Your commit message here"

# Push to GitHub
git push origin main
```

### Method 3: Using Git Hooks (Automatic)

A post-commit hook has been created at `.git/hooks/post-commit` that will automatically push after each commit.

**Note**: The hook may need execute permissions on Linux/Mac:
```bash
chmod +x .git/hooks/post-commit
```

## Common Git Commands

### Check Status
```bash
git status
```

### View Changes
```bash
git diff
```

### View Commit History
```bash
git log
```

### Pull Latest Changes
```bash
git pull origin main
```

### Create a New Branch
```bash
git checkout -b feature/your-feature-name
git push -u origin feature/your-feature-name
```

## Important Notes

1. **Always pull before pushing** if working with others:
   ```bash
   git pull origin main
   git push origin main
   ```

2. **Commit messages should be descriptive**:
   - Good: "Add soil moisture encryption feature"
   - Bad: "update"

3. **Don't commit sensitive files**:
   - `.env` files
   - Private keys
   - API keys
   - These are already in `.gitignore`

4. **Regular commits**: Commit and push frequently to avoid large conflicts

## Troubleshooting

### If push is rejected:
```bash
git pull origin main
# Resolve any conflicts
git add .
git commit -m "Merge conflicts resolved"
git push origin main
```

### If you need to force push (use with caution):
```bash
git push origin main --force
```

### Reset to last commit (discard local changes):
```bash
git reset --hard HEAD
```

### Undo last commit (keep changes):
```bash
git reset --soft HEAD~1
```

