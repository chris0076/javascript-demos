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
        var temp = zr * zr - zi * zi + cr;
        zi = 2 * zr * zi + ci;
        zr = temp;
        temp = zr * zr - zi * zi + cr;
        zi = 2 * zr * zi + ci;
        zr = temp;
        count += 2;
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
    var min = Infinity;
    var max = 0;

    for (var i = 0; i<array.length; i++) {
        if (array[i] < min) { min = array[i]; }
        if (array[i] > max) { max = array[i]; }
    }

    for (var i=0; i < array.length; i++) {
        var val = ((array[i] - min) / max) * 255;
        setPixelVal(image, i, null, val);
    }
}

function drawMandelbrot(image, iterations, smooth, frame) {
    if (!frame) {
        var frame = {"x": -.5, "y": 0, "zoom": 0}
    }
    zoom = Math.pow(2, -frame.zoom)
    var pitchx = zoom * 3 / image.width;
    var pitchy = zoom * 2 / image.height;

    var minx = frame.x - zoom * 3 / 2.;
    var maxx = minx + image.width * pitchx
    var miny = frame.y - zoom;
    var maxy = miny + image.height * pitchy;

    var gradient = []
    for (var i=0; i < iterations; i++) {
        gradient[i] = i;
        gradient[2*iterations-i-1] = i
    }

    for (var i = 0; i < image.width; i++) {
        for (var j = 0; j < image.height; j++) {
            if (smooth) {
                var val = gradient[mandelbrot(i*pitchx+minx, j*pitchy+miny, iterations, smooth)];
            } else {
                var val = mandelbrot(i*pitchx+minx, j*pitchy+miny, iterations, smooth) / iterations * 255;
            }
            setPixelVal(image, i, j, val);
        }
    }
}

function drawMandelbrotPath(image, ctx, iterations, x, y) {
    var minx = -2.0;
    var maxx = 1.0;
    var miny = -1.0;
    var maxy = 1.0;
    var pitchx = (maxx - minx) / image.width;
    var pitchy = (maxy - miny) / image.height;
    points = mandelbrotPath(x*pitchx+minx, y*pitchy+miny, iterations);

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
}

$(document).ready(function () {
    var points = [];
    var canvas = document.getElementById("mandelbrot");
    var ctx = canvas.getContext("2d");
    var imageData = ctx.createImageData(canvas.width, canvas.height);
    var centerx = $("#centerx");
    var centery = $("#centery");
    var zoom = $("#zoom");

    var frame = {
        "x": parseFloat(centerx.val()),
        "y": parseFloat(centery.val()),
        "zoom": parseFloat(zoom.val()),
    }
    drawMandelbrot(imageData, 255, 0, frame);
    ctx.putImageData(imageData, 0, 0);

    function binder(element, variable) {
        fn = function (element, variable) {
            if (parseFloat(element.val()) !== frame[variable]) {
                frame[variable] = parseFloat(element.val());
                drawMandelbrot(imageData, 255, 0, frame);
                ctx.putImageData(imageData, 0, 0);
            }
        };
        element.focusout(function () { fn(element, variable); });
        element.keydown(function (e) {
            if (e.which == 13) fn(element, variable);
        });
    };

    binder(centerx, "x");
    binder(centery, "y");
    binder(zoom, "zoom");

    $(canvas).mousedown(function (e) {
        switch (e.button) {
            case 0: frame.zoom += .5; break; // left click
            case 2: frame.zoom -= .5; break; // right click
        }
        frame.x += (e.offsetX - (imageData.width/2)) * 3 * Math.pow(2,-frame.zoom) / imageData.width;
        frame.y += (e.offsetY - (imageData.height/2)) * 2 * Math.pow(2,-frame.zoom) / imageData.height;
        centerx.val(frame.x);
        centery.val(frame.y);
        zoom.val(frame.zoom);
        drawMandelbrot(imageData, 255, 0, frame);
        ctx.putImageData(imageData, 0, 0);
    });
    $(canvas).bind("contextmenu", function(event) {event.preventDefault();});

    $('coord').click(function () {
        var array = $(this).text().trim().slice(1,-1).split(',');
        frame.x = parseFloat(array[0]);
        frame.y = parseFloat(array[1]);
        frame.zoom = parseFloat(array[2]);
        centerx.val(frame.x);
        centery.val(frame.y);
        zoom.val(frame.zoom);
        drawMandelbrot(imageData, 255, 0, frame);
        ctx.putImageData(imageData, 0, 0);
    });

});

$(document).ready(function () {
    var points = [];
    var canvas = document.getElementById("mandelbrotiteration");
    var ctx = canvas.getContext("2d");
    var imageData = ctx.createImageData(canvas.width, canvas.height);

    drawMandelbrot(imageData, 100, 0);
    ctx.putImageData(imageData, 0, 0);

    $(canvas).mousemove(function (e) {
        drawMandelbrot(imageData, Math.floor(e.offsetX/4), 0);
        ctx.putImageData(imageData, 0, 0);
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

    $(canvas).mousemove(function (e) {
        drawMandelbrot(imageData, 255, Math.floor(e.offsetX/4), 0);
        ctx.putImageData(imageData, 0, 0);
    });
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
        drawMandelbrotPath(imageData, ctx, iterations, e.offsetX, e.offsetY);
    });

});

$(document).ready(function () {
    function make_buddhabrot(id, iterations) {
        var canvas = document.getElementById(id);
        var ctx = canvas.getContext("2d");
        var imageData = ctx.createImageData(canvas.width, canvas.height);

        ctx.font = "bold 16px Arial";
        ctx.textalign = "center";
        ctx.fillText("CLICK HERE", 300, 200);

        var array = []
        for (var i = 0; i < canvas.width*canvas.height; i++) {array.push(0); }

        $(canvas).hover(function (e) {
            iid = setInterval(function() { sampleBuddhbrot(imageData, array, iterations, 10000);}, 0)},
            function() { (iid && clearInterval(iid)); }
        );

        $(canvas).click(function (e) {
            drawBuddhabrot(imageData, array);
            ctx.putImageData(imageData, 0, 0);
        });
        return imageData;
    }

    bluedata = make_buddhabrot("buddhabrot_blue", 50);
    greendata = make_buddhabrot("buddhabrot_green", 500);
    reddata = make_buddhabrot("buddhabrot_red", 5000);


    var canvas = document.getElementById("nebulabrot");
    var ctx = canvas.getContext("2d");
    var imageData = ctx.createImageData(canvas.width, canvas.height);

    ctx.font = "bold 16px Arial";
    ctx.textalign = "center";
    ctx.fillText("CLICK HERE", 300, 200);

    function render() {
        pixels = imageData.data;
        for (var i = 0; i<canvas.width*canvas.height; i++) {
            pixels[4*i  ] = reddata.data[4*i];
            pixels[4*i+1] = greendata.data[4*i+1];
            pixels[4*i+2] = bluedata.data[4*i+2];
            pixels[4*i+3] = 255;
        }
        ctx.putImageData(imageData, 0, 0);
    }

    $(canvas).click(function (e) {
        render();
    });

    $(canvas).keydown(function(e){
        var temp = reddata;
        switch (e.keyCode) {
            case 65:
                reddata = greendata;
                greendata = bluedata;
                bluedata = temp;
                break;
            case 83:
                reddata = greendata;
                greendata = temp;
                break;
        }
        render();
    });
});