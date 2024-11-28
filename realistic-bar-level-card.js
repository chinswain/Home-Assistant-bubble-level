class StyledBarBubbleLevelCard extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
  }

  setConfig(config) {
    if (!config.x_entity) {
      throw new Error("You need to define x_entity");
    }
    this.config = config;
    this.isHorizontal = config.horizontal ?? true; // Default to horizontal if not specified
  }

  set hass(hass) {
    this._hass = hass;

    const xValue = parseFloat(hass.states[this.config.x_entity]?.state || 0);

    if (!this.shadowRoot.lastElementChild) {
      const container = document.createElement("div");
      container.style.textAlign = "center";
      container.innerHTML = `
        <canvas id="bubble-bar" width="${this.isHorizontal ? 315 : 108}" height="${this.isHorizontal ? 108 : 315}"></canvas>
      `;
      this.shadowRoot.appendChild(container);
      this.drawLevel(xValue);
    } else {
      this.drawLevel(xValue);
    }
  }

  drawLevel(x) {
    const canvas = this.shadowRoot.getElementById("bubble-bar");
    const ctx = canvas.getContext("2d");

    // Clear the canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const width = canvas.width;
    const height = canvas.height;

    // Dimensions and positioning based on orientation
    const barLength = this.isHorizontal ? width * 0.9 : height * 0.9;
    const barThickness = this.isHorizontal ? height * 0.5 : width * 0.5;
    const barX = this.isHorizontal ? (width - barLength) / 2 : (width - barThickness) / 2;
    const barY = this.isHorizontal ? (height - barThickness) / 2 : (height - barLength) / 2;
    const bubbleRadius = barThickness * 0.4;
    const maxBubbleTravel = (barLength - bubbleRadius * 2) / 2;

    // Bezel dimensions
    const bezelOuterThickness = bubbleRadius * 0.3;
    const bezelOuterX = barX - (this.isHorizontal ? bezelOuterThickness : 0);
    const bezelOuterY = barY - (this.isHorizontal ? 0 : bezelOuterThickness);
    const bezelOuterWidth = this.isHorizontal
      ? barLength + 2 * bezelOuterThickness
      : barThickness;
    const bezelOuterHeight = this.isHorizontal
      ? barThickness
      : barLength + 2 * bezelOuterThickness;

    // Bezel gradient
    const bezelGradient = ctx.createLinearGradient(
      this.isHorizontal ? bezelOuterX : bezelOuterX + bezelOuterWidth / 2,
      this.isHorizontal ? bezelOuterY + bezelOuterHeight / 2 : bezelOuterY,
      this.isHorizontal ? bezelOuterX + bezelOuterWidth : bezelOuterX + bezelOuterWidth / 2,
      this.isHorizontal ? bezelOuterY + bezelOuterHeight / 2 : bezelOuterY + bezelOuterHeight
    );
    bezelGradient.addColorStop(0, "#222222");
    bezelGradient.addColorStop(0.6, "#111111");
    bezelGradient.addColorStop(1, "#000000");

    ctx.fillStyle = bezelGradient;
    ctx.fillRect(bezelOuterX, bezelOuterY, bezelOuterWidth, bezelOuterHeight);

    // Bar gradient
    const barGradient = ctx.createLinearGradient(
      barX,
      barY,
      this.isHorizontal ? barX + barLength : barX,
      this.isHorizontal ? barY : barY + barLength
    );
    barGradient.addColorStop(0, "#3B7600");
    barGradient.addColorStop(1, "#D1EE00");
    ctx.fillStyle = barGradient;
    ctx.fillRect(barX, barY, this.isHorizontal ? barLength : barThickness, this.isHorizontal ? barThickness : barLength);

    // Border
    ctx.strokeStyle = "#000000";
    ctx.lineWidth = 2;
    ctx.strokeRect(barX, barY, this.isHorizontal ? barLength : barThickness, this.isHorizontal ? barThickness : barLength);

    // Bubble position
    let bubblePos = this.isHorizontal
      ? [barX + barLength / 2 + x * maxBubbleTravel, barY + barThickness / 2]
      : [barX + barThickness / 2, barY + barLength / 2 + x * maxBubbleTravel];

    // Constrain bubble
    if (this.isHorizontal) {
      bubblePos[0] = Math.min(Math.max(bubblePos[0], barX + bubbleRadius), barX + barLength - bubbleRadius);
    } else {
      bubblePos[1] = Math.min(Math.max(bubblePos[1], barY + bubbleRadius), barY + barLength - bubbleRadius);
    }

    // Bubble shadow
    ctx.fillStyle = "rgba(0, 0, 0, 0.2)";
    ctx.beginPath();
    ctx.arc(bubblePos[0] + 2, bubblePos[1] + 2, bubbleRadius, 0, 2 * Math.PI);
    ctx.fill();

    // Bubble gradient
    const bubbleGradient = ctx.createRadialGradient(
      bubblePos[0] - bubbleRadius * 0.4,
      bubblePos[1] - bubbleRadius * 0.4,
      bubbleRadius * 0.1,
      bubblePos[0],
      bubblePos[1],
      bubbleRadius
    );
    bubbleGradient.addColorStop(0, "rgba(255, 255, 255, 0.8)");
    bubbleGradient.addColorStop(0.5, "rgba(173, 216, 230, 0.6)");
    bubbleGradient.addColorStop(1, "rgba(0, 0, 0, 0.2)");

    ctx.fillStyle = bubbleGradient;
    ctx.beginPath();
    ctx.arc(bubblePos[0], bubblePos[1], bubbleRadius, 0, 2 * Math.PI);
    ctx.fill();

    // Bubble shine
    ctx.strokeStyle = "rgba(255, 255, 255, 0.4)";
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.arc(
      bubblePos[0] - bubbleRadius * 0.3,
      bubblePos[1] - bubbleRadius * 0.3,
      bubbleRadius * 0.5,
      0.75 * Math.PI,
      1.75 * Math.PI
    );
    ctx.stroke();
	
	    // Draw ticks
    ctx.strokeStyle = "rgba(0, 0, 0, 0.8)";
    ctx.lineWidth = 2;

    const tickCount = 4;
    for (let i = 0; i <= tickCount; i++) {
      const tickPos = (i * barLength) / tickCount;
      const tickStart = this.isHorizontal ? [barX + tickPos, barY + (barThickness - bubbleRadius) / 2] : [barX + (barThickness - bubbleRadius) / 2, barY + tickPos];
      const tickEnd = this.isHorizontal ? [barX + tickPos, barY + (barThickness + bubbleRadius) / 2] : [barX + (barThickness + bubbleRadius) / 2, barY + tickPos];
      ctx.beginPath();
      ctx.moveTo(...tickStart);
      ctx.lineTo(...tickEnd);
      ctx.stroke();
    }
	
  }

  getCardSize() {
    return 1;
  }
}

customElements.define("styled-bar-bubble-level-card", StyledBarBubbleLevelCard);
