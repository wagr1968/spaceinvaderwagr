// Space Invaders - Juego completo
// Creado por William Gutiérrez

// Configuración del canvas y contexto
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Función para ajustar el tamaño del canvas según el dispositivo
function resizeCanvas() {
    const container = canvas.parentElement;
    const maxWidth = Math.min(600, window.innerWidth - 40);
    const maxHeight = Math.min(600, window.innerHeight - 200);
    
    const size = Math.min(maxWidth, maxHeight);
    canvas.width = size;
    canvas.height = size;
    
    // Ajustar posición de la nave del jugador
    player.x = canvas.width / 2 - player.width / 2;
    player.y = canvas.height - 50;
}

// Detectar si es dispositivo móvil
const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

// Variables del juego
let gameState = 'playing'; // 'playing', 'gameOver', 'victory'
let score = 0;
let lives = 3;
let gameSpeed = 1;

// Configuración de la nave del jugador
const player = {
    x: 0, // Se inicializará en resizeCanvas()
    y: 0, // Se inicializará en resizeCanvas()
    width: 50,
    height: 30,
    speed: 5,
    color: '#0066CC' // Azul de la bandera colombiana
};

// Array de proyectiles del jugador
let playerBullets = [];

// Array de enemigos
let enemies = [];
const enemyRows = 5;
const enemyCols = 10;
const enemySpacing = 50;
const enemyStartX = 50;
const enemyStartY = 80;

// Array de proyectiles enemigos
let enemyBullets = [];

// Variables de movimiento de enemigos
let enemyDirection = 1;
let enemySpeed = 1;
let enemyMoveTimer = 0;
let enemyShootTimer = 0;

// Teclas presionadas
const keys = {};

// Inicialización del juego
function initGame() {
    createEnemies();
    updateDisplay();
    gameLoop();
}

// Creación de los enemigos en formación
function createEnemies() {
    enemies = [];
    const canvasWidth = canvas.width;
    const enemyWidth = 30;
    const spacing = Math.min(50, (canvasWidth - 100) / enemyCols);
    const startX = (canvasWidth - (enemyCols * spacing)) / 2;
    
    for (let row = 0; row < enemyRows; row++) {
        for (let col = 0; col < enemyCols; col++) {
            enemies.push({
                x: startX + col * spacing,
                y: enemyStartY + row * 40,
                width: enemyWidth,
                height: 25,
                alive: true,
                color: '#CC0000' // Rojo de la bandera colombiana
            });
        }
    }
}

// Actualización de la pantalla de información
function updateDisplay() {
    document.getElementById('score').textContent = score;
    document.getElementById('lives').textContent = lives;
}

// Bucle principal del juego
function gameLoop() {
    if (gameState === 'playing') {
        update();
        draw();
    }
    requestAnimationFrame(gameLoop);
}

// Actualización de la lógica del juego
function update() {
    // Movimiento del jugador
    if (keys['ArrowLeft'] && player.x > 0) {
        player.x -= player.speed;
    }
    if (keys['ArrowRight'] && player.x < canvas.width - player.width) {
        player.x += player.speed;
    }

    // Movimiento de enemigos
    enemyMoveTimer++;
    if (enemyMoveTimer >= 60 - gameSpeed * 5) {
        moveEnemies();
        enemyMoveTimer = 0;
    }

    // Disparos enemigos
    enemyShootTimer++;
    if (enemyShootTimer >= 120 - gameSpeed * 10) {
        enemyShoot();
        enemyShootTimer = 0;
    }

    // Actualización de proyectiles del jugador
    updateBullets(playerBullets, -5);
    
    // Actualización de proyectiles enemigos
    updateBullets(enemyBullets, 3);

    // Detección de colisiones
    checkCollisions();
    
    // Verificación de condiciones de victoria/derrota
    checkGameConditions();
}

// Movimiento de los enemigos
function moveEnemies() {
    let shouldMoveDown = false;
    
    // Verificar si algún enemigo toca los bordes
    for (let enemy of enemies) {
        if (enemy.alive) {
            if ((enemy.x <= 0 && enemyDirection === -1) || 
                (enemy.x >= canvas.width - enemy.width && enemyDirection === 1)) {
                shouldMoveDown = true;
                break;
            }
        }
    }
    
    // Mover enemigos
    for (let enemy of enemies) {
        if (enemy.alive) {
            if (shouldMoveDown) {
                enemy.y += 20;
            } else {
                enemy.x += enemyDirection * enemySpeed;
            }
        }
    }
    
    // Cambiar dirección si se movió hacia abajo
    if (shouldMoveDown) {
        enemyDirection *= -1;
    }
}

