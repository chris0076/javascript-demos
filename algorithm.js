$(document).ready(function () {
    function BoundingBox(center, radius) {
        this.center = new Vector(center); // vec
        this.radius = new Vector(radius); // vec

        this.minval = this.center.sub(this.radius);
        this.maxval = this.center.add(this.radius);
        this.start = this.center.copy();

        this.update = function (coord) {
            var val = new Vector(coord);
            // console.log(this.minval.comp)
            if (val.x() > this.start.x()) {
                this.maxval.x(val.x());
            } else {
                this.minval.x(val.x());
            }

            if (val.y() > this.start.y()) {
                this.maxval.y(val.y());
            } else {
                this.minval.y(val.y());
            }
            this.radius = this.maxval.sub(this.minval).div(2);
            this.center = this.radius.add(this.minval);
        };

        this.contains = function (coord) {
            return (this.minval.le(coord).all() && this.maxval.gt(coord).all());
        };

        this.intersects = function (box) {
            if (this.minval.gt(box.maxval).any()) return false;
            if (this.maxval.lt(box.minval).any()) return false;
            return true;
        };

        this.render = function (ctx) {
            ctx.strokeRect(this.minval.x(), this.minval.y(), this.radius.mul(2).x(), this.radius.mul(2).y());
        };
    };

    function Point(coord) {
        this.coord = new Vector(coord);
        this.quad = null;

    };

    function Quadtree(bounds, parent) {
        this.bounds = bounds;
        this.points = [];
        this.parent = parent;
        this.children = null;
        var log2 = Math.log(2);
        var min = Math.min(this.bounds.radius.x(), this.bounds.radius.y());

        this.depth = Math.floor(Math.log(min)/log2) + 1;

        this.addPoint = function (point) {
            if (!this.bounds.contains(point.coord)) {

                return false;
            }
            if (this.children === null) {
                if (!this.points.length) {
                    this.points.push(point);
                    point.quad = this;
                    return true;
                }
                if ((this.depth - 1) <= 0) {
                    this.points.push(point);
                    point.quad = this;
                    return true;
                }
                if (!this.subdivide()) return false;
            }
            for (var i=0; i<this.children.length; i++) {
                if (this.children[i].addPoint(point)) return true;
            }
            return false;
        };

        this.addCoord = function (coord) {
            return this.addPoint(new Point(coord));
        };

        // this.removePoint = function (point) {
        //     if (!this.points.length) {
        //         if (this.points.contains(point))
        //     }
        // };

        this.subdivide = function () {
            if ((this.depth - 1) > 0) {
                var half = (this.bounds.radius.div(2));
                var ihalf = new Vector(half.x(), -half.y());
                var nw = this.bounds.center.sub(half);
                var ne = this.bounds.center.add(ihalf);
                var sw = this.bounds.center.sub(ihalf);
                var se = this.bounds.center.add(half);

                this.children = [
                    new Quadtree(new BoundingBox(nw, half), this),
                    new Quadtree(new BoundingBox(ne, half), this),
                    new Quadtree(new BoundingBox(sw, half), this),
                    new Quadtree(new BoundingBox(se, half), this),
                ]
                for (var i=0; i<4; i++) {
                    if (this.children[i].addPoint(this.points[0])) {
                        this.points = [];
                        return true;
                    }
                }
            }
            return true;
        };

        // this._merge = function () {

        // };

        // this.query = function () {

        // };
        this.render = function (ctx) {
            if (this.children != null) {
                for (var i=0; i<4; i++) {
                    this.children[i].render(ctx);
                }
            } else {
                this.bounds.render(ctx);
            }
        };
    };



    var points = [];
    var canvas = document.getElementById("quadtree");
    var ctx = canvas.getContext("2d");
    writeString(canvas, "CLICK HERE");
    var a = new Vector(canvas.width/2, canvas.height/2);
    bounds = new BoundingBox(a, a.copy());
    tree = new Quadtree(bounds);

    $(canvas).click(function (e) {
        ctx.clearRect(0,0,canvas.width,canvas.height);
        var p = getPos(e, canvas);
        points.push(new Point([p.x, p.y]));
        console.log(points);

        ctx.fillStyle = "#00FF00";
        for (var i = 0; i < points.length; i++) {
            ctx.beginPath();
            ctx.arc(points[i].coord.x(), points[i].coord.y(), 1, 0, 2 * Math.PI);
            ctx.fill();
        }
        tree.addPoint(points[points.length-1]);
        tree.render(ctx);
    });

});