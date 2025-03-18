// DOM references
const canvasContainer = document.getElementById("canvas_container");
const editorElement = document.getElementById("editor");
const statsElement = document.getElementById("stats");
const colorSlider = document.getElementById("color_slider");

const canvas = document.createElement("canvas");
const ctx = canvas.getContext("2d");
canvasContainer.appendChild(canvas);

// Configuration
let startTime = Date.now();
let chars = "?·-+*#@$░▒▓█";
let animationRunning = null;
let cachedShaderFunc = null;
let lastShaderCode = "";
let color = [44, 80, 85];


// Canvas size and character dimensions
const charWidth = 8;
const charHeight = 12;
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

function randomizeColor() {

}

// Animation frame loop
function animate() {
    renderFrame();
    animationRunning = requestAnimationFrame(animate);
}

function changeColor() {

    let color1 = rgbToHsv(color[0], color[1], color[2]);
    color1[0] = colorSlider.value;
    color = hsvToRgb(color1[0], color1[1], color1[2]);

    document.getElementById("color_icon").style.backgroundColor = `rgb(${color[0]}, ${color[1]}, ${color[2]})`;
}

function rgbToHsv(r, g, b) {
    r = r / 255;
    g = g / 255;
    b = b / 255;
    let minRGB = Math.min(r, g, b);
    let maxRGB = Math.max(r, g, b);
    let delta = maxRGB - minRGB;

    //calculating hue
    let hue;
    if (delta === 0) {
        hue = 0;
    } else if (maxRGB === r) {
        hue = 60 * (((g - b) / delta) % 6)
    } else if (maxRGB === g) {
        hue = 60 * (((b - r) / delta) + 2)
    } else if (maxRGB === b) {
        hue = 60 * (((r - g) / delta) + 4)
    }
    if (hue < 0) {
        hue += 360;
    }

    //calculating saturation
    let saturation;
    if (maxRGB === 0) {
        saturation = 0;
    } else {
        saturation = delta / maxRGB;
    }

    return [hue, saturation, maxRGB];
}

function hsvToRgb(h, s, v) {

    let chroma = v * s;
    let x = chroma * (1 - Math.abs(((h / 60) % 2) - 1));
    let m = v - chroma;
    let r, g, b;

    if (h >= 0 && h < 60) {
        [r, g, b] = [chroma, x, 0];
    } else if (h >= 60 && h < 120) {
        [r, g, b] = [x, chroma, 0];
    } else if (h >= 120 && h < 180) {
        [r, g, b] = [0, chroma, x];
    } else if (h >= 180 && h < 240) {
        [r, g, b] = [0, x, chroma];
    } else if (h >= 240 && h < 300) {
        [r, g, b] = [x, 0, chroma];
    } else {
        [r, g, b] = [chroma, 0, x];
    }

    // Add m to each component and convert to 0-255 range
    r = Math.round((r + m) * 255);
    g = Math.round((g + m) * 255);
    b = Math.round((b + m) * 255);

    return [r, g, b];
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