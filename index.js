// DOM references
const canvasContainer = document.getElementById("canvas_container");
const editorElement = document.getElementById("editor");
const statsElement = document.getElementById("stats");


const canvas = document.createElement("canvas");
const ctx = canvas.getContext("2d");
canvasContainer.appendChild(canvas);

// Configuration
let startTime = Date.now();
let chars = "?·-+*#@$░▒▓█";
let animationRunning = null;
let cachedShaderFunc = null;
let lastShaderCode = "";

// Canvas size and character dimensions
const charWidth = 12;
const charHeight = 16;
const cols = 60;
const rows = 30;




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
    const time = (Date.now() - startTime) / 1000;

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
                ctx.fillStyle = `rgba(191, 147, 27, ${pixelValue})`;

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
        cancelAnimationFrame(animationRunning);
        animationRunning = null;
    } else {
        animate();
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

// Animation frame loop
function animate() {
    renderFrame();
    animationRunning = requestAnimationFrame(animate);
}

//event listener for shader code changes
editorElement.addEventListener('input', () => {
    cachedShaderFunc = null;
});


window.addEventListener('load', () => {
    resizeCanvas();
    renderFrame();
});


// Expose functions to HTML
window.renderFrame = renderFrame;
window.toggleAnimation = toggleAnimation;
window.randomizeTable = randomizeTable;