// Disparo de enemigos
function enemyShoot() {
    const aliveEnemies = enemies.filter(enemy => enemy.alive);
    if (aliveEnemies.length > 0) {
        const randomEnemy = aliveEnemies[Math.floor(Math.random() * aliveEnemies.length)];
        enemyBullets.push({
            x: randomEnemy.x + randomEnemy.width / 2 - 2,
            y: randomEnemy.y + randomEnemy.height,
            width: 4,
            height: 10,
            color: '#FF6B6B' // Rojo claro
        });
    }
}

// Actualización de proyectiles
function updateBullets(bullets, speed) {
    for (let i = bullets.length - 1; i >= 0; i--) {
        bullets[i].y += speed;
        
        // Eliminar proyectiles que salen de la pantalla
        if (bullets[i].y < 0 || bullets[i].y > canvas.height) {
            bullets.splice(i, 1);
        }
    }
}

// Detección de colisiones
function checkCollisions() {
    // Colisiones entre proyectiles del jugador y enemigos
    for (let i = playerBullets.length - 1; i >= 0; i--) {
        for (let j = enemies.length - 1; j >= 0; j--) {
            if (enemies[j].alive && 
                playerBullets[i].x < enemies[j].x + enemies[j].width &&
                playerBullets[i].x + playerBullets[i].width > enemies[j].x &&
                playerBullets[i].y < enemies[j].y + enemies[j].height &&
                playerBullets[i].y + playerBullets[i].height > enemies[j].y) {
                
                // Enemigo destruido
                enemies[j].alive = false;
                playerBullets.splice(i, 1);
                score += 10;
                updateDisplay();
                break;
            }
        }
    }
    
    // Colisiones entre proyectiles enemigos y jugador
    for (let i = enemyBullets.length - 1; i >= 0; i--) {
        if (enemyBullets[i].x < player.x + player.width &&
            enemyBullets[i].x + enemyBullets[i].width > player.x &&
            enemyBullets[i].y < player.y + player.height &&
            enemyBullets[i].y + enemyBullets[i].height > player.y) {
            
            // Jugador golpeado
            enemyBullets.splice(i, 1);
            lives--;
            updateDisplay();
            
            if (lives <= 0) {
                gameState = 'gameOver';
                showMessage('¡GAME OVER!');
            }
        }
    }
    
    // Verificar si enemigos llegaron al jugador
    for (let enemy of enemies) {
        if (enemy.alive && enemy.y + enemy.height >= player.y) {
            gameState = 'gameOver';
            showMessage('¡GAME OVER!');
            break;
        }
    }
}

// Verificación de condiciones de victoria/derrota
function checkGameConditions() {
    const aliveEnemies = enemies.filter(enemy => enemy.alive);
    
    if (aliveEnemies.length === 0) {
        gameState = 'victory';
        showMessage('¡HAS GANADO!');
    }
}

// Mostrar mensaje en pantalla
function showMessage(text) {
    const messageEl = document.getElementById('gameMessage');
    messageEl.textContent = text;
    messageEl.classList.add('show');
}

// Renderizado del juego
function draw() {
    // Limpiar canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Dibujar jugador
    drawPlayer();
    
    // Dibujar enemigos
    drawEnemies();
    
    // Dibujar proyectiles
    drawBullets(playerBullets);
    drawBullets(enemyBullets);
}

// Dibujar nave del jugador
function drawPlayer() {
    ctx.fillStyle = player.color;
    ctx.fillRect(player.x, player.y, player.width, player.height);
    
    // Detalles de la nave
    ctx.fillStyle = '#FFD700'; // Amarillo
    ctx.fillRect(player.x + 20, player.y - 5, 10, 5); // Cañón
}

