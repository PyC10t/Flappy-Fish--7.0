const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const startBtn = document.getElementById('startBtn');
const restartBtn = document.getElementById('restartBtn');
const menuBtn = document.getElementById('menuBtn');
const menu = document.getElementById('menu');
const gameOverScreen = document.getElementById('gameOverScreen');
const endMessage = document.getElementById('endMessage');

// 🐟 Animación del menú con peces nadando
const menuCanvas = document.createElement('canvas');
const menuCtx = menuCanvas.getContext('2d');
menuCanvas.id = 'menuBgCanvas';
document.body.insertBefore(menuCanvas, document.body.firstChild);
menuCanvas.style.position = 'fixed';
menuCanvas.style.top = '0';
menuCanvas.style.left = '0';
menuCanvas.style.width = '100vw';
menuCanvas.style.height = '100vh';
menuCanvas.style.zIndex = '1';
menuCanvas.style.pointerEvents = 'none';

// Ajuste responsive del fondo del menú
function resizeMenuCanvas() {
  menuCanvas.width = window.innerWidth;
  menuCanvas.height = window.innerHeight;
}
window.addEventListener('resize', resizeMenuCanvas);
resizeMenuCanvas();

// Crear peces nadando
const fishes = [];
// Paletas atractivas para peces: cada paleta tiene color principal, secundario y acento
const fishPalettes = [
  ['#ff6b6b', '#ff9a9e', '#ffe3e3'], // coral
  ['#00ccff', '#0077ff', '#00f5a0'], // teal/azul
  ['#ffd166', '#ff9f1c', '#ff6b00'], // amarillo/naranja
  ['#9b5de5', '#7b2cbf', '#d2b4ff'], // morado
  ['#3ae374', '#2ed573', '#16a085'], // verde lima
  ['#ff8fab', '#ff5c8a', '#ffe0f0']  // rosa
];
for (let i = 0; i < 15; i++) {
  fishes.push({
    x: Math.random() * menuCanvas.width,
    y: Math.random() * menuCanvas.height,
    size: 30 + Math.random() * 25,
    speed: 0.8 + Math.random() * 1.2,
    direction: Math.random() > 0.5 ? 1 : -1,
    palette: fishPalettes[Math.floor(Math.random() * fishPalettes.length)],
    bobOffset: Math.random() * Math.PI * 2
  });
}

// Fondo marino animado del menú
function drawMenuBackground() {
  const grad = menuCtx.createLinearGradient(0, 0, 0, menuCanvas.height);
  grad.addColorStop(0, '#0099cc');
  grad.addColorStop(1, '#001f4d');
  menuCtx.fillStyle = grad;
  menuCtx.fillRect(0, 0, menuCanvas.width, menuCanvas.height);

  // Burbujas
  for (let i = 0; i < 20; i++) {
    const x = Math.random() * menuCanvas.width;
    const y = (performance.now() / 15 + i * 50) % menuCanvas.height;
    menuCtx.beginPath();
    menuCtx.arc(x, menuCanvas.height - y, 3, 0, Math.PI * 2);
    menuCtx.fillStyle = 'rgba(255,255,255,0.4)';
    menuCtx.fill();
  }

  // Peces
  fishes.forEach(fish => {
    fish.x += fish.speed * fish.direction;
    fish.bobOffset += 0.02;
    const bobY = fish.y + Math.sin(fish.bobOffset) * 8;
    
    if (fish.x > menuCanvas.width + 100) fish.x = -100;
    if (fish.x < -100) fish.x = menuCanvas.width + 100;

    menuCtx.save();
    menuCtx.translate(fish.x, bobY);
    if (fish.direction === -1) menuCtx.scale(-1, 1);

  // Cuerpo del pez con gradiente usando la paleta
  const p0 = fish.palette[0];
  const p1 = fish.palette[1];
  const p2 = fish.palette[2];
  const gradient = menuCtx.createLinearGradient(-fish.size, 0, fish.size, 0);
  gradient.addColorStop(0, p0);
  gradient.addColorStop(0.6, p1);
  gradient.addColorStop(1, p2);
  menuCtx.fillStyle = gradient;
    menuCtx.beginPath();
    menuCtx.ellipse(0, 0, fish.size, fish.size / 2, 0, 0, Math.PI * 2);
    menuCtx.fill();

  // Cola del pez (acento)
  menuCtx.fillStyle = p1;
    menuCtx.beginPath();
    menuCtx.moveTo(-fish.size, 0);
    menuCtx.lineTo(-fish.size * 1.4, -fish.size / 3);
    menuCtx.lineTo(-fish.size * 1.4, fish.size / 3);
    menuCtx.closePath();
    menuCtx.fill();

  // Ojo
  menuCtx.fillStyle = 'white';
    menuCtx.beginPath();
    menuCtx.arc(fish.size * 0.5, -fish.size * 0.2, fish.size * 0.15, 0, Math.PI * 2);
    menuCtx.fill();
    menuCtx.fillStyle = 'black';
    menuCtx.beginPath();
    menuCtx.arc(fish.size * 0.52, -fish.size * 0.2, fish.size * 0.08, 0, Math.PI * 2);
    menuCtx.fill();

    menuCtx.restore();
  });

  requestAnimationFrame(drawMenuBackground);
}
drawMenuBackground();

