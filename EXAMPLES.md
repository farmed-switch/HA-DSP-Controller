# Example Configurations

This file contains ready-to-use configuration examples for common use cases.

## Basic 15-Band Equalizer

Standard 15-band graphic equalizer configuration:

```yaml
type: custom:dsp-controller-card
title: Living Room Equalizer
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

## TAS5805M DSP (15-band)

For ESPHome TAS5805M DAC with built-in DSP:

```yaml
type: custom:dsp-controller-card
title: Snapcast Living Room EQ
height: 320
min: -12
max: 12
curve_color: '#00d4aa'
background_color: '#1a1a1a'
grid_color: '#2a2a2a'
entities:
  - number.snapcast_vardagsrum_eq_20hz
  - number.snapcast_vardagsrum_eq_31_5hz
  - number.snapcast_vardagsrum_eq_50hz
  - number.snapcast_vardagsrum_eq_80hz
  - number.snapcast_vardagsrum_eq_125hz
  - number.snapcast_vardagsrum_eq_200hz
  - number.snapcast_vardagsrum_eq_315hz
  - number.snapcast_vardagsrum_eq_500hz
  - number.snapcast_vardagsrum_eq_800hz
  - number.snapcast_vardagsrum_eq_1250hz
  - number.snapcast_vardagsrum_eq_2000hz
  - number.snapcast_vardagsrum_eq_3150hz
  - number.snapcast_vardagsrum_eq_5000hz
  - number.snapcast_vardagsrum_eq_8000hz
  - number.snapcast_vardagsrum_eq_16000hz
```

## ESP-DSP (18-band)

For ESP32 with ESP-DSP library:

```yaml
type: custom:dsp-controller-card
title: Kitchen Speaker EQ
height: 300
entities:
  - number.kitchen_eq_40hz
  - number.kitchen_eq_63hz
  - number.kitchen_eq_100hz
  - number.kitchen_eq_160hz
  - number.kitchen_eq_250hz
  - number.kitchen_eq_315hz
  - number.kitchen_eq_400hz
  - number.kitchen_eq_500hz
  - number.kitchen_eq_630hz
  - number.kitchen_eq_800hz
  - number.kitchen_eq_1000hz
  - number.kitchen_eq_1250hz
  - number.kitchen_eq_1600hz
  - number.kitchen_eq_2000hz
  - number.kitchen_eq_2500hz
  - number.kitchen_eq_3150hz
  - number.kitchen_eq_4000hz
  - number.kitchen_eq_5000hz
```

## Light Theme (Studio Style)

Bright theme for well-lit environments:

```yaml
type: custom:dsp-controller-card
title: Studio Monitor EQ
height: 350
min: -15
max: 15
curve_color: '#2196F3'
background_color: '#ffffff'
grid_color: '#e0e0e0'
point_color: '#1976D2'
text_color: '#424242'
entities:
  # ... your entities here
```

## Compact Mobile View

Optimized for small screens:

```yaml
type: custom:dsp-controller-card
title: EQ
height: 200
show_reset: false
curve_color: '#22ba00'
background_color: '#0d0d0d'
grid_color: '#262626'
point_color: '#ffffff'
text_color: '#999999'
entities:
  # ... your entities here
```

## High-Res Studio (±20dB range)

For professional audio work with extended range:

```yaml
type: custom:dsp-controller-card
title: Mastering EQ
height: 400
min: -20
max: 20
curve_color: '#00ff41'
background_color: '#000000'
grid_color: '#1a3d1a'
point_color: '#ffffff'
text_color: '#00ff41'
entities:
  # ... your entities here
```

## Multiple Cards (Multi-Zone)

Stack multiple cards for different rooms:

```yaml
type: vertical-stack
cards:
  - type: custom:dsp-controller-card
    title: Living Room
    height: 250
    curve_color: '#22ba00'
    entities:
      # Living room entities
      
  - type: custom:dsp-controller-card
    title: Kitchen
    height: 250
    curve_color: '#ff9800'
    entities:
      # Kitchen entities
      
  - type: custom:dsp-controller-card
    title: Bedroom
    height: 250
    curve_color: '#9c27b0'
    entities:
      # Bedroom entities
```

## Card with Conditional Display

Show EQ only when audio system is on:

```yaml
type: conditional
conditions:
  - entity: switch.audio_system
    state: 'on'
card:
  type: custom:dsp-controller-card
  title: System EQ
  entities:
    # ... your entities here
```

## Horizontal Stack (Side-by-Side)

Two EQ cards next to each other:

```yaml
type: horizontal-stack
cards:
  - type: custom:dsp-controller-card
    title: Left Channel
    height: 280
    curve_color: '#2196F3'
    entities:
      # Left channel entities
      
  - type: custom:dsp-controller-card
    title: Right Channel
    height: 280
    curve_color: '#f44336'
    entities:
      # Right channel entities
```

## ESPHome Entity Example

Complete ESPHome YAML for one EQ band:

```yaml
number:
  - platform: template
    name: "Living Room EQ 1kHz"
    id: eq_1000hz
    min_value: -12.0
    max_value: 12.0
    initial_value: 0.0
    step: 0.5
    optimistic: true
    unit_of_measurement: "dB"
    icon: "mdi:equalizer"
    entity_category: config
    on_value:
      then:
        - logger.log:
            format: "EQ 1kHz: %.1f dB"
            args: ['x']
        # Add your DSP update logic here
```

Repeat this block for each frequency band (20Hz, 50Hz, 100Hz, etc.)
