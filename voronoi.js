function voronoi(x, y, dist) {
    var px = Math.floor(x);
    var py = Math.floor(y);

    var fx = x - Math.floor(x);
    var fy = y - Math.floor(y);

    var res = 8.0;
    for (var j = -1; j <= 1; j++) {
        for (var i = -1; i <= 1; i++) {
            var rx = i - fx + random((i + px) + (j + py) * 100);
            var ry = j - fy + random((i + px) + (j + py) * 1000);

            res = Math.min(res, dist(rx, ry));
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


function drawVoronoi(image, points, scale, user, dist) {
    var offset = Math.random() * 100;

    var data = [];
    var max = 0.0,
        min = 1e9;
    for (var j = 0; j < image.height; j++) {
        for (var i = 0; i < image.width; i++) {
            if (user) {
                var temp = voronoiPoints(points, i * scale, j * scale);
            } else {
                var temp = voronoi(i * scale + offset, j * scale + offset, dist);
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
        setPixelVal(image, i, null, ((data[i] - min) / max) * 255 & 0xff);
    }
}

$(document).ready(function () {
    var points = [];
    var canvas = document.getElementById("voronoi");
    var ctx = canvas.getContext("2d");
    var imageData = ctx.createImageData(canvas.width, canvas.height);
    var scale = 1 / 64;
    var dist = euclidean2;

    drawVoronoi(imageData, points, scale, null, dist);
    ctx.putImageData(imageData, 0, 0);

    $(canvas).click(function () {
        drawVoronoi(imageData, points, scale, null, dist);
        ctx.putImageData(imageData, 0, 0);
    });

    $(canvas).keydown(function(e){
        switch (e.keyCode) {
            case 65: dist = euclidean2; break;
            case 83: dist = euclidean; break;
            case 68: dist = manhattan; break;
            case 70: dist = chebychev; break;
        }
        drawVoronoi(imageData, points, scale, null, dist);
        ctx.putImageData(imageData, 0, 0);
    });
});

$(document).ready(function () {
    var points = [];
    var canvas = document.getElementById("voronoipoints");
    var ctx = canvas.getContext("2d");
    ctx.font = "bold 16px Arial";
    ctx.textalign = "center";
    var string = "CLICK HERE";
    ctx.fillText(string, canvas.width/2 - ctx.measureText(string ).width/2, canvas.height/2);

    $(canvas).click(function (e) {
        var imageData = ctx.createImageData(canvas.width, canvas.height);

        var scale = 1 / 64;
        var p = getPos(e, canvas);
        p.x *= scale;
        p.y *= scale;
        points.push(p);
        drawVoronoi(imageData, points, scale, 1, euclidean2);
        ctx.putImageData(imageData, 0, 0);

        ctx.fillStyle = "#00FF00";
        for (var i = 0; i < points.length; i++) {
            ctx.arc(points[i].x / scale, points[i].y / scale, 2, 0, 2 * Math.PI);
            ctx.fill();
        }
    });

});