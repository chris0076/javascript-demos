function Circle(center, radius) {
    this.center = new Vector(center);
    this.radius = radius;

    this.intersect = function (ray) {
        var f = ray.start.sub(this.center);

        var a = ray.direction.dot(ray.direction);
        var b = 2*f.dot(ray.direction);
        var c = f.dot(f) - this.radius * this.radius;
        var discriminant = b*b - 4*a*c;
        if (discriminant < 0) {
            return Infinity;
        }
        discriminant = Math.sqrt(discriminant);
        var t1 = (-b - discriminant) / (2 * a);
        var t2 = (-b + discriminant) / (2 * a);
        if (t1 < 0 && t2 < 0) {
            return -Infinity;
        }
        if (t1 < 0) return t2-0.005;        // FLOOOOOAAAATTTTSSS!
        else if (t2 < 0) return t1-0.005;   // FLOOOOOAAAATTTTSSS!
        return Math.min(t1, t2)-0.005;      // FLOOOOOAAAATTTTSSS!
    };

    this.normal = function (coord) {
        return coord.sub(this.center).normalized();
    };

    this.render = function (ctx) {
        ctx.save();
        ctx.strokeStyle = "#00FF00";
        ctx.moveTo(this.center.x(), this.center.y());
        ctx.beginPath();
        ctx.arc(this.center.x(), this.center.y(), this.radius, 0, 2 * Math.PI);
        ctx.stroke();
        ctx.restore();
    };
}

function LineSeg(start, end) {
    this.start = start;
    this.end = end;
    this.direction = this.end.sub(this.start).normalized(); // assume lines can not move
    this.length = this.start.distance(this.end);            // assume lines can not move
    this.n = this.direction.rotate2d(Math.PI/2);            // assume lines can not move

    this.normal = function (coord) {
        return this.n;
    };

    this.intersect = function (ray) {
        var m0 = ray.direction;
        var m1 = this.direction;
        var temp = m0.cross2d(m1);
        if (Math.abs(temp) - 0.00005 < 0) {
            return Infinity;
        }
        var temp2 = ray.start.sub(this.start);
        var x0 = m1.cross2d(temp2)/temp;
        if (x0 < 0) {
            return -Infinity;
        }
        var x1 = m0.cross2d(temp2.negate())/-temp/this.length;
        if (x1 < 0 || x1 > 1) {
            return Infinity;
        }
        return x0-0.05; // FLOOOOOAAAATTTTSSS!
    };

    this.render = function (ctx) {
        ctx.save();
        ctx.strokeStyle = "#00FF00";
        ctx.beginPath();
        ctx.moveTo(this.start.x(), this.start.y());
        ctx.lineTo(this.end.x(), this.end.y());
        ctx.stroke();
        ctx.restore();
    };
}


function propogateRay(ray, objects, maxbounces, intensity) {
    var points = [];
    var dist;
    var idx;
    var temp;
    do {
        dist = Infinity;
        idx = 0;
        points.push(ray.start.comp);
        for (var i = 0; i < objects.length; i++) {
            temp = objects[i].intersect(ray);
            if ((temp < dist) && (temp > 0)) {
                dist = temp;
                idx = i;
            }
        }
        if (dist < Infinity) {
            intensity = 1/(dist)*intensity;
            ray = ray.reflect(objects[idx], dist);
        }
    } while (dist > 0 && dist != Infinity && points.length < maxbounces + 2 && intensity > .01);
    if (points.length < maxbounces + 2 && intensity > 1) {
        points.push(ray.start.add(ray.direction.mul(1000)).comp);
    }
    return points;
}

function Ray(start, direction) {
    this.start = new Vector(start);
    this.direction = new Vector(direction).normalized();

    this.end = function (length) {
        return this.start.add(this.direction.mul(length));
    };

    this.reflect = function (other, t) {
        var intersection = this.start.add(this.direction.mul(t));
        var temp = other.normal(intersection);
        var dir = this.direction.sub(temp.mul(2).mul(temp.dot(this.direction)));
        return new Ray(intersection, dir);
    };
}


function drawLine(image, array, start, end, intensity) {
    var x0 = start[0]|0;
    var y0 = start[1]|0;
    var x1 = end[0]|0;
    var y1 = end[1]|0;
    var dx = Math.abs(x1-x0)|0;
    var dy = Math.abs(y1-y0)|0;
    if (dx === 0 && dy === 0) return intensity;
    var sx;
    var sy;
    if (x0 < x1) {
        sx = 1;
    } else {
        sx = -1;
    }
    if (y0 < y1) {
        sy = 1;
    } else {
        sy = -1;
    }

    var length = dx*dx + dy*dy;
    var err = dx - dy;
    var pdx = 0;
    var pdy = 0;
    var temp;
    var temp = intensity;
    while (true) {
        if (pdx || pdy) {
            temp = (1/(Math.abs(pdx)+Math.abs(pdy)) * intensity);
        }

        if ((x0 < 0) || y0 < 0 || x0 >= image.width || y0 >= image.height) break;
        array[image.width*y0 + x0] += temp;
        if (temp < .01) break;
        if ((x0 === x1) && (y0 === y1)) break;
        var e2 = 2*err;
        if (e2 > -dy) {
            err -= dy;
            x0 += sx;
            pdx += sx;
        }
        if (e2 < dx) {
            err += dx;
            y0 += sy;
            pdy += sy;
        }
    }
    return 1/(Math.abs(pdx)+Math.abs(pdy))*intensity;
}

