class DspControllerCard extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this._bands = [];
    this._draggingIndex = null;
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
      curve_color: config.curve_color || '#22ba00',
      background_color: config.background_color || '#1c1c1c',
      grid_color: config.grid_color || '#333333',
      point_color: config.point_color || '#ffffff',
      text_color: config.text_color || '#aaaaaa',
      show_reset: config.show_reset !== false,
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
      
      return {
        entityId: entityId,
        value: parseFloat(state.state) || 0,
        min: parseFloat(state.attributes.min) || this._config.min,
        max: parseFloat(state.attributes.max) || this._config.max,
        name: this._getFrequencyLabel(state.attributes.friendly_name || entityId)
      };
    }).filter(b => b !== null);
    
    if (this._bands.length > 0) {
      console.log(`DSP Controller Card: Loaded ${this._bands.length} bands successfully`);
    }
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
    const clickedIndex = this._findNearestBand(pos.x, pos.y);
    
    if (clickedIndex !== -1) {
      this._draggingIndex = clickedIndex;
      this._updateBandValue(clickedIndex, pos.y);
    }
  }

  _onPointerMove(e) {
    if (this._draggingIndex !== null) {
      e.preventDefault();
      const pos = this._getPointerPosition(e);
      this._updateBandValue(this._draggingIndex, pos.y);
    }
  }

  _onPointerUp(e) {
    this._draggingIndex = null;
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
    
    let nearestIndex = -1;
    let nearestDist = threshold;

    this._bands.forEach((band, i) => {
      const bandX = (i / (this._bands.length - 1)) * rect.width;
      const bandY = this._valueToY(band.value);
      const dist = Math.sqrt((x - bandX) ** 2 + (y - bandY) ** 2);
      
      if (dist < nearestDist) {
        nearestDist = dist;
        nearestIndex = i;
      }
    });

    return nearestIndex;
  }

  _updateBandValue(index, y) {
    const band = this._bands[index];
    if (!band) return;

    const newValue = this._yToValue(y);
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

  _valueToY(value) {
    const rect = this._canvas.getBoundingClientRect();
    const range = this._config.max - this._config.min;
    const normalized = (this._config.max - value) / range;
    return normalized * rect.height;
  }

  _yToValue(y) {
    const rect = this._canvas.getBoundingClientRect();
    const range = this._config.max - this._config.min;
    const normalized = y / rect.height;
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
  }

  _drawGrid(w, h) {
    this._ctx.strokeStyle = this._config.grid_color;
    this._ctx.lineWidth = 1;

    // Horizontal lines (dB levels)
    const dbSteps = [-12, -9, -6, -3, 0, 3, 6, 9, 12];
    dbSteps.forEach(db => {
      if (db >= this._config.min && db <= this._config.max) {
        const y = this._valueToY(db);
        this._ctx.beginPath();
        this._ctx.moveTo(0, y);
        this._ctx.lineTo(w, y);
        this._ctx.stroke();

        // Label
        this._ctx.fillStyle = this._config.text_color;
        this._ctx.font = '10px sans-serif';
        this._ctx.fillText(`${db > 0 ? '+' : ''}${db}`, 5, y - 2);
      }
    });

    // Vertical lines (frequencies)
    this._bands.forEach((band, i) => {
      const x = (i / (this._bands.length - 1)) * w;
      this._ctx.beginPath();
      this._ctx.moveTo(x, 0);
      this._ctx.lineTo(x, h);
      this._ctx.stroke();
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
    
    const points = this._bands.map((band, i) => ({
      x: (i / (this._bands.length - 1)) * w,
      y: this._valueToY(band.value)
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
    this._bands.forEach((band, i) => {
      const x = (i / (this._bands.length - 1)) * w;
      const y = this._valueToY(band.value);

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
    this._ctx.fillStyle = this._config.text_color;
    this._ctx.font = '11px sans-serif';
    this._ctx.textAlign = 'center';

    this._bands.forEach((band, i) => {
      const x = (i / (this._bands.length - 1)) * w;
      this._ctx.fillText(band.name, x, h - 5);
    });
  }

  _resetAll() {
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

  static getConfigElement() {
    return document.createElement('dsp-controller-card-editor');
  }

  static getStubConfig() {
    return {
      title: 'DSP Equalizer',
      entities: []
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
  '%c DSP-CONTROLLER-CARD %c v1.0.2 ',
  'color: white; background: #22ba00; font-weight: 700;',
  'color: #22ba00; background: white; font-weight: 700;'
);
