# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [2.0.2] - 2026-02-11

### Changed
- Removed volume slider label text to save vertical space and improve canvas fit

## [2.0.1] - 2026-02-11

### Added
- **Media Player Support**: Volume control now works with `media_player` entities (e.g., Snapcast clients)
  - Automatically detects entity domain and uses correct service calls
  - Media player volume (0.0-1.0) is converted to 0-100 for display
  - Uses `media_player.volume_set` service for media players
  - Uses `number.set_value` service for number entities

### Fixed
- Volume entity picker now shows `media_player`, `number`, and `input_number` entities
- Proper handling of media_player `volume_level` attribute vs number entity `state`
- Volume slider positioning moved down to prevent overlap with rotated frequency labels
- Frequency labels moved down slightly for better spacing

## [2.0.0] - 2026-02-11

### Added - Major Release 🎉
- **Optional Master Volume Slider**: Horizontal volume control at the bottom of the card
  - Fully optional via `volume_entity` configuration parameter
  - Same color scheme as EQ curve (green gradient fill)
  - Smooth drag handle with glow effect
  - Real-time value display with entity name
  - Supports both `number` and `input_number` entities
  - Touch and mouse support with 10px tolerance for easy interaction
  - Integrates seamlessly with existing EQ design

### Changed
- Volume slider appears automatically when `volume_entity` is configured in editor
- Configuration editor now includes volume entity picker
- Enhanced pointer event handling to support both EQ and volume dragging

### Why 2.0?
This release adds a major new optional feature (master volume control) that significantly expands the card's functionality beyond pure EQ visualization, making it a complete audio control interface.

## [1.0.6] - 2026-02-11

### Fixed
- Frequency labels now rotate -45° to prevent overlap when bands are close together
- Smart label spacing: automatically skips every other label when spacing < 30px
- Improved text alignment for rotated labels (professional EQ style)

### Changed
- Font size reduced to 10px for cleaner appearance with rotation
- Labels positioned closer to grid edge

## [1.0.5] - 2026-02-11

### Fixed
- **Complete editor rewrite**: Replaced broken custom editor with Home Assistant's built-in form system
- All input fields now work correctly (title, height, min/max dB)
- Entity picker now displays and works properly with domain filter for number entities
- Multi-select entity picker allows adding multiple EQ bands at once

### Changed
- Editor now uses `getConfigForm()` with official Home Assistant selectors
- Removed 250+ lines of buggy custom editor code
- Cleaner, more maintainable implementation

## [1.0.4] - 2026-02-11

### Fixed
- Fixed input fields in visual editor not accepting text input
- Fixed event handlers for all configuration inputs (title, height, min/max dB)

### Changed
- Reset button is now hidden by default (can be enabled via "Show Reset Button" toggle in editor)
- Added visual toggle switch in editor to show/hide the reset button

### Added
- "Show Reset Button" toggle in configuration editor for safer default behavior

## [1.0.3] - 2026-02-11

### Added
- **Visual GUI Editor** - Add and configure entities using Lovelace UI (no more manual YAML!)
- **Automatic frequency scaling** - Adapts to your actual frequency range (works with 50kHz, 160kHz, etc.)
- Logarithmic frequency scale for natural EQ visualization
- Padding to keep curve inside grid borders
- Confirmation dialog for Reset button safety
- Grid border rectangle for clearer boundaries
- Dashed vertical lines at each band frequency

### Changed
- Frequency positioning based on actual Hz values (not linear spacing)
- Bands automatically sorted by frequency
- Auto-detects min/max frequency from entities
- dB labels moved to left side
- Frequency labels positioned below grid

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
