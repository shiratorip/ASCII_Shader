// DOM references
const canvasContainer = document.getElementById("canvas_container");
const editorElement = document.getElementById("editor");
const statsElement = document.getElementById("stats");
const colorSlider = document.getElementById("color_slider");

const canvas = document.createElement("canvas");
const ctx = canvas.getContext("2d");
canvasContainer.appendChild(canvas);

// Configuration
let time = 0;
let chars = "?·-+*#@$░▒▓█";
let animationRunning = null;
let cachedShaderFunc = null;
let lastShaderCode = "";
let color = [44, 80, 70];

// FPS Configuration
const targetFPS = 60;
const frameInterval = 1000 / targetFPS;

// Canvas size and character dimensions
const charWidth = 10;
const charHeight = 14;
const cols = 200;
const rows = 50;


function resizeCanvas() {
    canvas.style.boxSizing = 'border-box';
    canvas.style.width = 'calc(100% - 20px)';
    canvas.style.margin = '10px';

    const computedStyle = window.getComputedStyle(canvas);
    const displayWidth = parseInt(computedStyle.width);

    canvas.width = displayWidth;
    canvas.height = rows * charHeight;

    // Set up the canvas for text rendering
    ctx.font = `${charHeight}px monospace`;
    ctx.textBaseline = "top";

    if (!animationRunning) {
        renderFrame();
    }
}

// Get and cache the shader function
function getShaderFunction() {
    const shaderCode = editorElement.value;

    if (cachedShaderFunc === null || shaderCode !== lastShaderCode) {
        try {
            lastShaderCode = shaderCode;
            cachedShaderFunc = new Function('x', 'y', 'time',
                'return (' + shaderCode + ')(x, y, time);');
        } catch (error) {
            console.error("Error in shader code:", error);
            cachedShaderFunc = (x, y, time) => Math.sin(x * 0.1 + time) * Math.cos(y * 0.1 + time) * 0.5 + 0.5;
        }
    }

    return cachedShaderFunc;
}

function renderFrame() {
    const now = performance.now();
    const shaderFunc = getShaderFunction();
    time +=frameInterval/1000;

    // Clear canvas with background color
    ctx.fillStyle = "#1e1f22";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Calculate and render shader values
    for (let y = 0; y < rows; y++) {
        for (let x = 0; x < cols; x++) {
            try {
                const pixelValue = shaderFunc(x, y, time);
                const charIndex = Math.floor(pixelValue * (chars.length - 1));
                const char = chars[charIndex % chars.length];

                // Set color and opacity based on pixel value
                ctx.fillStyle = `hsla(${color[0]},${color[1]}%,${color[2]}%, ${pixelValue})`;

                // Render character
                ctx.fillText(char, x * charWidth, y * charHeight);
            } catch (error) {
                // Show error indicator
                ctx.fillStyle = "red";
                ctx.fillText("X", x * charWidth, y * charHeight);
            }
        }
    }
}

// Toggle animation
function toggleAnimation() {
    if (animationRunning) {
        clearInterval(animationRunning);
        animationRunning = null;
    } else {
        animationRunning = setInterval(renderFrame, frameInterval);
    }
}

// Generate random character set
function randomizeTable() {
    chars = '';
    for (let i = 0; i < 10; i++) {
        chars += String.fromCharCode(Math.floor(Math.random() * (127 - 32 + 1) + 32));
    }

    console.log("New character set:", chars);
    if (!animationRunning) {
        renderFrame();
    }
}

function randomizeColor() {

}


function changeColor() {
    color[0] = colorSlider.value;
    document.getElementById("color_icon").style.backgroundColor = `hsla(${color[0]}, ${color[1]}%, ${color[2]}%,1)`;
}

colorSlider.addEventListener("input", changeColor);

//event listener for shader code changes
editorElement.addEventListener('input', () => {
    cachedShaderFunc = null;
});

window.addEventListener('resize', resizeCanvas);

window.addEventListener('load', () => {
    resizeCanvas();
    renderFrame();
});

changeColor();
// Expose functions to HTML
window.renderFrame = renderFrame;
window.toggleAnimation = toggleAnimation;
window.randomizeTable = randomizeTable;