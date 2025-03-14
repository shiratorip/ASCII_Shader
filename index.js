const canvas = document.getElementById("ascii_canvas")
let starttime = Date.now()
const chars = " ·-+*#@$░▒▓█";
renderFrame()
let animationRunning = null;


function getShaderFunction() {
    // Get the current function from the textarea and evaluate it
    const shaderCode = document.getElementById("editor").value;
    try {
        // Create a new function from the code
        return new Function('x', 'y', 'time',
            'return (' + shaderCode + ')(x, y, time);');
    } catch (error) {
        console.error("Error in shader code:", error);
        return null;
    }
}


function renderFrame() {
    const shaderFunc = getShaderFunction();
    const time = (Date.now() - starttime) / 1000;
    let output = '';
    const width = 60;
    const height = 30;
    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            try {
                const pixelValue = shaderFunc(x, y, time);
                const charIndex = Math.floor(pixelValue * (chars.length - 1));

                output += `<span style="color:#bf931b;opacity:${pixelValue}">${chars[charIndex % chars.length]}</span>`;
            } catch (error) {
                output += '<span style="color:red">X</span>';
            }
        }
        output += '\n';
    }

    canvas.innerHTML = output;
}
function toggleAnimation(){
    if (animationRunning){
        cancelAnimationFrame(animationRunning)
        animationRunning=null;
    }else{
        animate()
    }
}
function animate() {
    renderFrame();
    animationRunning = requestAnimationFrame(animate);
}