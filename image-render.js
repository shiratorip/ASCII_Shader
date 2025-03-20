function draw() {
    //Configuration
    const symHeight = 10;
    const symWidth = 8;
    const width = 1920;
    const height = 1080;
    var proportion = 1.777;

    var file = document.getElementById("file").files[0];
    var canvas = document.createElement("canvas");
    canvas.id = "image_canvas";
    document.body.appendChild(canvas);
    var ctx = canvas.getContext("2d");

    var canvas2 = document.createElement("canvas");
    canvas2.id = "image_canvas2";
    canvas2.style.background = "#fff";
    document.body.appendChild(canvas2);
    var ctx2 = canvas2.getContext("2d");

    var img = document.createElement('img');
    img.src = URL.createObjectURL(file);

    img.onload = function () {
        canvas.width = img.width;
        canvas.height = img.height;
        proportion = canvas.width / canvas.height;
        canvas2.width = width;
        canvas2.height = width/proportion;
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        for (let y = 0; y < img.height; y += symHeight) {
            for (let x = 0; x < img.width; x += symWidth) {
                // Get the pixel data for this character cell
                const width = Math.min(symWidth, img.width - x);
                const height = Math.min(symHeight, img.height - y);
                const imgData = ctx.getImageData(x, y, width, height);

                let pixelCount = 0;
                var r=0,g=0,b=0,a=0;
                for (let i = 0; i < imgData.data.length; i += 4) {
                    r += imgData.data[i];
                    g += imgData.data[i + 1];
                    b += imgData.data[i + 2];
                    a += imgData.data[i + 3];
                    pixelCount++;
                }
                r=Math.round(r/pixelCount);
                g=Math.round(g/pixelCount);
                b=Math.round(b/pixelCount);
                a=Math.round(a/pixelCount);
                let brightness = r*0.21 + 0.72*g + b*0.07;

                const charIndex = Math.floor((brightness / 255) * (chars.length - 1));
                const char = chars[chars.length - 1 - charIndex];
                ctx2.fillStyle = `rgba(${r},${g},${b}, ${a})`;

                ctx2.fillText(char, x, y);
            }
        }
        var button = document.createElement('button');
        download();
    };


}
function download() {
    const canvas2 = document.getElementById('image_canvas2');
    const link = document.createElement('a');
    link.download = 'ascii-art.png';
    link.href = canvas2.toDataURL();
    link.click();
}