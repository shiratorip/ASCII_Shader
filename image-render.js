function draw() {
    var file = document.getElementById("file").files[0];
    var canvas = document.createElement("canvas");
    canvas.id = "image_canvas";
    document.body.appendChild(canvas);
    var ctx = canvas.getContext("2d");

    var canvas2 = document.createElement("canvas");
    canvas2.id = "image_canvas2";
    canvas2.style.background = "#fff";
    document.body.appendChild(canvas2);
    var ctx2 = canvas.getContext("2d");

    var img = document.createElement('img');
    img.src = URL.createObjectURL(file);

    img.onload = function () {
        canvas.width = img.width;
        canvas.height = img.height;
        canvas2.width = img.width;
        canvas2.height = img.height;
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        for (let y = 0; y < img.height; y += charHeight) {
            for (let x = 0; x < img.width; x += charWidth) {
                // Get the pixel data for this character cell
                const width = Math.min(charWidth, img.width - x);
                const height = Math.min(charHeight, img.height - y);
                const imgData = ctx.getImageData(x, y, width, height);

                // Calculate average brightness
                let totalBrightness = 0;
                let pixelCount = 0;

                for (let i = 0; i < imgData.data.length; i += 4) {
                    const r = imgData.data[i];
                    const g = imgData.data[i + 1];
                    const b = imgData.data[i + 2];
                    pixelCount++;

                }

                const avgBrightness = totalBrightness / pixelCount;

                const charIndex = Math.floor((avgBrightness / 255) * (chars.length - 1));
                const char = chars[chars.length - 1 - charIndex];
                ctx2.fillStyle = `hsla(${r},${g}%,${b}%, ${avgBrightness})`;

                ctx2.fillText(char, x, y);
            }
        }
    };


}