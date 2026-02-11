# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.2] - 2026-02-11

### Fixed
- Fixed infinite loop causing hundreds of console logs
- Added state change detection to only update when entities change
- Improved canvas initialization with proper DOM timing
- Better canvas resizing and rendering performance
- Reduced console logging spam

## [1.0.1] - 2026-02-11

### Fixed
- Added debug logging for entity detection
- Added error message when no valid entities found
- Improved hass object handling on card load
- Better console warnings for missing entities

## [1.0.0] - 2026-02-11

### Added
- Initial release
- Interactive frequency response curve with drag control
- Mobile-optimized touch controls
- Real-time updates to Home Assistant entities
- Customizable colors and dimensions
- Visual grid with dB and frequency markers
- Smooth Bezier curve interpolation
- Reset to 0 dB button
- Support for custom min/max dB ranges
- HACS compatibility

### Features
- Canvas-based rendering for smooth performance
- Automatic frequency label extraction (Hz/kHz)
- Touch and mouse event support
- Responsive design for all screen sizes

[1.0.0]: https://github.com/farmed-switch/HA-DSP-Controller/releases/tag/v1.0.0
