const canvas = document.getElementById("ascii_canvas")
let starttime = Date.now()
let chars = "?·-+*#@$░▒▓█";
let animationRunning = null;
renderFrame()


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

function distance(x,y,x2,y2){
    return (Math.sqrt(Math.pow(Math.abs(x-x2),2)+Math.pow(Math.abs(y-y2),2)));
}
function distance(x,y,argument){

    switch(argument){
        case "center":
            return 0;
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
function RandomizeTable(){
    let newchars ='';
    for (let i =1 ; i < 10; i++) {
        newchars+=String.fromCharCode(Math.random()*128);
    }
    chars = newchars;

}
function animate() {
    renderFrame();
    animationRunning = requestAnimationFrame(animate);
}