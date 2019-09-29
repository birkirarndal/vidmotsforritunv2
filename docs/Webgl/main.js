"use strict";

let squareRotation = 0.0;

main();


function main() {
  const canvas = document.querySelector('#glcanvas');
  const gl = canvas.getContext('webgl');

  // gáir hvort að webgl virkar 
  if (!gl) {
    alert('Unable to initialize WebGL. Your browser or machine may not support it.');
    return;
  }

  // Vertex shader program

  const vsSource = `
    attribute vec4 aVertexPosition;
    attribute vec4 aVertexColor;

    uniform mat4 uModelViewMatrix;
    uniform mat4 uProjectionMatrix;

    varying lowp vec4 vColor;

    void main(void) {
      gl_Position = uProjectionMatrix * uModelViewMatrix * aVertexPosition;
      vColor = aVertexColor;
    }
  `;
  
  // Fragment shader program

  const fsSource = `
    varying lowp vec4 vColor;

    void main(void) {
      gl_FragColor = vColor;
    }
  `;

  
  const shaderProgram = initShaderProgram(gl, vsSource, fsSource);

  // sækir allt info sem þarf til að nota shader program-ið
  // og gáir hvaða attributes shader program-ið er að nota og uniform staðsetningar
  const programInfo = {
    program: shaderProgram,
    attribLocations: {
      vertexPosition: gl.getAttribLocation(shaderProgram, 'aVertexPosition'),
      vertexColor: gl.getAttribLocation(shaderProgram, 'aVertexColor'),
    },
    uniformLocations: {
      projectionMatrix: gl.getUniformLocation(shaderProgram, 'uProjectionMatrix'),
      modelViewMatrix: gl.getUniformLocation(shaderProgram, 'uModelViewMatrix'),
    },
  };

  // Here's where we call the routine that builds all the
  // objects we'll be drawing.
  const buffers = initBuffers(gl);

  let then = 0;

  // teiknar senuna 
  function render(now) {
    now *= 0.001;  // breytir í sekúndur
    const deltaTime = now - then;
    then = now;

    drawScene(gl, programInfo, buffers, deltaTime);

    requestAnimationFrame(render);
  }
  requestAnimationFrame(render);
}

// búa til buffers
function initBuffers(gl) {

  // búa til buffer fyrir staðsetningu á kassanum
  const positionBuffer = gl.createBuffer();

  // velur positionBuffer til að gera buffer aðgerðir á
  gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);

  // array með staðsetningu á kassanum.
  const positions = [
     1.0,  1.0,
    -1.0,  1.0,
     1.0, -1.0,
    -1.0, -1.0,
  ];

  // skilar listanum með staðsetningum á kassa inn í Webgl til að búa til formið
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW);


  const colors = [
    1.0,  1.0,  1.0,  1.0,    // hvítur
    1.0,  0.0,  0.0,  1.0,    // rauður
    0.0,  1.0,  0.0,  1.0,    // græn
    0.0,  0.0,  1.0,  1.0,    // blár
  ];

  // býr til buffer með litum
  const colorBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(colors), gl.STATIC_DRAW);

  return {
    position: positionBuffer,
    color: colorBuffer,
  };
}

