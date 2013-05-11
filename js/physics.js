function euler(bodies, dt) {
    var accel = this.accelerate(bodies, dt);
    this.position.iadd(this.velocity.mul(dt));
    this.velocity.iadd(accel.mul(dt / this.m));
    this.points.push(this.position.comp);
}

function symplecticEuler(bodies, dt) {
    var accel = this.accelerate(bodies, dt);
    this.velocity.iadd(accel.mul(dt / this.m));
    this.position.iadd(this.velocity.mul(dt));
    this.points.push(this.position.comp);
}

function verlet(bodies, dt) {
    var a = this.accelerate(bodies, dt);
    var x = this.position.copy();
    var xlast = new Vector(this.points.slice(-1)[0]);
    this.points.push(this.position.comp);
    this.position = x.mul(2).sub(xlast).add(a.mul(dt*dt / this.m));
}

$(document).ready(function () {
    function Planet(position, velocity, m, r, color, update) {
        this.m = m;
        this.r = r;
        this.color = color;
        this.update = update;

        this.position = new Vector(position);
        this.velocity = new Vector(velocity);
        this.points = [this.position.comp];


        this.accelerate = function (bodies, dt) {
            var accel = new Vector(0,0);
            for (var i=0; i<bodies.length;i++) {
                body = bodies[i];
                pos = new Vector(body.points.slice(-1)[0]);
                var dp = pos.sub(this.position);
                var mag2 = dp.magnitude2();
                var temp = 500*body.m*this.m/mag2;
                accel.iadd(dp.mul(temp));
            }
            return accel;
        };

        this.render = function (ctx) {
            ctx.save();
            ctx.lineWidth = 1;
            ctx.strokeStyle = this.color;
            ctx.beginPath();
            var start = this.points.length-255 < 0 ? 0 : this.points.length-255;
            ctx.moveTo(this.points[start][0], this.points[start][1]);
            for (var i=start; i<this.points.length; i++) {

                ctx.lineTo(this.points[i][0], this.points[i][1]);
            }
            ctx.stroke();

            ctx.beginPath();
            ctx.fillStyle = this.color;
            ctx.arc(this.position.comp[0], this.position.comp[1], this.r, 0, 2 * Math.PI);
            ctx.fill();
            ctx.restore();
        }
    }

    var canvas = document.getElementById("euler");
    var ctx = canvas.getContext("2d");

    var dt = .01;
    var pos = [canvas.width/4, canvas.height/2];
    var vel = [70, 600];
    var posSun = [canvas.width/2, canvas.height/2];
    var velSun = [0, 0];

    var planet = new Planet(pos, vel,           1, 1, "#00FF66", euler);
    var sun    = new Planet(posSun, velSun,   750, 5, "#FF6600", euler);

    var planet2 = new Planet(pos, vel,           1, 1, "#007f33", symplecticEuler);
    var sun2    = new Planet(posSun, velSun,   750, 5, "#7f3300", symplecticEuler);

    var planet3 = new Planet(pos, vel,           1, 1, "#FFFFFF", verlet);
    planet3.points[0] = planet3.position.sub(planet3.velocity.mul(dt)).comp;
    var sun3    = new Planet(posSun, velSun,   750, 5, "#401a00", verlet);
    sun3.points[0] = sun3.position.sub(sun3.velocity.mul(dt)).comp;

    $(canvas).hover(function (e) {
        iid = setInterval(function() {
            ctx.fillStyle = "#222222";
            ctx.fillRect(0,0,canvas.width, canvas.height);

            planet.update([sun], dt);
            sun.update([planet], dt);
            planet.render(ctx);
            sun.render(ctx);

            planet2.update([sun2], dt);
            sun2.update([planet2], dt);
            planet2.render(ctx);
            sun2.render(ctx);

            planet3.update([sun3], dt);
            sun3.update([planet3], dt);
            planet3.render(ctx);
            sun3.render(ctx);

        }, 10)},
        function() { (iid && clearInterval(iid)); }
    );
});