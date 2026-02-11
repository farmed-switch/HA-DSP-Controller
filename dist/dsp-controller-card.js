class DspControllerCard extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this._bands = [];
    this._draggingIndex = null;
    this._draggingVolume = false;
    this._volume = null;
    this._canvas = null;
    this._ctx = null;
  }

  setConfig(config) {
    if (!config.entities || !Array.isArray(config.entities)) {
      throw new Error('You must define entities as an array');
    }

    this._config = {
      title: config.title || 'Equalizer',
      height: config.height || 300,
      min: config.min || -12,
      max: config.max || 12,
      freq_min: config.freq_min || 20,        // Min frequency in Hz
      freq_max: config.freq_max || 20000,     // Max frequency in Hz
      curve_color: config.curve_color || '#22ba00',
      background_color: config.background_color || '#1c1c1c',
      grid_color: config.grid_color || '#333333',
      point_color: config.point_color || '#ffffff',
      text_color: config.text_color || '#aaaaaa',
      show_reset: config.show_reset === true,
      padding: config.padding || 40,           // Padding for curve inside grid
      volume_entity: config.volume_entity || null,  // Optional master volume control
      ...config
    };

    this._entities = this._config.entities;
    this._render();
  }

  set hass(hass) {
    const oldHass = this._hass;
    this._hass = hass;
    
    // Only update if entities have actually changed
    if (!oldHass || this._entitiesChanged(oldHass, hass)) {
      this._updateBands();
      if (this._canvas && this._bands.length > 0) {
        requestAnimationFrame(() => this._draw());
      }
    }
  }

  connectedCallback() {
    // Ensure canvas is properly sized when added to DOM
    if (this._canvas) {
      requestAnimationFrame(() => {
        this._resizeCanvas();
        if (this._hass) {
          this._updateBands();
          this._draw();
        }
      });
    }
  }

  _entitiesChanged(oldHass, newHass) {
    return this._entities.some(entityId => {
      const oldState = oldHass.states[entityId];
      const newState = newHass.states[entityId];
      return !oldState || !newState || oldState.state !== newState.state;
    });
  }

  _resizeCanvas() {
    if (!this._canvas || !this._ctx) return;
    const rect = this._canvas.getBoundingClientRect();
    if (rect.width === 0 || rect.height === 0) return;
    
    this._canvas.width = rect.width * window.devicePixelRatio;
    this._canvas.height = rect.height * window.devicePixelRatio;
    this._ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
  }

  _updateBands() {
    if (!this._hass) {
      console.warn('DSP Controller Card: hass not available yet');
      return;
    }
    
    this._bands = this._entities.map(entityId => {
      const state = this._hass.states[entityId];
      if (!state) {
        console.warn(`DSP Controller Card: Entity not found: ${entityId}`);
        return null;
      }
      
      const frequency = this._extractFrequency(state.attributes.friendly_name || entityId);
      
      return {
        entityId: entityId,
        value: parseFloat(state.state) || 0,
        min: parseFloat(state.attributes.min) || this._config.min,
        max: parseFloat(state.attributes.max) || this._config.max,
        frequency: frequency,
        name: this._getFrequencyLabel(state.attributes.friendly_name || entityId)
      };
    }).filter(b => b !== null);
    
    // Sort by frequency
    this._bands.sort((a, b) => a.frequency - b.frequency);
    
    // Auto-calculate frequency range if not specified
    if (this._bands.length > 0) {
      const frequencies = this._bands.map(b => b.frequency);
      this._actualFreqMin = Math.min(...frequencies);
      this._actualFreqMax = Math.max(...frequencies);
      
      // Use config values if provided, otherwise use actual min/max
      this._effectiveFreqMin = this._config.freq_min || this._actualFreqMin;
      this._effectiveFreqMax = this._config.freq_max || this._actualFreqMax;
      
      console.log(`DSP Controller Card: Loaded ${this._bands.length} bands (${this._actualFreqMin}Hz - ${this._actualFreqMax}Hz)`);
    }
    
    // Update volume if configured
    if (this._config.volume_entity) {
      const volumeState = this._hass.states[this._config.volume_entity];
      if (volumeState) {
        const domain = this._config.volume_entity.split('.')[0];
        
        if (domain === 'media_player') {
          // Media player uses volume_level attribute (0.0-1.0)
          const volumeLevel = parseFloat(volumeState.attributes.volume_level);
          this._volume = {
            entityId: this._config.volume_entity,
            value: volumeLevel * 100, // Convert to 0-100 for display
            min: 0,
            max: 100,
            name: volumeState.attributes.friendly_name || 'Volume',
            isMediaPlayer: true
          };
        } else {
          // Number entity uses state
          this._volume = {
            entityId: this._config.volume_entity,
            value: parseFloat(volumeState.state) || 0,
            min: parseFloat(volumeState.attributes.min) || 0,
            max: parseFloat(volumeState.attributes.max) || 100,
            name: volumeState.attributes.friendly_name || 'Volume',
            isMediaPlayer: false
          };
        }
      }
    } else {
      this._volume = null;
    }
  }

  _extractFrequency(name) {
    // Extract frequency from entity name and convert to Hz
    const match = name.match(/(\d+(?:\.\d+)?)\s*(hz|khz)/i);
    if (match) {
      const num = parseFloat(match[1]);
      const unit = match[2].toLowerCase();
      return unit === 'khz' ? num * 1000 : num;
    }
    return 1000; // Default to 1kHz if can't parse
  }

  _getFrequencyLabel(name) {
    // Extract frequency from entity name (e.g., "20hz" -> "20")
    const match = name.match(/(\d+(?:\.\d+)?)\s*(hz|khz)/i);
    if (match) {
      const num = parseFloat(match[1]);
      const unit = match[2].toLowerCase();
      if (unit === 'khz' || num >= 1000) {
        return num >= 1000 ? `${(num/1000).toFixed(1)}k` : `${num}k`;
      }
      return `${num}`;
    }
    return name;
  }

  _render() {
    const style = `
      <style>
        :host {
          display: block;
          padding: 16px;
          background-color: ${this._config.background_color};
          border-radius: 8px;
        }
        .header {
          font-size: 18px;
          font-weight: 500;
          color: ${this._config.text_color};
          margin-bottom: 16px;
        }
        .eq-container {
          position: relative;
          width: 100%;
          height: ${this._config.height}px;
          user-select: none;
          touch-action: none;
        }
        canvas {
          width: 100%;
          height: 100%;
          cursor: pointer;
        }
        .reset-btn {
          margin-top: 12px;
          padding: 8px 16px;
          background-color: #333;
          color: ${this._config.text_color};
          border: none;
          border-radius: 4px;
          cursor: pointer;
          font-size: 14px;
          display: ${this._config.show_reset ? 'inline-block' : 'none'};
        }
        .reset-btn:hover {
          background-color: #444;
        }
      </style>
    `;

    const html = `
      ${style}
      <div class="header">${this._config.title}</div>
      <div class="eq-container">
        <canvas id="eqCanvas"></canvas>
      </div>
      <button class="reset-btn">Reset to 0 dB</button>
    `;

    this.shadowRoot.innerHTML = html;
    
    this._canvas = this.shadowRoot.getElementById('eqCanvas');
    this._ctx = this._canvas.getContext('2d');
    
    // Set canvas resolution using helper method
    this._resizeCanvas();

    // Event listeners
    this._canvas.addEventListener('mousedown', this._onPointerDown.bind(this));
    this._canvas.addEventListener('mousemove', this._onPointerMove.bind(this));
    this._canvas.addEventListener('mouseup', this._onPointerUp.bind(this));
    this._canvas.addEventListener('mouseleave', this._onPointerUp.bind(this));
    
    this._canvas.addEventListener('touchstart', this._onPointerDown.bind(this), { passive: false });
    this._canvas.addEventListener('touchmove', this._onPointerMove.bind(this), { passive: false });
    this._canvas.addEventListener('touchend', this._onPointerUp.bind(this));
    this._canvas.addEventListener('touchcancel', this._onPointerUp.bind(this));

    const resetBtn = this.shadowRoot.querySelector('.reset-btn');
    if (resetBtn) {
      resetBtn.addEventListener('click', () => this._resetAll());
    }

    if (this._hass) {
      this._updateBands();
      this._draw();
    }
  }

  _onPointerDown(e) {
    e.preventDefault();
    const pos = this._getPointerPosition(e);
    
    // Check if clicking on volume slider
    if (this._volume && this._isVolumeSlider(pos.x, pos.y)) {
      this._draggingVolume = true;
      this._updateVolumeValue(pos.x);
      return;
    }
    
    const clickedIndex = this._findNearestBand(pos.x, pos.y);
    
    if (clickedIndex !== -1) {
      this._draggingIndex = clickedIndex;
      this._updateBandValue(clickedIndex, pos.y);
    }
  }

  _onPointerMove(e) {
    if (this._draggingVolume) {
      e.preventDefault();
      const pos = this._getPointerPosition(e);
      this._updateVolumeValue(pos.x);
    } else if (this._draggingIndex !== null) {
      e.preventDefault();
      const pos = this._getPointerPosition(e);
      this._updateBandValue(this._draggingIndex, pos.y);
    }
  }

  _onPointerUp(e) {
    this._draggingIndex = null;
    this._draggingVolume = false;
  }

  _getPointerPosition(e) {
    const rect = this._canvas.getBoundingClientRect();
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    
    return {
      x: clientX - rect.left,
      y: clientY - rect.top
    };
  }

  _findNearestBand(x, y) {
    const rect = this._canvas.getBoundingClientRect();
    const threshold = 30; // pixels
    const pad = this._config.padding;
    
    let nearestIndex = -1;
    let nearestDist = threshold;

    this._bands.forEach((band, i) => {
      const bandX = this._freqToX(band.frequency, rect.width);
      const bandY = this._valueToY(band.value, rect.height);
      const dist = Math.sqrt((x - bandX) ** 2 + (y - bandY) ** 2);
      
      if (dist < nearestDist) {
        nearestDist = dist;
        nearestIndex = i;
      }
    });

    return nearestIndex;
  }

  _freqToX(freq, width) {
    const pad = this._config.padding;
    const logMin = Math.log10(this._effectiveFreqMin || 20);
    const logMax = Math.log10(this._effectiveFreqMax || 20000);
    const logFreq = Math.log10(freq);
    const normalized = (logFreq - logMin) / (logMax - logMin);
    return pad + normalized * (width - 2 * pad);
  }

  _xToFreq(x, width) {
    const pad = this._config.padding;
    const logMin = Math.log10(this._effectiveFreqMin || 20);
    const logMax = Math.log10(this._effectiveFreqMax || 20000);
    const normalized = (x - pad) / (width - 2 * pad);
    const logFreq = logMin + normalized * (logMax - logMin);
    return Math.pow(10, logFreq);
  }

  _updateBandValue(index, y) {
    const band = this._bands[index];
    if (!band) return;

    const rect = this._canvas.getBoundingClientRect();
    const newValue = this._yToValue(y, rect.height);
    const clampedValue = Math.max(band.min, Math.min(band.max, newValue));
    
    // Update local state immediately for smooth UI
    this._bands[index].value = clampedValue;
    this._draw();

    // Update Home Assistant
    this._hass.callService('number', 'set_value', {
      entity_id: band.entityId,
      value: Math.round(clampedValue * 10) / 10 // Round to 1 decimal
    });
  }

  _valueToY(value, height) {
    const pad = this._config.padding;
    const range = this._config.max - this._config.min;
    const normalized = (this._config.max - value) / range;
    return pad + normalized * (height - 2 * pad);
  }

  _yToValue(y, height) {
    const pad = this._config.padding;
    const range = this._config.max - this._config.min;
    const normalized = (y - pad) / (height - 2 * pad);
    return this._config.max - (normalized * range);
  }

  _draw() {
    if (!this._ctx || !this._bands.length) {
      if (this._ctx) {
        // Show error message
        const rect = this._canvas.getBoundingClientRect();
        this._ctx.fillStyle = this._config.background_color;
        this._ctx.fillRect(0, 0, rect.width, rect.height);
        this._ctx.fillStyle = this._config.text_color;
        this._ctx.font = '14px sans-serif';
        this._ctx.textAlign = 'center';
        this._ctx.fillText('No valid entities found', rect.width / 2, rect.height / 2);
        this._ctx.font = '12px sans-serif';
        this._ctx.fillText('Check console for details (F12)', rect.width / 2, rect.height / 2 + 20);
      }
      return;
    }

    const rect = this._canvas.getBoundingClientRect();
    const w = rect.width;
    const h = rect.height;

    // Clear canvas
    this._ctx.fillStyle = this._config.background_color;
    this._ctx.fillRect(0, 0, w, h);

    // Draw grid
    this._drawGrid(w, h);

    // Draw curve
    this._drawCurve(w, h);

    // Draw points
    this._drawPoints(w, h);

    // Draw labels
    this._drawLabels(w, h);
    
    // Draw volume slider if configured
    if (this._volume) {
      this._drawVolume(w, h);
    }
  }

  _drawGrid(w, h) {
    const pad = this._config.padding;
    this._ctx.strokeStyle = this._config.grid_color;
    this._ctx.lineWidth = 1;

    // Draw border rectangle
    this._ctx.strokeRect(pad, pad, w - 2 * pad, h - 2 * pad);

    // Horizontal lines (dB levels)
    const dbSteps = [-12, -9, -6, -3, 0, 3, 6, 9, 12];
    dbSteps.forEach(db => {
      if (db >= this._config.min && db <= this._config.max) {
        const y = this._valueToY(db, h);
        this._ctx.beginPath();
        this._ctx.moveTo(pad, y);
        this._ctx.lineTo(w - pad, y);
        this._ctx.stroke();

        // dB Label on left
        this._ctx.fillStyle = this._config.text_color;
        this._ctx.font = '10px sans-serif';
        this._ctx.textAlign = 'right';
        this._ctx.fillText(`${db > 0 ? '+' : ''}${db}`, pad - 5, y + 3);
      }
    });

    // Vertical lines at actual band frequencies
    this._bands.forEach(band => {
      const x = this._freqToX(band.frequency, w);
      this._ctx.beginPath();
      this._ctx.setLineDash([2, 2]); // Dashed line
      this._ctx.moveTo(x, pad);
      this._ctx.lineTo(x, h - pad);
      this._ctx.stroke();
      this._ctx.setLineDash([]); // Reset to solid
    });
  }

  _drawCurve(w, h) {
    if (this._bands.length < 2) return;

    this._ctx.strokeStyle = this._config.curve_color;
    this._ctx.lineWidth = 3;
    this._ctx.lineCap = 'round';
    this._ctx.lineJoin = 'round';

    // Create smooth curve using quadratic interpolation
    this._ctx.beginPath();
    
    const points = this._bands.map(band => ({
      x: this._freqToX(band.frequency, w),
      y: this._valueToY(band.value, h)
    }));

    this._ctx.moveTo(points[0].x, points[0].y);

    for (let i = 0; i < points.length - 1; i++) {
      const current = points[i];
      const next = points[i + 1];
      const midX = (current.x + next.x) / 2;
      const midY = (current.y + next.y) / 2;
      
      if (i === 0) {
        this._ctx.lineTo(midX, midY);
      } else {
        this._ctx.quadraticCurveTo(current.x, current.y, midX, midY);
      }
    }

    // Last segment
    const last = points[points.length - 1];
    const secondLast = points[points.length - 2];
    this._ctx.quadraticCurveTo(secondLast.x, secondLast.y, last.x, last.y);

    this._ctx.stroke();
  }

  _drawPoints(w, h) {
    this._bands.forEach(band => {
      const x = this._freqToX(band.frequency, w);
      const y = this._valueToY(band.value, h);

      // Outer circle (glow effect)
      this._ctx.fillStyle = this._config.curve_color + '40';
      this._ctx.beginPath();
      this._ctx.arc(x, y, 8, 0, Math.PI * 2);
      this._ctx.fill();

      // Inner circle
      this._ctx.fillStyle = this._config.point_color;
      this._ctx.beginPath();
      this._ctx.arc(x, y, 5, 0, Math.PI * 2);
      this._ctx.fill();

      // Border
      this._ctx.strokeStyle = this._config.curve_color;
      this._ctx.lineWidth = 2;
      this._ctx.stroke();
    });
  }

  _drawLabels(w, h) {
    const pad = this._config.padding;
    this._ctx.fillStyle = this._config.text_color;
    this._ctx.font = '10px sans-serif';

    // Calculate spacing between bands to determine if we need to skip labels
    const positions = this._bands.map(band => this._freqToX(band.frequency, w));
    const minSpacing = 30; // Minimum pixels between labels
    
    this._bands.forEach((band, index) => {
      const x = positions[index];
      
      // Check if this label would overlap with neighbors
      let shouldShow = true;
      if (index > 0 && Math.abs(x - positions[index - 1]) < minSpacing) {
        // Skip every other label when too close
        shouldShow = index % 2 === 0;
      }
      
      if (shouldShow) {
        // Save context
        this._ctx.save();
        
        // Move to position and rotate
        this._ctx.translate(x, h - pad + 20);
        this._ctx.rotate(-Math.PI / 4); // Rotate -45 degrees
        
        // Draw text (rotated)
        this._ctx.textAlign = 'right';
        this._ctx.textBaseline = 'middle';
        this._ctx.fillText(band.name, 0, 0);
        
        // Restore context
        this._ctx.restore();
      }
    });
  }

  _drawVolume(w, h) {
    const pad = this._config.padding;
    const volumeY = h - pad + 50; // Position below frequency labels
    const sliderStart = pad;
    const sliderEnd = w - pad;
    const sliderWidth = sliderEnd - sliderStart;
    
    // Calculate value position
    const range = this._volume.max - this._volume.min;
    const normalized = (this._volume.value - this._volume.min) / range;
    const valueX = sliderStart + normalized * sliderWidth;
    
    // Draw slider track
    this._ctx.strokeStyle = this._config.grid_color;
    this._ctx.lineWidth = 2;
    this._ctx.beginPath();
    this._ctx.moveTo(sliderStart, volumeY);
    this._ctx.lineTo(sliderEnd, volumeY);
    this._ctx.stroke();
    
    // Draw filled portion
    this._ctx.strokeStyle = this._config.curve_color;
    this._ctx.lineWidth = 3;
    this._ctx.beginPath();
    this._ctx.moveTo(sliderStart, volumeY);
    this._ctx.lineTo(valueX, volumeY);
    this._ctx.stroke();
    
    // Draw slider handle
    this._ctx.fillStyle = this._config.curve_color;
    this._ctx.shadowColor = this._config.curve_color;
    this._ctx.shadowBlur = 8;
    this._ctx.beginPath();
    this._ctx.arc(valueX, volumeY, 6, 0, Math.PI * 2);
    this._ctx.fill();
    this._ctx.shadowBlur = 0;
  }
  
  _isVolumeSlider(x, y) {
    const rect = this._canvas.getBoundingClientRect();
    const pad = this._config.padding;
    const volumeY = rect.height - pad + 50;
    return y >= volumeY - 10 && y <= volumeY + 10 && x >= pad && x <= rect.width - pad;
  }
  
  _updateVolumeValue(x) {
    const rect = this._canvas.getBoundingClientRect();
    const pad = this._config.padding;
    const sliderStart = pad;
    const sliderEnd = rect.width - pad;
    const sliderWidth = sliderEnd - sliderStart;
    
    const clampedX = Math.max(sliderStart, Math.min(sliderEnd, x));
    const normalized = (clampedX - sliderStart) / sliderWidth;
    const range = this._volume.max - this._volume.min;
    const newValue = this._volume.min + normalized * range;
    const roundedValue = Math.round(newValue);
    
    if (roundedValue !== Math.round(this._volume.value)) {
      this._volume.value = roundedValue;
      this._draw();
      
      if (this._volume.isMediaPlayer) {
        // Media player needs volume_set with volume_level (0.0-1.0)
        this._hass.callService('media_player', 'volume_set', {
          entity_id: this._volume.entityId,
          volume_level: roundedValue / 100
        });
      } else {
        // Number entity uses set_value
        this._hass.callService('number', 'set_value', {
          entity_id: this._volume.entityId,
          value: roundedValue
        });
      }
    }
  }

  _resetAll() {
    if (!confirm('Reset all EQ bands to 0 dB?\n\nThis will change all frequency values.')) {
      return;
    }
    
    this._bands.forEach(band => {
      this._hass.callService('number', 'set_value', {
        entity_id: band.entityId,
        value: 0
      });
    });
  }

  getCardSize() {
    return 3;
  }

  static getConfigForm() {
    return {
      schema: [
        { name: 'title', selector: { text: {} } },
        { name: 'height', selector: { number: { min: 100, max: 1000, mode: 'box' } } },
        { name: 'show_reset', selector: { boolean: {} } },
        { name: 'entities', selector: { entity: { multiple: true, filter: { domain: 'number' } } } },
        { name: 'volume_entity', selector: { entity: { domain: ['number', 'input_number', 'media_player'] } } },
        { 
          type: 'grid',
          name: '',
          schema: [
            { name: 'min', selector: { number: { min: -24, max: 0, mode: 'box' } } },
            { name: 'max', selector: { number: { min: 0, max: 24, mode: 'box' } } },
          ]
        }
      ]
    };
  }

  static getStubConfig() {
    return {
      title: 'DSP Equalizer',
      entities: [],
      height: 300,
      min: -12,
      max: 12,
      show_reset: false,
    };
  }
}

customElements.define('dsp-controller-card', DspControllerCard);

window.customCards = window.customCards || [];
window.customCards.push({
  type: 'dsp-controller-card',
  name: 'DSP Controller Card',
  description: 'A modern graphical equalizer with interactive curve control',
  preview: false,
  documentationURL: 'https://github.com/farmed-switch/HA-DSP-Controller',
});

console.info(
  '%c DSP-CONTROLLER-CARD %c v2.0.2 ',
  'color: white; background: #22ba00; font-weight: 700;',
  'color: #22ba00; background: white; font-weight: 700;'
);