// Nota: la visibilidad de `menuCanvas` se controla en los handlers centrales

// Ajuste responsive
function resizeCanvas() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}
window.addEventListener('resize', resizeCanvas);
resizeCanvas();

// Variables del juego
let fish, pipes, score, highScore = 0;
let gameOver = false;
let speed = 3.5;
let gap = 160;
let pipeInterval;
let countdown = 3;
let countdownActive = false;

// Fondo animado - burbujas
const burbujas = [];
for (let i = 0; i < 25; i++) {
  burbujas.push({
    x: Math.random() * canvas.width,
    y: Math.random() * canvas.height,
    radio: Math.random() * 4 + 2,
    velocidad: Math.random() * 0.5 + 0.2
  });
}

// Reiniciar juego
function resetGame() {
  fish = {
    x: canvas.width / 4,
    y: canvas.height / 2,
    radius: 25,
    gravity: 0.4,
    lift: -8,
    velocity: 0,
    rotation: 0
  };
  pipes = [];
  score = 0;
  gameOver = false;
  speed = 3.5;
  gap = 160;
  clearInterval(pipeInterval);
  // Asignar paleta aleatoria al pez jugador
  const pal = fishPalettes[Math.floor(Math.random() * fishPalettes.length)];
  fish.colorMain = pal[0];
  fish.colorMid = pal[1];
  fish.colorAccent = pal[2];
}

// Iniciar juego
function startGame() {
  menu.style.display = 'none';
  gameOverScreen.style.display = 'none';
  canvas.style.display = 'block';
  // ocultar fondo animado del menú al empezar
  menuCanvas.style.display = 'none';
  resetGame();
  countdown = 3;
  countdownActive = true;
  countdownStart();
}

// Cuenta regresiva antes de empezar
function countdownStart() {
  const interval = setInterval(() => {
    drawFondoMarino();
    ctx.fillStyle = 'white';
    ctx.font = '100px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(countdown, canvas.width / 2, canvas.height / 2);
    countdown--;
    if (countdown < 0) {
      clearInterval(interval);
      countdownActive = false;
      createPipe();
      startPipeSpawner();
      animate();
    }
  }, 1000);
}

// Generar tubos
// Create a pipe with constrained spacing so pipes don't overlap awkwardly
function createPipe() {
  const minTop = 50;
  const maxTop = canvas.height - gap - 50;
  const topHeight = Math.max(minTop, Math.min(maxTop, Math.floor(Math.random() * (canvas.height - gap - 100) + 50)));
  pipes.push({ x: canvas.width, top: topHeight, bottom: topHeight + gap, width: 80 });
}

// Crear tubos de forma periódica
function startPipeSpawner() {
  pipeInterval = setInterval(() => {
    if (!gameOver) createPipe();
  }, 3000);
}

// Dibujar pez con animación de caída
function drawFish() {
  ctx.save();
  ctx.translate(fish.x, fish.y);
  ctx.rotate(fish.rotation);

  // Cuerpo con paleta (seleccionada en resetGame)
  const gradient = ctx.createLinearGradient(-30, -20, 30, 20);
  gradient.addColorStop(0, fish.colorMain || '#00ccff');
  gradient.addColorStop(0.6, fish.colorMid || '#0077ff');
  gradient.addColorStop(1, fish.colorAccent || '#001f4d');
  ctx.beginPath();
  ctx.ellipse(0, 0, 35, 25, 0, 0, Math.PI * 2);
  ctx.fill();

  // Cola
  ctx.beginPath();
  ctx.moveTo(-30, 0);
  ctx.lineTo(-50, -15);
  ctx.lineTo(-50, 15);
  ctx.closePath();
  ctx.fillStyle = fish.colorAccent || '#005fa3';
  ctx.fill();

  // Ojo
  ctx.beginPath();
  ctx.arc(15, -5, 5, 0, Math.PI * 2);
  ctx.fillStyle = 'white';
  ctx.fill();
  ctx.beginPath();
  ctx.arc(17, -5, 3, 0, Math.PI * 2);
  ctx.fillStyle = 'black';
  ctx.fill();

  // Brillo superior (shine)
  ctx.beginPath();
  ctx.fillStyle = 'rgba(255,255,255,0.35)';
  ctx.ellipse(-2, -8, 18, 8, -0.3, 0, Math.PI * 2);
  ctx.fill();

  // Línea de detalle ligera
  ctx.beginPath();
  ctx.strokeStyle = 'rgba(255,255,255,0.18)';
  ctx.lineWidth = 1.5;
  ctx.moveTo(-15, -3);
  ctx.quadraticCurveTo(0, -8, 18, -2);
  ctx.stroke();
  ctx.restore();
}

