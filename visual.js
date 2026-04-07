// Mini pantalla con efectos visuales reactivos a la melodia

export class VisualDisplay {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.particles = [];
    this.stars = [];
    this.floatingNotes = [];
    this.time = 0;
    this.beatIntensity = 0;
    this.activeNote = -1;

    // Init background stars
    for (let i = 0; i < 40; i++) {
      this.stars.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        size: Math.random() * 2.5 + 0.5,
        speed: Math.random() * 0.3 + 0.1,
        twinkle: Math.random() * Math.PI * 2,
      });
    }

    this.animate();
  }

  trigger(noteIndex, color) {
    this.beatIntensity = 1;
    this.activeNote = noteIndex;

    const cx = this.canvas.width / 2;
    const cy = this.canvas.height / 2;

    // Spawn particles in a burst
    const count = 10;
    for (let i = 0; i < count; i++) {
      const angle = (Math.PI * 2 * i) / count + Math.random() * 0.3;
      const speed = 1.5 + Math.random() * 3;
      this.particles.push({
        x: cx + (Math.random() - 0.5) * 60,
        y: cy + (Math.random() - 0.5) * 30,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 1,
        life: 1,
        decay: 0.015 + Math.random() * 0.02,
        size: 3 + Math.random() * 4,
        color: color || '#ff69b4',
      });
    }

    // Spawn a floating musical note symbol
    const noteSymbols = ['\u266A', '\u266B', '\u2669'];
    this.floatingNotes.push({
      x: cx + (Math.random() - 0.5) * 100,
      y: cy,
      vy: -1.5 - Math.random() * 1.5,
      vx: (Math.random() - 0.5) * 1,
      life: 1,
      decay: 0.01,
      symbol: noteSymbols[Math.floor(Math.random() * noteSymbols.length)],
      size: 14 + Math.random() * 10,
      color: color || '#ff69b4',
      rotation: (Math.random() - 0.5) * 0.5,
    });
  }

  triggerStep() {
    this.beatIntensity = Math.max(this.beatIntensity, 0.3);
  }

  animate() {
    const { ctx, canvas } = this;
    const w = canvas.width;
    const h = canvas.height;
    this.time += 0.02;

    // Background gradient
    const grad = ctx.createRadialGradient(w / 2, h / 2, 0, w / 2, h / 2, w * 0.7);
    const pulse = this.beatIntensity * 0.15;
    grad.addColorStop(0, `rgba(${60 + pulse * 200}, ${10 + pulse * 50}, ${80 + pulse * 100}, 1)`);
    grad.addColorStop(1, `rgba(${20}, ${5}, ${35}, 1)`);
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, w, h);

    // Stars
    for (const star of this.stars) {
      star.twinkle += 0.03;
      const alpha = 0.4 + Math.sin(star.twinkle) * 0.4 + this.beatIntensity * 0.2;
      const size = star.size + this.beatIntensity * 1.5;
      ctx.beginPath();
      ctx.arc(star.x, star.y, size, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(255, 200, 255, ${alpha})`;
      ctx.fill();

      // Star glow
      ctx.beginPath();
      ctx.arc(star.x, star.y, size * 2.5, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(255, 150, 255, ${alpha * 0.15})`;
      ctx.fill();

      star.y -= star.speed;
      if (star.y < -5) {
        star.y = h + 5;
        star.x = Math.random() * w;
      }
    }

    // Center ring wave
    if (this.beatIntensity > 0.1) {
      for (let r = 0; r < 3; r++) {
        const ringSize = 20 + (1 - this.beatIntensity) * (40 + r * 25);
        ctx.beginPath();
        ctx.arc(w / 2, h / 2, ringSize, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(255, 150, 255, ${this.beatIntensity * 0.4 / (r + 1)})`;
        ctx.lineWidth = (2 + this.beatIntensity * 3) / (r + 1);
        ctx.stroke();
      }
    }

    // Draw heart shape on strong beats
    if (this.beatIntensity > 0.5) {
      ctx.save();
      ctx.translate(w / 2, h / 2 - 5);
      const s = 8 + this.beatIntensity * 12;
      ctx.beginPath();
      ctx.moveTo(0, s * 0.4);
      ctx.bezierCurveTo(-s, -s * 0.3, -s * 0.5, -s, 0, -s * 0.4);
      ctx.bezierCurveTo(s * 0.5, -s, s, -s * 0.3, 0, s * 0.4);
      ctx.fillStyle = `rgba(255, 105, 180, ${this.beatIntensity * 0.5})`;
      ctx.fill();
      ctx.restore();
    }

    // Wave lines
    ctx.beginPath();
    ctx.strokeStyle = `rgba(255, 180, 255, ${0.3 + this.beatIntensity * 0.3})`;
    ctx.lineWidth = 1.5;
    for (let x = 0; x < w; x += 2) {
      const y = h / 2 + Math.sin(x * 0.03 + this.time * 2) * (10 + this.beatIntensity * 25)
                       + Math.sin(x * 0.07 + this.time * 3) * 5;
      if (x === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.stroke();

    // Particles
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.x += p.vx;
      p.y += p.vy;
      p.life -= p.decay;
      p.vy += 0.02;

      if (p.life <= 0) {
        this.particles.splice(i, 1);
        continue;
      }

      ctx.globalAlpha = p.life;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size * p.life, 0, Math.PI * 2);
      ctx.fillStyle = p.color;
      ctx.fill();

      // Glow
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size * p.life * 2, 0, Math.PI * 2);
      ctx.fillStyle = `${p.color}33`;
      ctx.fill();
    }
    ctx.globalAlpha = 1;

    // Floating musical notes
    for (let i = this.floatingNotes.length - 1; i >= 0; i--) {
      const n = this.floatingNotes[i];
      n.x += n.vx;
      n.y += n.vy;
      n.life -= n.decay;
      n.rotation += 0.02;

      if (n.life <= 0) {
        this.floatingNotes.splice(i, 1);
        continue;
      }

      ctx.save();
      ctx.globalAlpha = n.life;
      ctx.translate(n.x, n.y);
      ctx.rotate(n.rotation);
      ctx.font = `${n.size}px Fredoka`;
      ctx.fillStyle = n.color;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(n.symbol, 0, 0);

      // Glow behind note
      ctx.shadowColor = n.color;
      ctx.shadowBlur = 15;
      ctx.fillText(n.symbol, 0, 0);
      ctx.shadowBlur = 0;
      ctx.restore();
    }
    ctx.globalAlpha = 1;

    // Decay beat intensity
    this.beatIntensity *= 0.93;

    requestAnimationFrame(() => this.animate());
  }
}
