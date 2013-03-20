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



function voronoi(x, y) {
    var px = Math.floor(x);
    var py = Math.floor(y);

    var fx = x - Math.floor(x);
    var fy = y - Math.floor(y);

    var res = 8.0;
    for (var j = -1; j <= 1; j++) {
        for (var i = -1; i <= 1; i++) {
            var rx = i - fx + random((i + px) + (j + py) * 100);
            var ry = j - fy + random((i + px) + (j + py) * 1000);

            res = Math.min(res, rx * rx + ry * ry);
        }
    }
    return Math.sqrt(res);
}

function voronoiPoints(points, x, y) {
    var px = Math.floor(x);
    var py = Math.floor(y);

    var fx = x - Math.floor(x);
    var fy = y - Math.floor(y);

    var res = 8.0;
    for (var i = 0; i < points.length; i++) {
        var rx = x - points[i].x;
        var ry = y - points[i].y;


        res = Math.min(res, euclidean2(rx, ry));
    }
    return Math.sqrt(res);
}


function drawVoronoi(image, points, scale, user) {
    var offset = Math.random() * 100;

    var data = [];
    var max = 0.0,
        min = 1e9;
    for (var j = 0; j < image.height; j++) {
        for (var i = 0; i < image.width; i++) {
            if (user) {
                var temp = voronoiPoints(points, i * scale, j * scale);
            } else {
                var temp = voronoi(i * scale + offset, j * scale + offset);
            }
            if (temp < min) {
                min = temp;
            }
            if (temp > max) {
                max = temp;
            }
            data[image.width * j + i] = temp;
        }
    }

    var pixels = image.data;
    for (var i = 0; i < image.width * image.height; i++) {
        var val = ((data[i] - min) / max) * 255 & 0xff;
        pixels[i * 4] = val;
        pixels[i * 4 + 1] = val;
        pixels[i * 4 + 2] = val;
        pixels[i * 4 + 3] = 255;
    }
}

$(document).ready(function () {
    var points = [];
    var canvas = document.getElementById("voronoi");
    var ctx = canvas.getContext("2d");
    var imageData = ctx.createImageData(canvas.width, canvas.height);
    var scale = 1 / 64;

    drawVoronoi(imageData, points, scale);
    ctx.putImageData(imageData, 0, 0);
});

$(document).ready(function () {
    var points = [];
    var canvas = document.getElementById("voronoipoints");
    var ctx = canvas.getContext("2d");
    ctx.font = "bold 16px Arial";
    ctx.textalign = "center";
    ctx.fillText("CLICK HERE", canvas.width/2, canvas.height/2);

    $(canvas).click(function (e) {
        var imageData = ctx.createImageData(canvas.width, canvas.height);

        var scale = 1 / 64;
        var p = {};
        p.x = e.offsetX * scale;
        p.y = e.offsetY * scale;
        points.push(p);
        drawVoronoi(imageData, points, scale, 1);
        ctx.putImageData(imageData, 0, 0);

        ctx.fillStyle = "#00FF00";
        for (var i = 0; i < points.length; i++) {
            ctx.arc(points[i].x / scale, points[i].y / scale, 2, 0, 2 * Math.PI);
            ctx.fill();
        }
    });

});