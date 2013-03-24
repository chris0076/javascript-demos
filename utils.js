function random(seed) {
    var x = Math.sin(seed) * 23443.23;
    return x - Math.floor(x);
}

function euclidean2(dx, dy) {
    return dx * dx + dy * dy;
}
function euclidean(dx, dy) {
    return Math.sqrt(euclidean2(dx, dy));
}
function manhattan(dx, dy) {
    return Math.abs(dx) + Math.abs(dy);
}
function chebychev(dx, dy) {
    return Math.max(Math.abs(dx), Math.abs(dy));
}

function lerp(a,b,x) { return a + x * (b-a);}

function setPixelVal(image, x, y, val) {
    idx = image.width*y + x;
    image.data[idx * 4] = val;
    image.data[idx * 4 + 1] = val;
    image.data[idx * 4 + 2] = val;
    image.data[idx * 4 + 3] = 255;
}

function getPos(event, canvas) {
    return {
        x: event.pageX - canvas.offsetLeft,
        y: event.pageY - canvas.offsetTop
    };
}

function writeString(canvas, string) {
    var ctx = canvas.getContext("2d");
    ctx.save();
    ctx.font = "bold 16px Arial";
    ctx.textalign = "center";
    ctx.fillText(string, canvas.width/2 - ctx.measureText(string).width/2, canvas.height/2);
    ctx.restore();
}