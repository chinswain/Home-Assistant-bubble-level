class RealisticBubbleLevelCard extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
  }

  setConfig(config) {
    if (!config.x_entity || !config.y_entity) {
      throw new Error("You need to define x_entity and y_entity");
    }
    this.config = config;
  }

  set hass(hass) {
    this._hass = hass;

    const xValue = parseFloat(hass.states[this.config.x_entity]?.state || 0);
    const yValue = parseFloat(hass.states[this.config.y_entity]?.state || 0);

    if (!this.shadowRoot.lastElementChild) {
      const container = document.createElement("div");
      container.style.textAlign = "center";
      container.innerHTML = `
        <canvas id="bubble-level" width="270" height="270"></canvas>
      `; // Reduced canvas size by 10%
      this.shadowRoot.appendChild(container);
      this.drawLevel(xValue, yValue);
    } else {
      this.drawLevel(xValue, yValue);
    }
  }

  drawLevel(x, y) {
    const canvas = this.shadowRoot.getElementById("bubble-level");
    const ctx = canvas.getContext("2d");

    // Outer bezel adjustments
    const radius = Math.min(canvas.width, canvas.height) / 2 - 18; // Adjusted for smaller size
    const bezelWidth = radius * 0.12; // Bezel width
    const bezelOuterRadius = radius + bezelWidth;

    // Add padding to prevent clipping
    const canvasPadding = bezelWidth + 4.5; // Reduced padding slightly
    canvas.width = 270 + canvasPadding * 2; // Adjusted canvas dimensions
    canvas.height = 270 + canvasPadding * 2;
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;

    // Clear the canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw the dark bezel
    const darkBezelGradient = ctx.createRadialGradient(centerX, centerY, radius, centerX, centerY, bezelOuterRadius);
    darkBezelGradient.addColorStop(0, "#222222");
    darkBezelGradient.addColorStop(0.6, "#111111");
    darkBezelGradient.addColorStop(1, "#000000");

    ctx.fillStyle = darkBezelGradient;
    ctx.beginPath();
    ctx.arc(centerX, centerY, bezelOuterRadius, 0, 2 * Math.PI);
    ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI, true);
    ctx.fill();
    ctx.closePath();

    // Draw the diagonal gradient background (inner green circle)
    const gradient = ctx.createLinearGradient(centerX - radius, centerY - radius, centerX + radius, centerY + radius);
    gradient.addColorStop(0, "#3B7600");
    gradient.addColorStop(1, "#D1EE00");
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
    ctx.fill();
    ctx.closePath();

    // Bubble radius and constraints
    const bubbleRadius = radius * 0.15;
    const maxDistance = radius - bubbleRadius;

    // Calculate bubble position
    let bubbleX = x * maxDistance;
    let bubbleY = -y * maxDistance;

    // Constrain the bubble to stay inside the circle
    const distance = Math.sqrt(bubbleX ** 2 + bubbleY ** 2);
    if (distance > maxDistance) {
      bubbleX = (bubbleX / distance) * maxDistance;
      bubbleY = (bubbleY / distance) * maxDistance;
    }

    // Translate bubble position to canvas coordinates
    bubbleX += centerX;
    bubbleY += centerY;

    // Draw the bubble shadow
    ctx.fillStyle = "rgba(0, 0, 0, 0.2)";
    ctx.beginPath();
    ctx.arc(bubbleX + 1.8, bubbleY + 1.8, bubbleRadius, 0, 2 * Math.PI);
    ctx.fill();
    ctx.closePath();

    // Create gradient for the bubble
    const bubbleGradient = ctx.createRadialGradient(
      bubbleX - bubbleRadius * 0.4,
      bubbleY - bubbleRadius * 0.4,
      bubbleRadius * 0.1,
      bubbleX,
      bubbleY,
      bubbleRadius
    );
    bubbleGradient.addColorStop(0, "rgba(255, 255, 255, 0.8)");
    bubbleGradient.addColorStop(0.5, "rgba(173, 216, 230, 0.6)");
    bubbleGradient.addColorStop(1, "rgba(0, 0, 0, 0.2)");

    // Draw the bubble
    ctx.fillStyle = bubbleGradient;
    ctx.beginPath();
    ctx.arc(bubbleX, bubbleY, bubbleRadius, 0, 2 * Math.PI);
    ctx.fill();
    ctx.closePath();

    // Add a subtle shine effect
    ctx.strokeStyle = "rgba(255, 255, 255, 0.4)";
    ctx.lineWidth = 1.35;
    ctx.beginPath();
    ctx.arc(bubbleX - bubbleRadius * 0.3, bubbleY - bubbleRadius * 0.3, bubbleRadius * 0.5, 0.75 * Math.PI, 1.75 * Math.PI);
    ctx.stroke();
    ctx.closePath();

    // Draw the crosshairs
    ctx.strokeStyle = "rgba(0, 0, 0, 0.6)";
    ctx.lineWidth = 1.8;
    ctx.beginPath();
    ctx.moveTo(centerX - radius, centerY);
    ctx.lineTo(centerX + radius, centerY);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(centerX, centerY - radius);
    ctx.lineTo(centerX, centerY + radius);
    ctx.stroke();
    ctx.closePath();

    // Draw the central black circle
    const centerCircleRadius = radius * 0.18; // Adjusted proportionally
    ctx.strokeStyle = "rgba(0, 0, 0, 0.8)";
    ctx.lineWidth = 1.8;
    ctx.beginPath();
    ctx.arc(centerX, centerY, centerCircleRadius, 0, 2 * Math.PI);
    ctx.stroke();
    ctx.closePath();
  }

  getCardSize() {
    return 3;
  }
}

customElements.define("realistic-bubble-level-card", RealisticBubbleLevelCard);
