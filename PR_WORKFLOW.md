# Working with Pull Requests

## Current Status
✅ **Hard reset complete** - Your local repository now matches GitHub exactly.

## Viewing Open PRs

### Option 1: GitHub Web Interface
Visit: https://github.com/Pastorsimon1798/CyberWitches/pulls

This will show you all open pull requests with their status, reviews, and any issues.

### Option 2: Check Out PR Branches Locally

I found these remote branches that might be PRs:
- `origin/claude/analyze-game-copy-lore-011CUyk9gnZLmeGMiwdkniRs`
- `origin/claude/audit-codebase-optimization-01CHj6m7Bx3WssgVC5N7dTVF`
- `origin/claude/codebase-analysis-review-011CUuhsJdMMKm4bNKTDhN3z`
- `origin/claude/profile-improvements-011CUzjXm4XcLmYyMtAurepo`
- `origin/cursor/audit-and-optimize-game-frontend-gemini-3-pro-preview-2141`
- `origin/cursor/optimize-code-for-performance-and-load-times-7f51`

## How to Check Out a PR Branch Locally

### Method 1: Check out a specific branch
```bash
# Fetch all remote branches
git fetch origin

# Check out a specific branch
git checkout -b local-branch-name origin/remote-branch-name

# Example:
git checkout -b analyze-lore origin/claude/analyze-game-copy-lore-011CUyk9gnZLmeGMiwdkniRs
```

### Method 2: If you know the PR number
```bash
# Fetch the PR (replace PR_NUMBER with actual number)
git fetch origin pull/PR_NUMBER/head:pr-PR_NUMBER

# Check it out
git checkout pr-PR_NUMBER
```

### Method 3: Using GitHub CLI (after authentication)
```bash
# First authenticate
gh auth login

# List open PRs
gh pr list

# Check out a PR by number
gh pr checkout PR_NUMBER
```

## Working on PR Issues

Once you've checked out a PR branch:

1. **Review the changes:**
   ```bash
   git log origin/main..HEAD  # See commits in PR
   git diff origin/main...HEAD  # See all changes
   ```

2. **Test the changes:**
   ```bash
   npm install
   npm test
   npm run build
   ```

3. **Fix any issues:**
   - Make your changes
   - Test them
   - Commit and push to the same branch

4. **Merge to main (if approved):**
   ```bash
   git checkout main
   git pull origin main
   git merge pr-branch-name
   git push origin main
   ```

## Next Steps

1. Visit https://github.com/Pastorsimon1798/CyberWitches/pulls to see open PRs
2. Identify which PRs need attention
3. Check out the relevant branches locally
4. Review and fix any issues
5. Push fixes back to the PR branch

