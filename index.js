// DOM references
const canvasContainer = document.getElementById("canvas_container");
const editorElement = document.getElementById("editor");
const statsElement = document.getElementById("stats");
const colorSlider = document.getElementById("color_slider");
const symbolsInput = document.getElementById("ascii_table");

const canvas = document.createElement("canvas");
const ctx = canvas.getContext("2d");
canvasContainer.appendChild(canvas);
canvas.setAttribute("display","block");
canvasContainer.style.width = '100%';
canvasContainer.style.padding = 0;
canvasContainer.style.margin = '10px';
canvas.style.display = 'block';


// Configuration
let time = 0;
let chars = symbolsInput.value;
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
    // Get the container's width
    const containerWidth = canvasContainer.clientWidth;
    
    // Set canvas size based on container
    canvas.style.boxSizing = 'border-box';
    canvas.style.width = `${containerWidth-20}px`;
    canvas.style.margin = '0';
    
    // Set the actual canvas dimensions
    canvas.width = containerWidth;
    canvas.height = rows * charHeight;

    // Set up the canvas for text rendering
    ctx.font = `${charHeight}px monospace`;
    ctx.textBaseline = "top";

    if (!animationRunning) {
        renderFrameStatic();
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

function setColor(pixelValue) {
    ctx.fillStyle = `hsla(${color[0]},${color[1]}%,${color[2]}%, ${pixelValue})`;
}

function renderFrame() {
    time +=frameInterval/1000;
    renderFrameStatic();
}

function renderFrameStatic() {
    const shaderFunc = getShaderFunction();

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
                setColor(pixelValue);
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

    document.getElementById("ascii_table").value = chars;
    if (!animationRunning) {
        renderFrameStatic();
    }
}

//change setColor implementation depending on the checkbox value
function randomizeColor() {
    console.log(document.getElementById("color_randomizer").checked)
    if(document.getElementById("color_randomizer").checked){
        setColor = function (pixelValue) {
            let value = Math.min(10, Math.floor(pixelValue * 9 + 1));
            let hue = color[0]-(36*value);
            if (hue < 0) hue +=360;
            ctx.fillStyle = `hsla(${hue},${color[1]}%,${color[2]}%, ${pixelValue})`;

        }
    }else{
        setColor = function (pixelValue) {
            ctx.fillStyle = `hsla(${color[0]},${color[1]}%,${color[2]}%, ${pixelValue})`;
        }
    }
    if (!animationRunning) {
        renderFrameStatic();
    }

}


function changeColor() {
    color[0] = colorSlider.value;
    document.getElementById("color_icon").style.backgroundColor = `hsla(${color[0]}, ${color[1]}%, ${color[2]}%,1)`;
    if (!animationRunning) {
        renderFrameStatic();
    }
}

resizeCanvas();

colorSlider.addEventListener("input", changeColor);
symbolsInput.addEventListener("input", () => {
    chars = symbolsInput.value;
    if (chars.length === 0) {
        chars = "?·-+*#@$░▒▓█";
    }
    if (!animationRunning) {
        renderFrameStatic();
    }
})
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