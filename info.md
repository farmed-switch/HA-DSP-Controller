## DSP Controller Card

A modern, interactive equalizer card for Home Assistant that lets you control your audio DSP with a smooth, draggable frequency curve - just like professional audio software.

### Features

🎚️ **Interactive Curve** - Drag points on the curve to adjust EQ bands in real-time  
📱 **Mobile Optimized** - Touch-friendly interface works perfectly on phones and tablets  
🎨 **Fully Customizable** - Colors, height, dB range, and more  
⚡ **Real-time Updates** - Changes are instantly sent to your Home Assistant entities  
🔄 **Quick Reset** - One-click button to reset all bands to 0 dB  
🌓 **Theme Support** - Built-in presets for dark, light, and custom themes

Perfect for controlling ESPHome-based DSP systems, digital audio processors, or any equalizer exposed through Home Assistant number entities.

### Quick Start

```yaml
type: custom:dsp-controller-card
title: Living Room EQ
entities:
  - number.eq_20hz
  - number.eq_50hz
  - number.eq_100hz
  # ... more EQ bands
```

See the full README for advanced configuration options and installation instructions.
