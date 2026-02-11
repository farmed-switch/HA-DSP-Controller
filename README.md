# DSP Controller Card

[![hacs_badge](https://img.shields.io/badge/HACS-Custom-41BDF5.svg)](https://github.com/hacs/integration)
[![GitHub release](https://img.shields.io/github/release/farmed-switch/HA-DSP-Controller.svg)](https://github.com/farmed-switch/HA-DSP-Controller/releases)
[![License](https://img.shields.io/github/license/farmed-switch/HA-DSP-Controller.svg)](LICENSE)

A modern, interactive equalizer card for Home Assistant that brings professional DSP control to your Lovelace dashboard. Adjust your audio equalizer by dragging a smooth frequency response curve - just like the pro audio software you know and love.

![DSP Controller Card Demo](https://via.placeholder.com/800x400?text=Add+Screenshot+Here)

## Why This Card?

I built this card because I was frustrated with the existing EQ control options in Home Assistant. After setting up ESPHome-based audio systems with parametric equalizers, I found myself stuck with boring slider cards or clunky number inputs. I wanted something that felt natural - a graphical curve I could shape with my fingers on mobile, just like adjusting EQ in a DAW or professional audio processor.

So here it is: a custom Lovelace card that gives you smooth, touch-friendly EQ control with real-time visual feedback.

## Features

- 🎚️ **Interactive Curve** - Drag control points directly on the frequency response curve
- 📱 **Mobile Optimized** - Smooth touch controls work perfectly on phones and tablets
- 🎨 **Fully Customizable** - Configure colors, dimensions, dB range, and more
- ⚡ **Real-time Updates** - Changes are instantly applied to your Home Assistant entities
- 🔄 **Quick Reset** - One-click button to flatten all EQ bands to 0 dB
- 🌓 **Theme Presets** - Dark, light, and custom color schemes included
- 📊 **Visual Grid** - Clear dB and frequency markers for precise adjustments
- 🎯 **Smooth Interpolation** - Bezier curves show a realistic frequency response

Perfect for controlling:
- ESPHome DSP implementations
- Digital audio processors
- Parametric equalizers
- Any EQ exposed through Home Assistant number entities

## Installation

### HACS (Recommended)

1. Open **HACS** in Home Assistant
2. Click on **Frontend**
3. Click the **⋮** menu (top right) and select **Custom repositories**
4. Add this repository URL: `https://github.com/farmed-switch/HA-DSP-Controller`
5. Category: **Lovelace**
6. Click **Add**
7. Find **DSP Controller Card** in HACS and click **Download**
8. Restart Home Assistant
9. Clear your browser cache (Ctrl+F5)

### Manual Installation

1. Download `dsp-controller-card.js` from the [latest release](https://github.com/farmed-switch/HA-DSP-Controller/releases)
2. Copy it to `<config>/www/dsp-controller-card.js`
3. Add the resource in Home Assistant:
   - Go to **Settings** → **Dashboards** → **Resources** (⋮ menu top right)
   - Click **+ Add Resource**
   - URL: `/local/dsp-controller-card.js`
   - Resource type: **JavaScript Module**
4. Restart Home Assistant
5. Clear your browser cache (Ctrl+F5)

## Usage

### Basic Configuration

Add this to your Lovelace dashboard in raw YAML mode:

```yaml
type: custom:dsp-controller-card
title: Living Room EQ
entities:
  - number.livingroom_eq_20hz
  - number.livingroom_eq_31_5hz
  - number.livingroom_eq_50hz
  - number.livingroom_eq_80hz
  - number.livingroom_eq_125hz
  - number.livingroom_eq_200hz
  - number.livingroom_eq_315hz
  - number.livingroom_eq_500hz
  - number.livingroom_eq_800hz
  - number.livingroom_eq_1250hz
  - number.livingroom_eq_2000hz
  - number.livingroom_eq_3150hz
  - number.livingroom_eq_5000hz
  - number.livingroom_eq_8000hz
  - number.livingroom_eq_16000hz
```

### Advanced Configuration

```yaml
type: custom:dsp-controller-card
title: My Custom EQ
height: 350                      # Height in pixels (default: 300)
min: -12                         # Minimum dB value (default: -12)
max: 12                          # Maximum dB value (default: 12)
show_reset: true                 # Show reset button (default: true)
curve_color: '#22ba00'           # Curve line color
background_color: '#1c1c1c'      # Card background color
grid_color: '#333333'            # Grid line color
point_color: '#ffffff'           # Control point color
text_color: '#aaaaaa'            # Label text color
entities:
  - number.eq_20hz
  - number.eq_50hz
  - number.eq_100hz
  # ... add all your EQ band entities
```

### Configuration Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `type` | string | **required** | Must be `custom:dsp-controller-card` |
| `entities` | list | **required** | List of number entity IDs for EQ bands |
| `title` | string | `"Equalizer"` | Card title |
| `height` | number | `300` | Canvas height in pixels |
| `min` | number | `-12` | Minimum dB value |
| `max` | number | `12` | Maximum dB value |
| `show_reset` | boolean | `true` | Show/hide the reset button |
| `curve_color` | string | `"#22ba00"` | Color of the EQ curve |
| `background_color` | string | `"#1c1c1c"` | Card background color |
| `grid_color` | string | `"#333333"` | Grid lines color |
| `point_color` | string | `"#ffffff"` | Control point dot color |
| `text_color` | string | `"#aaaaaa"` | Text labels color |

## Theme Examples

### Dark Mode (Default)
```yaml
curve_color: '#22ba00'
background_color: '#1c1c1c'
grid_color: '#333333'
point_color: '#ffffff'
text_color: '#aaaaaa'
```

### Light Mode
```yaml
curve_color: '#2196F3'
background_color: '#f5f5f5'
grid_color: '#dddddd'
point_color: '#333333'
text_color: '#666666'
```

### Cyberpunk
```yaml
curve_color: '#ff00ff'
background_color: '#0a0e27'
grid_color: '#1a237e'
point_color: '#00ffff'
text_color: '#ff00ff'
```

### Studio Monitor
```yaml
curve_color: '#00ff41'
background_color: '#000000'
grid_color: '#1a3d1a'
point_color: '#ffffff'
text_color: '#00ff41'
```

## How to Use

1. **Click or tap** on any control point on the curve
2. **Drag up or down** to boost or cut that frequency band
3. The curve updates in **real-time** with smooth interpolation
4. Changes are **instantly applied** to your Home Assistant entities
5. Use the **Reset to 0 dB** button to flatten the curve

## ESPHome Integration Example

Here's a quick example of how to set up EQ bands in ESPHome:

```yaml
number:
  - platform: template
    name: "EQ 20Hz"
    id: eq_20hz
    min_value: -12.0
    max_value: 12.0
    step: 0.5
    initial_value: 0.0
    optimistic: true
    unit_of_measurement: "dB"
    on_value:
      then:
        # Your DSP update logic here
        - logger.log:
            format: "EQ 20Hz set to %.1f dB"
            args: ['x']
```

Repeat for each frequency band you want to control.

## Troubleshooting

### Card doesn't appear

- Verify the resource is added in **Settings → Dashboards → Resources**
- Clear your browser cache with **Ctrl+F5** (or **Cmd+Shift+R** on Mac)
- Check the browser console (F12) for error messages
- Make sure you restarted Home Assistant after installation

### "Custom element doesn't exist: dsp-controller-card"

- The JavaScript file isn't loading. Check:
  - File is in `/config/www/` directory
  - Resource URL is `/local/dsp-controller-card.js`
  - Resource type is **JavaScript Module** (not JavaScript)
  - Browser cache is cleared

### Curve doesn't draw

- Check that all entities in your config actually exist
- Verify entities are of type `number` (not sensor or input_number)
- Open **Developer Tools → States** and search for your entity IDs
- Check the browser console for entity-related errors

### Curve is unresponsive

- Ensure entities have proper `min` and `max` attributes
- Try adjusting the card's `min` and `max` config values
- Check that you have permission to control these entities

## Contributing

Found a bug or have a feature request? Please [open an issue](https://github.com/farmed-switch/HA-DSP-Controller/issues)!

Pull requests are welcome. For major changes, please open an issue first to discuss what you'd like to change.

## License

[MIT](LICENSE)

## Credits

Built with frustration and caffeine by [farmed-switch](https://github.com/farmed-switch).

Inspired by professional audio software and the desire for better EQ control in Home Assistant.

---

**Enjoying this card?** Give it a ⭐ on GitHub!
