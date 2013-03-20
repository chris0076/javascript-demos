function insideMandelbrot(x, y) {
    var p = p = Math.sqrt((Math.pow(x - .25, 2) + y*y));
    return (x < p - Math.pow(2.0 * p, 2) + .25) || (Math.pow(x + 1.0, 2) + (y*y) < 0.0625);
}

function mandelbrot(cr, ci, iterations, smooth) {
    var count = 0;
    var zr = 0.0;
    var zi = 0.0;
    if (insideMandelbrot(cr, ci)) {
        count = iterations;
    }
    while ((count < iterations) && ((zr * zr + zi *zi) < 4.0 )) {
        var temp = zr * zr - zi * zi + cr;
        zi = 2 * zr * zi + ci;
        zr = temp;
        count++;
    }
    if (!smooth)
        return count;
    var colorindex = 0;
    if (count < iterations) {
        var mu = (Math.log(Math.log((zr*zr + zi*zi)))) / Math.log(2.0);
        colorindex = Math.floor((count - mu) * iterations / smooth);
        if (colorindex < 0) colorindex = 0;
        return colorindex % (iterations*2);
    }
    return colorindex;
}

function mandelbrotPath(cr, ci, iterations, optimize) {
    var zr = 0.0, zi = 0.0;
    var count = 0;

    points = []

    if ((mandelbrot(cr, ci, iterations, 0) == iterations) && optimize) {
        return [];
    }

    for (;count < iterations;count++) {
        if ((zr*zr + zi*zi) <= 4.0) {
            var temp = zr * zr - zi * zi + cr;
            zi = 2 * zr * zi + ci;
            zr = temp;
            points.push([zr, zi]);
        } else {
            break;
        }
    }

    return points;
}

function lerp(a,b,x) { return a + x * (b-a);}

function sampleBuddhbrot(image, array, iterations, samples) {
    var minx = -2.0;
    var maxx = 1.0;
    var miny = -1.0;
    var maxy = 1.0;

    var pitchx = (maxx - minx) / image.width;
    var pitchy = (maxy - miny) / image.height;

    for (var i = 0; i < samples; i++) {
        x = lerp(minx, maxx, Math.random());
        y = lerp(miny, maxy, Math.random());
        var points = mandelbrotPath(x, y, iterations, 1);

        for (var j = 0; j < points.length; j++) {
            vx = Math.floor((points[j][0] - minx) / pitchx);
            vy = Math.floor((points[j][1] - miny) / pitchy);


            if ((vx >= 0) && (vy >= 0) && (vx < image.width) && (vy < image.height)) {
                array[image.width*vy + vx] += 1;
            }
        }
    }
    return array
}

function drawBuddhabrot(image, array) {
    var pixels = image.data;
    var min = Infinity;
    var max = 0;

    for (var i = 0; i<array.length; i++) {
        if (array[i] < min) { min = array[i]; }
        if (array[i] > max) { max = array[i]; }
    }

    for (var i=0; i < array.length; i++) {
        var val = ((array[i] - min) / max) * 255;
        pixels[i * 4] = val;
        pixels[i * 4 + 1] = val;
        pixels[i * 4 + 2] = val;
        pixels[i * 4 + 3] = 255;
    }
}

function drawMandelbrot(image, iterations, smooth) {

    var pixels = image.data;
    var minx = -2.0;
    var maxx = 1.0;
    var miny = -1.0;
    var maxy = 1.0;

    var pitchx = (maxx - minx) / image.width;
    var pitchy = (maxy - miny) / image.height;

    for (var i = 0; i < image.width; i++) {
        for (var j = 0; j < image.height; j++) {
            var val = mandelbrot(i*pitchx+minx, j*pitchy+miny, iterations, smooth) / iterations * 255;
            var idx = image.width * j + i;
            pixels[idx * 4] = val;
            pixels[idx * 4 + 1] = val;
            pixels[idx * 4 + 2] = val;
            pixels[idx * 4 + 3] = 255;
        }
    }
}

$(document).ready(function () {
    var points = [];
    var canvas = document.getElementById("mandelbrot");
    var ctx = canvas.getContext("2d");
    var imageData = ctx.createImageData(canvas.width, canvas.height);

    ctx.font = "bold 16px Arial";
    ctx.textalign = "center";
    ctx.fillText("CLICK HERE", 300, 200);

    var itervals = [1, 2, 3, 4, 5, 10, 15, 20, 30, 40, 50, 100, 150, 200, 255];
    var num = 0;

    $(canvas).click(function (e) {
        iterations = itervals[num];
        drawMandelbrot(imageData, iterations);
        ctx.putImageData(imageData, 0, 0);
        num = (num + 1) % itervals.length;
    });
});

$(document).ready(function () {
    var points = [];
    var canvas = document.getElementById("mandelbrotsmooth");
    var ctx = canvas.getContext("2d");
    var imageData = ctx.createImageData(canvas.width, canvas.height);

    var iterations = 5;
    drawMandelbrot(imageData, 255, 10);
    ctx.putImageData(imageData, 0, 0);
});

$(document).ready(function () {
    var points = [];
    var canvas = document.getElementById("mandelbrotpath");
    var ctx = canvas.getContext("2d");
    var imageData = ctx.createImageData(canvas.width, canvas.height);
    var iterations = 255
    drawMandelbrot(imageData, iterations, 0);
    ctx.putImageData(imageData, 0, 0);

    $(canvas).mousemove(function (e) {
        ctx.putImageData(imageData, 0, 0);

        var minx = -2.0;
        var maxx = 1.0;
        var miny = -1.0;
        var maxy = 1.0;
        var pitchx = (maxx - minx) / canvas.width;
        var pitchy = (maxy - miny) / canvas.height;
        points = mandelbrotPath(e.offsetX*pitchx+minx, e.offsetY*pitchy+miny, iterations);

        if (points.length == iterations) {
            ctx.strokeStyle = "#FF0000";
        } else {
            ctx.strokeStyle = "#00FF00";
        }
        ctx.beginPath();
        if (points.length) {
            ctx.moveTo((points[0][0]-minx)/pitchx, (points[0][1]-miny)/pitchy);
            for (var i = 1; i < points.length; i++) {
                ctx.lineTo((points[i][0]-minx)/pitchx, (points[i][1]-miny)/pitchy);
            }
            ctx.stroke();
        }
    });

});

$(document).ready(function () {
    var points = [];
    var canvas = document.getElementById("buddhabrot");
    var ctx = canvas.getContext("2d");
    var imageData = ctx.createImageData(canvas.width, canvas.height);

    ctx.font = "bold 16px Arial";
    ctx.textalign = "center";
    ctx.fillText("CLICK HERE", 300, 200);


    var iterations = 255;
    var array = []
    for (var i = 0; i < canvas.width*canvas.height; i++) {array.push(0); }

    $(canvas).click(function (e) {
        array = sampleBuddhbrot(imageData, array, iterations, 100000);
        drawBuddhabrot(imageData, array);
        ctx.putImageData(imageData, 0, 0);
    });
});