function sampleLight (image, array, samples, objects, maxbounces) {
    for (var i = 0; i < samples; i++) {
        var intensity = 100000;
        var angle = Math.random()*2*Math.PI;
        var ray = new Ray(new Vector(image.width/2, image.height/2), new Vector(Math.cos(angle), Math.sin(angle)));

        var points = propogateRay(ray, objects, maxbounces, intensity);
        for (var j = 1; j < points.length; j++) {
            intensity = drawLine(image, array, points[j-1], points[j], intensity);
            if (intensity < .01) break;
            if (intensity === Infinity)
                console.log("???");
        }
    }
}

function drawIt(image, array) {
    for (var i=0; i < array.length; i++) {
        var val = Math.pow(array[i], 1.0 / 2.2);
        setPixelVal(image, i, null, val);
    }
}


$(document).ready(function () {
    var canvas = document.getElementById("light2");
    var ctx = canvas.getContext("2d");
    var imageData = ctx.createImageData(canvas.width, canvas.height);
    writeString(canvas, "Hover");

    var lines = [
        new LineSeg(new Vector(400, 100), new Vector(100, 100)),
        new LineSeg(new Vector(100, 100), new Vector(100, 400)),
        new LineSeg(new Vector(100, 400), new Vector(400, 400)),
        new Circle(new Vector(400, 200), 50),
        new Circle(new Vector(100, 300), 50),
    ];

    var array = []

    for (var i = 0; i < canvas.width*canvas.height; i++) {
        array.push(0);
    }

    var totalrays = 0;
    var totalrayselement = $("#totalrays");
    totalrayselement.text(totalrays);
    var maxbounces = 50;
    var totaltime = 0;
    var start = null;
    var rayspersecondelement = $("#rayspersecond");
    rayspersecondelement.text(0);
    $(canvas).hover(
        function (e) {
            start = new Date().getTime();
            iid = setInterval(
                function() {
                    sampleLight(imageData, array, 100, lines, maxbounces);
                    totalrays += 100;
                },
                0);
        },
        function() {
            (iid && clearInterval(iid));
            totaltime += new Date().getTime() - start;
            start = null;
        }
    );

    $(canvas).click(function (e) {
        drawIt(imageData, array);
        ctx.putImageData(imageData, 0, 0);
        totalrayselement.text(totalrays);
        totaltime += new Date().getTime() - start;
        start = new Date().getTime();
        rayspersecondelement.text(Math.floor(totalrays/totaltime*1000));

    });
});

$(document).ready(function () {
    var canvas = document.getElementById("light");
    var ctx = canvas.getContext("2d");
    writeString(canvas, "Hover");
    ctx.fillStyle = "#222222";

    var maxbounces = 50;
    var maxbounceelement = $("#maxbounces");
    maxbounceelement.change(function () { maxbounces = parseInt(maxbounceelement.val()); });

    var drawtype = 'line';
    var drawtypeelement = $("input[name=drawtype]");
    drawtypeelement.click(function () { drawtype = $('input[name=drawtype]:checked').val(); });

    var lines = [
        new LineSeg(new Vector(400, 100), new Vector(100, 100)),
        new LineSeg(new Vector(100, 100), new Vector(100, 400)),
        new LineSeg(new Vector(100, 400), new Vector(400, 400)),
        new Circle(new Vector(400, 200), 50),
        new Circle(new Vector(100, 300), 50),
    ];

    var center = new Vector(canvas.width/2, canvas.height/2);
    $(canvas).mousemove(function (e) {
        var p = getPos(e, canvas);
        var pvec = new Vector(p.x, p.y);
        var ray = new Ray(center, pvec.sub(center));
        var points = propogateRay(ray, lines, maxbounces, Infinity);

        ctx.fillRect(0,0,canvas.width, canvas.height);
        ctx.beginPath();
        ctx.strokeStyle = '#FFFFFF';
        ctx.moveTo(points[0][0], points[0][1]);
        for (var i = 1; i < points.length; i++) {
            ctx.lineTo(points[i][0], points[i][1]);
        }
        ctx.stroke();

        for (var i=0; i < lines.length; i++) {
            lines[i].render(ctx);
        }
    });

    var start = null;
    $(canvas).click(function (e) {
        var p = getPos(e, canvas);
        var pvec = new Vector(p.x, p.y);
        if (start) {
            switch (drawtype) {
                case "line":
                    lines.push(new LineSeg(start, pvec));
                    break;
                case "circle":
                    lines.push(new Circle(start, start.sub(pvec).magnitude()));
                    break;
            }
            lines[lines.length-1].render(ctx);
            start = null;
        } else {
            start = pvec;
        }
    });
});