// Dibujar enemigos
function drawEnemies() {
    for (let enemy of enemies) {
        if (enemy.alive) {
            ctx.fillStyle = enemy.color;
            ctx.fillRect(enemy.x, enemy.y, enemy.width, enemy.height);
            
            // Detalles del enemigo
            ctx.fillStyle = '#FFD700'; // Amarillo
            ctx.fillRect(enemy.x + 5, enemy.y + 5, 5, 5);
            ctx.fillRect(enemy.x + 20, enemy.y + 5, 5, 5);
            ctx.fillRect(enemy.x + 10, enemy.y + 15, 10, 5);
        }
    }
}

// Dibujar proyectiles
function drawBullets(bullets) {
    for (let bullet of bullets) {
        ctx.fillStyle = bullet.color;
        ctx.fillRect(bullet.x, bullet.y, bullet.width, bullet.height);
    }
}

// Disparo del jugador
function shoot() {
    if (gameState === 'playing') {
        playerBullets.push({
            x: player.x + player.width / 2 - 2,
            y: player.y,
            width: 4,
            height: 10,
            color: '#FFD700' // Amarillo
        });
    }
}

// Reiniciar juego
function resetGame() {
    gameState = 'playing';
    score = 0;
    lives = 3;
    gameSpeed = 1;
    playerBullets = [];
    enemyBullets = [];
    enemyDirection = 1;
    enemyMoveTimer = 0;
    enemyShootTimer = 0;
    
    // Ajustar posición del jugador según el tamaño actual del canvas
    player.x = canvas.width / 2 - player.width / 2;
    player.y = canvas.height - 50;
    
    createEnemies();
    updateDisplay();
    
    // Ocultar mensaje
    document.getElementById('gameMessage').classList.remove('show');
}

// Event listeners para teclado
document.addEventListener('keydown', (e) => {
    keys[e.key] = true;
    
    if (e.key === ' ') {
        e.preventDefault();
        shoot();
    }
    
    if (e.key === 'r' || e.key === 'R' || e.key === 'Enter') {
        resetGame();
    }
});

document.addEventListener('keyup', (e) => {
    keys[e.key] = false;
});

// Controles táctiles para móvil
function setupTouchControls() {
    const leftBtn = document.getElementById('leftBtn');
    const rightBtn = document.getElementById('rightBtn');
    const shootBtn = document.getElementById('shootBtn');
    const restartBtn = document.getElementById('restartBtn');
    
    // Botón izquierdo
    leftBtn.addEventListener('touchstart', (e) => {
        e.preventDefault();
        keys['ArrowLeft'] = true;
    });
    
    leftBtn.addEventListener('touchend', (e) => {
        e.preventDefault();
        keys['ArrowLeft'] = false;
    });
    
    // Botón derecho
    rightBtn.addEventListener('touchstart', (e) => {
        e.preventDefault();
        keys['ArrowRight'] = true;
    });
    
    rightBtn.addEventListener('touchend', (e) => {
        e.preventDefault();
        keys['ArrowRight'] = false;
    });
    
    // Botón de disparo
    shootBtn.addEventListener('touchstart', (e) => {
        e.preventDefault();
        shoot();
    });
    
    // También funcionar con clics para dispositivos híbridos
    leftBtn.addEventListener('mousedown', (e) => {
        e.preventDefault();
        keys['ArrowLeft'] = true;
    });
    
    leftBtn.addEventListener('mouseup', (e) => {
        e.preventDefault();
        keys['ArrowLeft'] = false;
    });
    
    rightBtn.addEventListener('mousedown', (e) => {
        e.preventDefault();
        keys['ArrowRight'] = true;
    });
    
    rightBtn.addEventListener('mouseup', (e) => {
        e.preventDefault();
        keys['ArrowRight'] = false;
    });
    
    shootBtn.addEventListener('click', (e) => {
        e.preventDefault();
        shoot();
    });
    
    // Botón de reinicio
    restartBtn.addEventListener('click', (e) => {
        e.preventDefault();
        resetGame();
    });
    
    restartBtn.addEventListener('touchstart', (e) => {
        e.preventDefault();
        resetGame();
    });
}

// Inicializar el juego cuando se carga la página
window.addEventListener('load', () => {
    resizeCanvas();
    setupTouchControls();
    initGame();
});

// Redimensionar canvas cuando cambia el tamaño de la ventana
window.addEventListener('resize', () => {
    resizeCanvas();
    if (gameState === 'playing') {
        createEnemies();
    }
});