// Fondo marino con burbujas animadas
function drawFondoMarino() {
  // Paleta similar al menú (azul claro -> azul oscuro)
  const degradado = ctx.createLinearGradient(0, 0, 0, canvas.height);
  degradado.addColorStop(0, '#00ccff');
  degradado.addColorStop(1, '#001f4d');
  ctx.fillStyle = degradado;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Burbujas
  burbujas.forEach(b => {
    ctx.beginPath();
    ctx.arc(b.x, b.y, b.radio, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(255,255,255,0.6)';
    ctx.fill();
    b.y -= b.velocidad;
    if (b.y + b.radio < 0) {
      b.y = canvas.height + b.radio;
      b.x = Math.random() * canvas.width;
    }
  });

  // Algas
  ctx.fillStyle = '#006600';
  for (let i = 0; i < 20; i++) {
    const baseX = i * 70 + 20;
    ctx.beginPath();
    ctx.moveTo(baseX, canvas.height);
    for (let y = canvas.height; y > canvas.height - 120; y -= 20) {
      const offsetX = Math.sin((y + performance.now() / 200) / 20) * 10;
      ctx.lineTo(baseX + offsetX, y);
    }
    ctx.lineTo(baseX, canvas.height);
    ctx.fill();
  }

  // Corales
  ctx.fillStyle = '#cc6b33';
  ctx.beginPath();
  ctx.moveTo(30, canvas.height);
  ctx.quadraticCurveTo(50, canvas.height - 40, 40, canvas.height - 60);
  ctx.quadraticCurveTo(60, canvas.height - 20, 80, canvas.height - 60);
  ctx.lineTo(80, canvas.height);
  ctx.fill();
}

// Animación principal
function animate() {
  if (gameOver) return;
  drawFondoMarino();

  // Movimiento del pez con rotación
  fish.velocity += fish.gravity;
  fish.y += fish.velocity;
  fish.rotation = Math.min(Math.max(fish.velocity / 10, -0.5), 1.2);
  drawFish();

  // Dibujar tubos y verificar colisiones
  for (let i = 0; i < pipes.length; i++) {
    const p = pipes[i];
    const w = p.width || 80;
    ctx.fillStyle = '#007700';
    ctx.fillRect(p.x, 0, w, p.top);
    ctx.fillRect(p.x, p.bottom, w, canvas.height - p.bottom);
    p.x -= speed;

    // Pasar tubo (fuera de pantalla)
    if (p.x + w < 0) {
      pipes.splice(i, 1);
      score++;
      if (score > highScore) highScore = score;
      i--;

      // Aumenta velocidad y reduce gap cada 5 puntos (mínimo seguro)
      if (score % 5 === 0) {
        speed = Math.min(8, speed + 0.3);
        gap = Math.max(100, gap - 10);
      }
    }

    // Colisiones básicas
    const hitX = fish.x + fish.radius > p.x && fish.x - fish.radius < p.x + w;
    const hitY = fish.y - fish.radius < p.top || fish.y + fish.radius > p.bottom;
    if (fish.y + fish.radius > canvas.height || fish.y - fish.radius < 0 || (hitX && hitY)) {
      gameOver = true;
      clearInterval(pipeInterval);
      showEndScreen('¡Perdiste! 💔');
    }
  }

  // HUD
  ctx.fillStyle = 'white';
  ctx.font = '26px Arial';
  ctx.textAlign = 'left';
  ctx.fillText(`Puntaje: ${score}`, 20, 40);
  ctx.fillText(`Record: ${highScore}`, 20, 80);

  requestAnimationFrame(animate);
}

// Pantalla final
function showEndScreen(msg) {
  endMessage.textContent = msg;
  gameOverScreen.style.display = 'block';
  canvas.style.display = 'none';
}

// Controles
window.addEventListener('keydown', (e) => {
  if (e.code === 'Space' && !gameOver && !countdownActive) {
    fish.velocity = fish.lift;
  }
});

canvas.addEventListener('touchstart', () => {
  if (!gameOver && !countdownActive) fish.velocity = fish.lift;
});

canvas.addEventListener('click', () => {
  if (!gameOver && !countdownActive) fish.velocity = fish.lift;
});

startBtn.addEventListener('click', startGame);
restartBtn.addEventListener('click', startGame);
menuBtn.addEventListener('click', () => {
  gameOverScreen.style.display = 'none';
  menu.style.display = 'block';
  canvas.style.display = 'none';
  // mostrar fondo animado del menú
  menuCanvas.style.display = 'block';
});