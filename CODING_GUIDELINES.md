# 🛡️ Coding Guidelines - Preventing Duplicate Files

## 📋 Overview
This document outlines the rules and best practices to prevent duplicate file creation in our TypeScript/React project.

## 🚫 File Extension Rules

### ✅ ALLOWED File Types
- **Server files**: `.ts` only
- **Client components**: `.tsx` only
- **Client utilities**: `.ts` only
- **Configuration**: `.ts` (except specific config files)

### ❌ FORBIDDEN File Types
- `.js` files (except config files)
- `.jsx` files
- Mixed extensions for same functionality

### 📁 Allowed JavaScript Files
Only these specific files are allowed to have `.js` extension:
```
vite.config.js
postcss.config.js
eslint.config.js
tailwind.config.js
package.json
tsconfig.json
```

## 🛠️ Development Workflow

### 1. Creating New Files
```bash
# ✅ Correct
touch client/src/components/NewComponent.tsx
touch server/newService.ts

# ❌ Wrong
touch client/src/components/NewComponent.jsx
touch server/newService.js
```

### 2. File Naming Convention
- **Components**: `ComponentName.tsx`
- **Hooks**: `useHookName.ts`
- **Services**: `serviceName.ts`
- **Utilities**: `utilityName.ts`
- **Pages**: `pageName.tsx`

### 3. Import Statements
```typescript
// ✅ Correct
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";

// ❌ Wrong - Don't mix extensions
import Button from "./Button.jsx"; // Wrong extension
```

## 🔧 Tools & Automation

### ESLint Rules
Our ESLint configuration prevents duplicate files:
```json
{
  "rules": {
    "no-duplicate-files/no-duplicate-files": [
      "error",
      {
        "patterns": ["**/*.js", "**/*.jsx"],
        "exceptions": ["vite.config.js", "postcss.config.js"]
      }
    ]
  }
}
```

### Pre-commit Hooks
Automatic checks run before each commit:
```bash
# Checks for:
✅ Duplicate files
✅ TypeScript compilation
✅ ESLint rules
✅ Code formatting
```

### VS Code Settings
IDE configured to prevent wrong file types:
```json
{
  "files.exclude": {
    "**/*.js": true,
    "**/*.jsx": true
  }
}
```

## 🧹 Maintenance Scripts

### Clean Duplicates Script
```bash
# Check for duplicates
node scripts/clean-duplicates.js

# Auto-clean duplicates
node scripts/clean-duplicates.js --auto
```

### Regular Maintenance
Run these commands regularly:
```bash
# Check for issues
npm run check
npm run lint

# Clean any accidental duplicates
node scripts/clean-duplicates.js --auto
```

## 📝 Code Review Checklist

### ✅ Before Committing
- [ ] No `.js` or `.jsx` files created
- [ ] All imports use correct extensions
- [ ] TypeScript compilation passes
- [ ] ESLint passes
- [ ] No duplicate functionality

### ✅ Code Review Questions
- [ ] Are there any new `.js`/`.jsx` files?
- [ ] Do all imports use TypeScript extensions?
- [ ] Is the file structure consistent?
- [ ] Does the build pass?

## 🚨 Emergency Procedures

### If Duplicate Files Are Found
1. **Stop development** immediately
2. **Run cleanup script**:
   ```bash
   node scripts/clean-duplicates.js --auto
   ```
3. **Check git status**:
   ```bash
   git status
   ```
4. **Remove from git if needed**:
   ```bash
   git rm --cached *.js *.jsx
   ```

### If Build Fails Due to Duplicates
1. **Identify duplicates**:
   ```bash
   find . -name "*.js" -o -name "*.jsx" | grep -v node_modules
   ```
2. **Remove manually** or use script
3. **Rebuild**:
   ```bash
   npm run build
   ```

## 🎯 Best Practices

### 1. IDE Configuration
- Use VS Code with our settings
- Enable ESLint extension
- Enable Prettier extension
- Disable auto-creation of `.js` files

### 2. Git Workflow
- Always run `npm run check` before committing
- Use `git status` to verify no unwanted files
- Review changes before pushing

### 3. Team Communication
- Inform team about these rules
- Share this document with new developers
- Regular reminders about file extension rules

### 4. Continuous Monitoring
- Regular code reviews
- Automated CI/CD checks
- Periodic duplicate file scans

## 📞 Support

### Getting Help
- Check this document first
- Run `npm run check` for issues
- Use `node scripts/clean-duplicates.js` for cleanup
- Ask team lead for complex issues

### Common Issues & Solutions

**Issue**: Accidentally created `.jsx` file
**Solution**: Delete it and recreate as `.tsx`

**Issue**: Build fails due to duplicates
**Solution**: Run cleanup script and rebuild

**Issue**: ESLint errors about duplicates
**Solution**: Remove duplicate files manually

## 📈 Metrics & Monitoring

### Success Indicators
- ✅ Zero duplicate files in repository
- ✅ All builds pass
- ✅ No ESLint duplicate file errors
- ✅ Consistent file extensions across project

### Regular Audits
- Weekly: Check for new duplicates
- Monthly: Review file structure
- Quarterly: Update guidelines if needed

---

**Remember**: Prevention is better than cure. Follow these guidelines to maintain a clean, TypeScript-only codebase! 🚀