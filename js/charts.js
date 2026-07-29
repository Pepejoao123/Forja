// FORJA – Charts (vanilla canvas)
const Charts = {
  getAccent() {
    return getComputedStyle(document.documentElement).getPropertyValue('--accent').trim() || '#FF5733';
  },
  getBg3() {
    return getComputedStyle(document.documentElement).getPropertyValue('--bg3').trim() || '#22263A';
  },
  getText2() {
    return getComputedStyle(document.documentElement).getPropertyValue('--text2').trim() || '#8B90A0';
  },

  drawBarChart(canvasId, labels, values) {
    const canvas = document.getElementById(canvasId);
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const dpr = window.devicePixelRatio || 1;
    const W = canvas.offsetWidth;
    const H = 140;
    canvas.width = W * dpr;
    canvas.height = H * dpr;
    canvas.style.height = H + 'px';
    ctx.scale(dpr, dpr);
    ctx.clearRect(0, 0, W, H);

    const accent = this.getAccent();
    const bg3 = this.getBg3();
    const text2 = this.getText2();

    const maxVal = Math.max(...values, 1);
    const n = labels.length;
    const padX = 8, padTop = 10, padBottom = 28;
    const barArea = W - padX * 2;
    const barW = Math.max(8, barArea / n - 6);
    const gap = (barArea - barW * n) / (n - 1 || 1);

    values.forEach((v, i) => {
      const x = padX + i * (barW + gap);
      const fillH = ((v / maxVal) * (H - padTop - padBottom)) || 2;
      const y = H - padBottom - fillH;

      // bg bar
      ctx.fillStyle = bg3;
      ctx.beginPath();
      ctx.roundRect(x, padTop, barW, H - padTop - padBottom, 4);
      ctx.fill();

      // value bar
      if (v > 0) {
        ctx.fillStyle = accent;
        ctx.globalAlpha = i === n - 1 ? 1 : 0.65;
        ctx.beginPath();
        ctx.roundRect(x, y, barW, fillH, 4);
        ctx.fill();
        ctx.globalAlpha = 1;
      }

      // label
      ctx.fillStyle = text2;
      ctx.font = '10px Inter, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(labels[i], x + barW / 2, H - 8);
    });
  },

  drawLineChart(canvasId, labels, values) {
    const canvas = document.getElementById(canvasId);
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const dpr = window.devicePixelRatio || 1;
    const W = canvas.offsetWidth;
    const H = 120;
    canvas.width = W * dpr;
    canvas.height = H * dpr;
    canvas.style.height = H + 'px';
    ctx.scale(dpr, dpr);
    ctx.clearRect(0, 0, W, H);

    const accent = this.getAccent();
    const text2 = this.getText2();
    const maxVal = Math.max(...values, 1);
    const n = values.length;
    const padX = 10, padTop = 10, padBottom = 24;
    const points = values.map((v, i) => ({
      x: padX + (i / (n - 1 || 1)) * (W - padX * 2),
      y: padTop + (1 - v / maxVal) * (H - padTop - padBottom)
    }));

    // gradient fill
    const grad = ctx.createLinearGradient(0, padTop, 0, H);
    grad.addColorStop(0, accent + '55');
    grad.addColorStop(1, accent + '00');
    ctx.beginPath();
    points.forEach((p, i) => i === 0 ? ctx.moveTo(p.x, p.y) : ctx.lineTo(p.x, p.y));
    ctx.lineTo(points[points.length-1].x, H - padBottom);
    ctx.lineTo(points[0].x, H - padBottom);
    ctx.closePath();
    ctx.fillStyle = grad;
    ctx.fill();

    // line
    ctx.beginPath();
    ctx.strokeStyle = accent;
    ctx.lineWidth = 2;
    ctx.lineJoin = 'round';
    points.forEach((p, i) => i === 0 ? ctx.moveTo(p.x, p.y) : ctx.lineTo(p.x, p.y));
    ctx.stroke();

    // dots
    points.forEach(p => {
      ctx.beginPath();
      ctx.arc(p.x, p.y, 3, 0, Math.PI * 2);
      ctx.fillStyle = accent;
      ctx.fill();
    });

    // labels (show first, mid, last)
    const show = new Set([0, Math.floor(n/2), n-1]);
    ctx.fillStyle = text2;
    ctx.font = '10px Inter, sans-serif';
    ctx.textAlign = 'center';
    labels.forEach((l, i) => {
      if (show.has(i)) ctx.fillText(l, points[i].x, H - 6);
    });
  }
};
