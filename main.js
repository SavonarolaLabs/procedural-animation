const canvas = document.getElementById('gameCanvas');
const gl = canvas.getContext('webgl');

// Resize canvas to fill the screen
function resizeCanvas() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  gl.viewport(0, 0, canvas.width, canvas.height);
}

window.addEventListener('resize', resizeCanvas);
resizeCanvas();

// Set clear color to black and clear the canvas
gl.clearColor(0, 0, 0, 1);
gl.clear(gl.COLOR_BUFFER_BIT);

// Add your WebGL setup here
