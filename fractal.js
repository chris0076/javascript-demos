function drawChaos(image, points) {

    var p = points[0];
    for (var i = 0; i < 100; i++) {
        j = Math.floor(Math.random() * 3);
        var x = Math.floor(Math.abs(points[j].x+p.x)/2);
        var y = Math.floor(Math.abs(points[j].y+p.y)/2);
        setPixelVal(image, x, y, 255);
        p = {x: x, y: y };
    }
}

$(document).ready(function () {
    var canvas = document.getElementById("chaostheory");
    var ctx = canvas.getContext("2d");
    writeString(canvas, "CLICK HERE");
    var imageData = ctx.createImageData(canvas.width, canvas.height);

    var points = [];
    $(canvas).click(function (e) {
        var p = getPos(e, canvas);
        ctx.clearRect(0, 0 , canvas.width, canvas.height);
        points.push(p);

        ctx.fillStyle = "#00FF00";
        for (var i = 0; i < points.length; i++) {
            ctx.beginPath();
            ctx.arc(points[i].x, points[i].y, 2, 0, 2 * Math.PI);
            ctx.fill();
        }
    });

    $(canvas).hover(function (e) {
        iid = setInterval(function() {
            if (points.length >= 3) {
                drawChaos(imageData, points);
                ctx.putImageData(imageData, 0, 0);
            }}, 5)},
        function() { (iid && clearInterval(iid)); }
    );

    $(canvas).keydown(function (e) {
        if (e.keyCode == 65) {
            points = [];
            ctx.clearRect(0, 0 , canvas.width, canvas.height);
            imageData = ctx.createImageData(canvas.width, canvas.height);
        }
    });

});

