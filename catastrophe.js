$(document).ready(function () {
    function Point(position) {
        this.pos = new Vector(position);
        this.constraints = [];

        this.update = function(dt) {

            for (var i = 0; i < this.constraints.length; i++) {
                this.constraints[i](this);
            }
        };

        this.render = function(ctx) {
            ctx.save()
            ctx.beginPath();
            ctx.strokeStyle = "#00FF00";
            ctx.arc(this.pos.x(), this.pos.y(), 1, 0, 2 * Math.PI);
            ctx.stroke();
            ctx.closePath();
            ctx.restore();
        };
    }

    function Bond(a, b) {
        this.a = a;
        this.b = b;
        this.len = 0;

        this.getPotential = function () {
            // assume k = 2 to make the potential eq U = x^2
            var temp = this.a.pos.distance(b.pos) - this.len;
            return temp * temp;
        };

        this.update = function (dt) {
            return
        };

        this.render = function (ctx) {
            ctx.save();

            ctx.beginPath();
            ctx.strokeStyle = "#0055BB";
            ctx.moveTo(this.a.pos.x(), this.a.pos.y());
            ctx.lineTo(this.b.pos.x(), this.b.pos.y());
            ctx.stroke();
            ctx.closePath();

            ctx.restore();
        };
    }

    function Disk(position, radius) {
        this.pos = new Vector(position);
        this.radius = new Vector(radius);

        this.getPotentialAngle = function (angle) {
            var start = this.radius.angle2d();
            this.radius.setAngle(angle);
            diskPoint.update(1);
            var temp = bond.getPotential()+bond2.getPotential();
            this.radius.setAngle(start);
            return temp;
        }

        this.fullCycle = function () {
            var steps = 60;
            var stepsize = 2 * Math.PI / steps;
            var val = bond.getPotential()+bond2.getPotential();
            var mini = 0
            for (var i = 0; i < steps; i++) {
                this.radius.irotate2d(stepsize);
                diskPoint.update(1);
                var temp = bond.getPotential()+bond2.getPotential()
                if (temp < val) {
                    mini = i;
                    val = temp;
                }
            }
            this.radius.irotate2d(mini*stepsize);
        }


        this.partialCycle = function () {
            var steps = 360;
            var stepsize = 2 * Math.PI / steps;
            var start = this.radius.angle2d();

            var temp = this.getPotentialAngle(start+stepsize);
            var temp2 = this.getPotentialAngle(start-stepsize);


            if (temp > temp2) {
                stepsize = -stepsize;
                temp = temp2;
            }

            for (var i = 2; i < steps; i++) {
                var temp2 = this.getPotentialAngle(start+stepsize*i);
                if (temp2 > temp) {

                    break;
                }
            }
            this.radius.setAngle(start+stepsize*(i-1));
        }

        this.update = function (dt) {
            // disk.radius.irotate2d(Math.PI/8);
            // this.fullCycle();
            this.partialCycle();
        }

        this.render = function (ctx) {
            ctx.save();

            ctx.fillStyle = "#555555";
            ctx.strokeStyle = "#AAAAAA";

            ctx.beginPath();
            ctx.arc(this.pos.x(), this.pos.y(), this.radius.magnitude(), 0, 2 * Math.PI);
            ctx.fill();
            ctx.closePath();

            ctx.beginPath();
            ctx.moveTo(this.pos.x(), this.pos.y());
            var top = this.pos.add(this.radius);
            ctx.lineTo(top.x(), top.y());
            ctx.stroke();
            ctx.closePath();

            ctx.restore();
        }
    }

    function renderAll(ctx) {
        ctx.save();
        ctx.setTransform(1,0,0,1,0,0);
        ctx.fillStyle = "#222222";
        ctx.fillRect(0,0,canvas.width, canvas.height);
        ctx.restore();


        // var gradient = []
        // iterations = 40;
        // for (var i=0; i < iterations; i++) {
        //     gradient[i] = i;
        //     gradient[2*iterations-i-1] = i
        // }

        // for (var i=0; i < canvas.width/10; i++) {
        //     for (var j=0; j <= canvas.height/10; j++) {
        //         var cvec = new Vector(canvas.width/2, canvas.height/2);
        //         var svec = new Vector(4, -4)
        //         var pos = new Vector(i*10, j*10).sub(cvec).div(svec);

        //         bottomPoint.pos = pos;
        //         var minangle = 0;
        //         var temp = 1000000000000;
        //         for (var k=0; k < iterations*2; k++) {
        //             var temp2 = disk.getPotentialAngle(Math.PI/iterations * k);
        //             if (temp2 < temp) {
        //                 temp = temp2;
        //                 minangle = k;
        //             } else if (minangle != 0) {
        //                 break;
        //             }
        //         }

        //         var c = gradient[minangle] * Math.floor(255/iterations);
        //         ctx.fillStyle = "RGB(" + c + "," + c + "," + c + ")"
        //         ctx.fillRect(pos.x(),pos.y(),10/4, 10/4);
        //     }
        // }

        for (var i = 0; i < objects.length; i++) {
            objects[i].update(1);
        }
        for (var i = 0; i < objects.length; i++) {
            objects[i].render(ctx);
        }
    }
     function getLocalPos(e, canvas) {
        var p = getPos(e, canvas);
        p.x = Math.max(Math.min(canvas.width, p.x), 0);
        p.y = Math.max(Math.min(canvas.height, p.y), 0);
        var cvec = new Vector(canvas.width/2, canvas.height/2);
        var svec = new Vector(4, -4)
        return new Vector(p.x, p.y).sub(cvec).div(svec);
     }

    var canvas = document.getElementById("catastrophe");
    var ctx = canvas.getContext("2d");

    // set coord system
    ctx.translate(canvas.width/2, canvas.height/2);
    ctx.scale(4, -4);

    var topPoint = new Point(new Vector(0, 40));
    var disk = new Disk(new Vector(0, 20), new Vector(0, 5));
    var diskPoint = new Point(new Vector(0, 20));
    diskPoint.constraints.push(function (point) {
        point.pos.comp = disk.pos.add(disk.radius).comp;
    });
    var bottomPoint = new Point(new Vector(0, -60));

    var bond = new Bond(topPoint, diskPoint);
    var bond2 = new Bond(diskPoint, bottomPoint);

    var objects = [topPoint, disk, diskPoint, bottomPoint, bond, bond2];

    var dragging = false;

    renderAll(ctx);

    $(canvas).mousedown(function(e) {
        var temp = getLocalPos(e, canvas);
        if (bottomPoint.pos.distance2(temp) <= 9) {
            dragging = true;
        }

    });

    $(document).mousemove(function (e) {
        if (dragging) {
            var temp = getLocalPos(e, canvas);
            bottomPoint.pos = temp
            renderAll(ctx);
        }
    });

    $(canvas).mouseup(function(e) {
        // var p = getPos(e, canvas);
        // if (startpos.x == p.x && startpos.y == p.y) {
        //     var p = getPos(e, canvas);
        //     points.push(new Point([p.x, p.y]));
        //     tree.addPoint(points[points.length-1]);
        // }
        dragging = false;
        // renderAll(ctx);
    });
    $(document).mouseup(function() {
        if (dragging) {
            dragging = false;
            renderAll(ctx);
        }
    });

});

