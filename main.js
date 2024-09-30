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

// Vertex shader program
const vertexShaderSource = `
attribute vec2 position;
void main() {
  gl_Position = vec4(position, 0.0, 1.0);
}`;

// Fragment shader program
const fragmentShaderSource = `
void main() {
  gl_FragColor = vec4(1.0, 0.0, 0.0, 1.0); // Red color
}`;

// Compile and link shaders
function compileShader(source, type) {
  const shader = gl.createShader(type);
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  return shader;
}
const vertexShader = compileShader(vertexShaderSource, gl.VERTEX_SHADER);
const fragmentShader = compileShader(fragmentShaderSource, gl.FRAGMENT_SHADER);
const program = gl.createProgram();
gl.attachShader(program, vertexShader);
gl.attachShader(program, fragmentShader);
gl.linkProgram(program);
gl.useProgram(program);

// 2. Generate circle vertices
function drawCircle(x, y, r) {
  function generateCircleVertices(cx, cy, radius, segments) {
    const vertices = [cx, cy]; // Center of the circle
    for (let i = 0; i <= segments; i++) {
      const angle = (i / segments) * 2 * Math.PI;
      vertices.push(cx + radius * Math.cos(angle), cy + radius * Math.sin(angle));
    }
    return new Float32Array(vertices);
  }

  const segments = 100; // The more segments, the smoother the circle
  const vertices = generateCircleVertices(x, y, r, segments);

  // 3. Create buffer and draw
  const positionBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);

  const positionLocation = gl.getAttribLocation(program, 'position');
  gl.enableVertexAttribArray(positionLocation);
  gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);

  // Clear and draw the circle
  gl.clearColor(0.0, 0.0, 0.0, 1.0);

  gl.clear(gl.COLOR_BUFFER_BIT);
  gl.drawArrays(gl.TRIANGLE_FAN, 0, vertices.length / 2);
}

drawCircle();

function pause(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

let dx = 0.005,
  x = 0,
  y = 0;
while (true) {
  drawCircle(x, y, 0.1);
  x += dx;
  y = Math.sin(x * 5) * 0.3;
  if (x > 1.5) x = -1.5;
  await pause(10);
}
