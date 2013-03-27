$(document).ready(function () {
    function Planet(px, py, vx, vy, m, r, color) {
        this.m = m;
        this.r = r;
        this.color = color;

        this.px = px;
        this.py = py;

        this.vx = vx;
        this.vy = vy;

        this.points = []

        this.update = function (bodies, dt) {
            // F = G * m1 * m2 / r^2;
            // F/m = a
            this.points.push([this.px, this.py]);

            var ax = 0;
            var ay = 0;
            for (var i=0; i<bodies.length;i++) {
                body = bodies[i];

                var dx = body.px-this.px;
                var dy = body.py-this.py;

                var mag2 = Math.pow(dx, 2) + Math.pow(dy, 2);
                var mag = Math.sqrt(mag2);
                var temp = 500*body.m*this.m/mag2;
                ax += temp*dx;
                ay += temp*dy;
            }

            this.px += this.vx * dt;
            this.vx += ax * dt / this.m;

            this.py += this.vy * dt;
            this.vy += ay * dt / this.m;
        };
        this.render = function (ctx) {
            ctx.save();
            ctx.lineWidth = .5;
            ctx.beginPath();
            ctx.moveTo(this.points[0][0], this.points[0][1]);
            for (var i=1; i<this.points.length; i++) {
                ctx.lineTo(this.points[i][0], this.points[i][1]);
            }
            ctx.stroke();

            ctx.beginPath();
            ctx.fillStyle = this.color;
            ctx.arc(this.px, this.py, this.r, 0, 2 * Math.PI);
            ctx.fill();
            ctx.restore();
        }
    }

    var canvas = document.getElementById("euler");
    var ctx = canvas.getContext("2d");


    var planet = new Planet(canvas.width/4, canvas.height/2, 0, 450,   1, 1, "#00FF66");
    var sun    = new Planet(canvas.width/2, canvas.height/2, 0,   0, 500, 5, "#FFBB00");

    $(canvas).hover(function (e) {
        iid = setInterval(function() {
            ctx.clearRect(0,0,canvas.width, canvas.height);
            planet.update([sun], .01);
            sun.update([planet], .01);
            planet.render(ctx);
            sun.render(ctx);
        }, 16)},
        function() { (iid && clearInterval(iid)); }
    );
});