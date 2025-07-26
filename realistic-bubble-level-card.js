class RealisticBubbleLevelCard extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
    const style = document.createElement("style");

style.textContent = `
  .card-header {
    font-size: 17px;
    padding: 4px 12px 0px 16px; /* Reduced top padding, adjusted bottom */
    text-align: left;
    margin-bottom: 4px;
    margin-top: 13px; /* Keeps downward shift */
  }
  .flex {
    display: flex;
    align-items: center;
  }
  .name > span {
    font-size: 17px;
    font-weight: 500; /* Less bold than 700 (bold) */
    color: var(--primary-text-color);
    opacity: 0.65; /* Opacity handled by color alpha */
	
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  
`;
    this.shadowRoot.appendChild(style);
    this.xValue = 0;
    this.yValue = 0;
  }

  setConfig(config) {
    if (!config.x_entity || !config.y_entity) {
      throw new Error("You need to define x_entity and y_entity");
    }
    this.config = config;
	    this.multiplier = config.multiplier || 5; // Default multiplier for tilt sensitivity
  }
 

  set hass(hass) {
    this._hass = hass;
    const xValue = parseFloat(hass.states[this.config.x_entity]?.state || 0);
    const yValue = parseFloat(hass.states[this.config.y_entity]?.state || 0);
    this.xValue = xValue;
    this.yValue = yValue;

    if (!this.content) {
      this.content = document.createElement("div");
	if (this.config.title) {
	  const headerDiv = document.createElement("div");
	  headerDiv.className = "card-header flex";
	  const nameDiv = document.createElement("div");
	  nameDiv.className = "name flex";
	  const titleSpan = document.createElement("span");
	  titleSpan.innerText = this.config.title;
	  nameDiv.appendChild(titleSpan);
	  headerDiv.appendChild(nameDiv);
	  this.content.appendChild(headerDiv);
	}
      const wrapper = document.createElement("div");
      wrapper.style.position = "relative";
      wrapper.style.width = "100%";
      wrapper.style.paddingBottom = "100%";
      const container = document.createElement("div");
      container.style.position = "absolute";
      container.style.top = "0";
      container.style.left = "0";
      container.style.width = "100%";
      container.style.height = "100%";
      const canvas = document.createElement("canvas");
      canvas.id = "bubble-level";
      canvas.style.width = "100%";
      canvas.style.height = "100%";
      container.appendChild(canvas);
      wrapper.appendChild(container);
      this.content.appendChild(wrapper);
      this.shadowRoot.appendChild(this.content);

      this.resizeObserver = new ResizeObserver(entries => {
        const { width, height } = entries[0].contentRect;
        canvas.width = width;
        canvas.height = height;
        this.drawLevel(this.xValue, this.yValue);
      });
      this.resizeObserver.observe(container);
    }
    this.drawLevel(xValue, yValue);
  }

  drawLevel(x, y) {
    const canvas = this.shadowRoot.getElementById("bubble-level");
    const ctx = canvas.getContext("2d");
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const radius = (Math.min(canvas.width, canvas.height) / 2) * 0.85;
    const bezelWidth = radius * 0.12;
    const bezelOuterRadius = radius + bezelWidth;

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

	// Apply multiplier to tilt values
	let bubbleX = x * this.multiplier * maxDistance; // y_entity moves east/west
	let bubbleY = -y * this.multiplier * maxDistance; // x_entity moves north/south

    const distance = Math.sqrt(bubbleX ** 2 + bubbleY ** 2);
    if (distance > maxDistance) {
      bubbleX = (bubbleX / distance) * maxDistance;
      bubbleY = (bubbleY / distance) * maxDistance;
    }
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
    const centerCircleRadius = radius * 0.18;
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
