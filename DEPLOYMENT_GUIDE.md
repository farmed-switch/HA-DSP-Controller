# How to Push to GitHub

This guide will help you push this HACS-ready card to your GitHub repository.

## Prerequisites

Make sure you have Git installed and configured with your GitHub account.

## Step-by-Step Instructions

### 1. Navigate to the project directory

```powershell
cd C:\GPT\gomining\pi4\HA-DSP-Controller
```

### 2. Initialize Git repository (if not already done)

```powershell
git init
```

### 3. Add all files to Git

```powershell
git add .
```

### 4. Commit the files

```powershell
git commit -m "Initial release: DSP Controller Card v1.0.0"
```

### 5. Add your GitHub repository as remote

```powershell
git remote add origin https://github.com/farmed-switch/HA-DSP-Controller.git
```

### 6. Push to GitHub

```powershell
git branch -M main
git push -u origin main
```

### 7. Create a release tag (for HACS)

```powershell
git tag v1.0.0
git push origin v1.0.0
```

This will trigger the GitHub Actions workflow to create a release automatically.

## Adding to HACS Default Repository (Optional)

To get your card listed in the official HACS default repository:

1. Go to https://github.com/hacs/default
2. Fork the repository
3. Edit `custom-components.json` or create a PR
4. Follow their contribution guidelines

For now, users can add your repository as a custom HACS repository using:
```
https://github.com/farmed-switch/HA-DSP-Controller
```

## Updating the Card

When you make changes:

```powershell
git add .
git commit -m "Description of changes"
git push

# For new releases:
git tag v1.0.1
git push origin v1.0.1
```

Remember to update:
- `package.json` version number
- `CHANGELOG.md` with changes
- Version in `dist/dsp-controller-card.js` console.info()

## Repository Settings

Make sure your GitHub repository has:
- ✅ Issues enabled (for bug reports)
- ✅ Public visibility
- ✅ Topics: `home-assistant`, `lovelace`, `custom-card`, `hacs`
- ✅ Description: "A modern graphical equalizer card with interactive curve control for Home Assistant"

## Done!

Your card is now ready for HACS installation. Users can add it via:
1. HACS → Frontend → ⋮ → Custom repositories
2. Add: `https://github.com/farmed-switch/HA-DSP-Controller`
3. Category: Lovelace