// teiknar senuna
function drawScene(gl, programInfo, buffers, deltaTime) {
  gl.clearColor(0.0, 0.0, 0.0, 1.0);  // gerir allt svart
  gl.clearDepth(1.0);                 // hreinsar allt
  gl.enable(gl.DEPTH_TEST);           // kveikir á depth testing
  gl.depthFunc(gl.LEQUAL);            // lætur hluti sem eru nær gera hluti sem eru fjær óskýra

  // hreinsar canvasinn
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

  // býr til perspective matrix sem er notaður til að herma eftir röskun á sjónarhorni í myndavélum
  // sjónarhornið er 45 gráður með breidd/hæð hlutfall sem passar við stærð á canvas-inum.
  // það er bara sýnt hluti milli 0.1 og 100 eininga fjarðlægð frá myndavélinni
  const fieldOfView = 45 * Math.PI / 180;   // í radíönum
  const aspect = gl.canvas.clientWidth / gl.canvas.clientHeight;
  const zNear = 0.1;
  const zFar = 100.0;
  const projectionMatrix = mat4.create();

  
  mat4.perspective(projectionMatrix,
                   fieldOfView,
                   aspect,
                   zNear,
                   zFar);

  // setur drawing staðsetninguna til indentity point sem er miðjan á senunni
  const modelViewMatrix = mat4.create();

  // færir drawing staðsetninguna til þar sem maður vill teikna
  mat4.translate(modelViewMatrix,     // áfangastaður matrix
                 modelViewMatrix,     // matrix til að translate-a
                 [-0.0, 0.0, -6.0]);  // magn til að translate-a
  mat4.rotate(modelViewMatrix,  // áfangastaður matrix
              modelViewMatrix,  // matrix til að snúa
              squareRotation,   // magn til að snúa í radíönum
              [0, 0, 1]);       // ásar til snúa um

  // segir Webgl hvernig á að taka staðsetningar úr staðsetninga bufferinum og setja þá inn í vertexPosition attribute
  {
    const numComponents = 2; // tekur út 2 gildi á endurtekningu
    const type = gl.FLOAT; // gögninn í buffernum eru 32 bita float tölur
    const normalize = false;
    const stride = 0; // hversu marga bita þarf til fara frá einu sett af gildum til næsta
    const offset = 0; // hversu marga bita inn í buffer til að byrja á
    gl.bindBuffer(gl.ARRAY_BUFFER, buffers.position);
    gl.vertexAttribPointer(
        programInfo.attribLocations.vertexPosition,
        numComponents,
        type,
        normalize,
        stride,
        offset);
    gl.enableVertexAttribArray(
        programInfo.attribLocations.vertexPosition);
  }

  // segir Webgl hvernig á að taka liti úr lita bufferinum og setja þá inn í vertexColor attribute
  {
    const numComponents = 4;
    const type = gl.FLOAT;
    const normalize = false;
    const stride = 0;
    const offset = 0;
    gl.bindBuffer(gl.ARRAY_BUFFER, buffers.color);
    gl.vertexAttribPointer(
        programInfo.attribLocations.vertexColor,
        numComponents,
        type,
        normalize,
        stride,
        offset);
    gl.enableVertexAttribArray(
        programInfo.attribLocations.vertexColor);
  }

  // segir Webgl að nota forritið þegar verið er að teikna

  gl.useProgram(programInfo.program);

  // stillir shader uniforms

  gl.uniformMatrix4fv(
      programInfo.uniformLocations.projectionMatrix,
      false,
      projectionMatrix);
  gl.uniformMatrix4fv(
      programInfo.uniformLocations.modelViewMatrix,
      false,
      modelViewMatrix);

  {
    const offset = 0;
    const vertexCount = 4;
    gl.drawArrays(gl.TRIANGLE_STRIP, offset, vertexCount);
  }

  // uppfærir snúninginn fyrir næstu teikningu

  squareRotation += deltaTime;
}


// Býr til shader programið þannig að Webgl veit hvernig það á að teikna gögninn
function initShaderProgram(gl, vsSource, fsSource) {
  const vertexShader = loadShader(gl, gl.VERTEX_SHADER, vsSource);
  const fragmentShader = loadShader(gl, gl.FRAGMENT_SHADER, fsSource);

  // býr til shader program

  const shaderProgram = gl.createProgram();
  gl.attachShader(shaderProgram, vertexShader);
  gl.attachShader(shaderProgram, fragmentShader);
  gl.linkProgram(shaderProgram);

  // ef forritið nær ekki að búa til shader program lætur það vita með alert
  if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
    alert('Unable to initialize the shader program: ' + gl.getProgramInfoLog(shaderProgram));
    return null;
  }

  return shaderProgram;
}

// Býr til shader af gefni tegund og uploadar source-inn og compile-ar það
function loadShader(gl, type, source) {
  const shader = gl.createShader(type);

  // Sendir source-inn til shader objectinn

  gl.shaderSource(shader, source);

  // Compile-ar shader programið

  gl.compileShader(shader);

  // ef forritið nær ekki að compile-a lætur það vita með alert

  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    alert('An error occurred compiling the shaders: ' + gl.getShaderInfoLog(shader));
    gl.deleteShader(shader);
    return null;
  }

  return shader;
}
