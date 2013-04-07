$(document).ready(function () {
    function BoundingBox(center, radius) {
        this.center = new Vector(center); // vec
        this.radius = new Vector(radius); // vec

        this.minval = this.center.sub(this.radius);
        this.maxval = this.center.add(this.radius);
        this.start = this.center.copy();
        this.style = "RGBA(0,0,0,0)";

        this.update = function (coord) {
            var val = new Vector(coord);
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
            ctx.save();
            ctx.fillStyle = this.style;
            ctx.fillRect(this.minval.x(), this.minval.y(), this.radius.mul(2).x(), this.radius.mul(2).y())
            ctx.strokeRect(this.minval.x(), this.minval.y(), this.radius.mul(2).x(), this.radius.mul(2).y());
            ctx.restore();
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

        this.removePoint = function (point) {
            return this.removeCoord(point.coord);
        }

        this.removeCoord = function (coord) {
            if (!this.bounds.contains(coord)) {
                return False;
            }
            if (this.points.length) {
                for (var i=0; i<this.points.length; i++) {
                    var point = this.points[i];
                    if (point.coord.eq(coord)) {
                        this.points.remove(point);
                        this.merge();
                        return true;
                    }
                }
            }
            if (this.children) {
                for (var i=0; i<this.children.length; i++) {
                    if (this.children[i].removeCoord(coord)) {
                        return true;
                    }
                }
            }
            return false;
        };

        this._merge = function () {
            if (!this.children) {
                return true;
            }
            var points = [];
            for (var i=0; i<this.children.length; i++) {
                var quad = this.children[i];
                // children must be reduced
                if (quad.children) return false;
                if (quad.points.length) {
                    points.push.apply(points, quad.points);
                }
            }
            // max amount of points is 1 when not the base
            if (points.length > 1) {
                return false;
            } else if (points.length === 1) {
                this.points = points;
                this.points[0].quad = this;
                for (var i=0; i<this.children.length; i++) {
                    // this.children[i].delete();
                }
                this.children = null;
            } else {
                this.points = [];
            }
            return true;
        }

        this.merge = function () {
            var parent = this.parent;
            var good = true;
            while (parent && good) {
                good = parent._merge();
                parent = parent.parent;
            }
        };

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

        this.query = function (box) {
            var quads = [];
            if (this.bounds.intersects(box)) {
                if (this.children) {
                    for (var i=0; i<this.children.length; i++) {
                        var a = this.children[i].query(box);
                        if (a.length) {
                            quads.push.apply(quads, a);
                        }
                    }
                } else {
                    if (this.points.length) {
                        quads.push(this);
                    }
                }
            }
            return quads;
        };

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


    var dragging = false;
    var selection = null;
    var startpos = null;

    var points = [];
    var canvas = document.getElementById("quadtree");
    var ctx = canvas.getContext("2d");
    writeString(canvas, "CLICK HERE");
    var a = new Vector(canvas.width/2, canvas.height/2);
    bounds = new BoundingBox(a, a.copy());
    tree = new Quadtree(bounds);

    function renderAll(ctx) {
        ctx.save();
        ctx.clearRect(0,0,canvas.width,canvas.height);
        tree.render(ctx);
        for (var i = 0; i < points.length; i++) {
            ctx.beginPath();
            if (selection && selection.contains(points[i].coord)) {
                ctx.fillStyle = "#00FF00";
            } else {
                ctx.fillStyle = "#FF0000";
            }
            ctx.arc(points[i].coord.x(), points[i].coord.y(), 1, 0, 2 * Math.PI);
            ctx.fill();
        }
        if (dragging) {
            ctx.save();
            ctx.strokeStyle = "#FFFFFF";
            selection.render(ctx);
            ctx.restore();
        }
        ctx.restore();
    }

    $(canvas).mousedown(function(e) {
        dragging = true;
        startpos = getPos(e, canvas);
        selection = new BoundingBox([startpos.x, startpos.y], [0, 0]);
    });

    $(document).mousemove(function (e) {
        if (dragging) {
            var p = getPos(e, canvas);
            p.x = Math.max(Math.min(canvas.width, p.x), 0);
            p.y = Math.max(Math.min(canvas.height, p.y), 0);

            selection.update([p.x, p.y]);
            var a = tree.query(selection);
            for (var i=0; i<a.length;i++) {
                a[i].bounds.style = "RGBA(150,150,150,20)";
            }
            renderAll(ctx);
            for (var i=0; i<a.length;i++) {
                a[i].bounds.style = "RGBA(0,0,0,0)";
            }
        }
    });

    $(canvas).mouseup(function(e) {
        var p = getPos(e, canvas);
        if (startpos.x == p.x && startpos.y == p.y) {
            var p = getPos(e, canvas);
            points.push(new Point([p.x, p.y]));
            tree.addPoint(points[points.length-1]);
        }
        dragging = false;
        renderAll(ctx);
    });
    $(document).mouseup(function() {
        if (dragging) {
            dragging = false;
            renderAll(ctx);
        }
    });

    $(canvas).keydown(function (e) {
        if (e.keyCode == 65 && selection) {
            var quads = tree.query(selection);
            var staging = [];
            for (var i=0; i<quads.length; i++) {
                for (var j=0; j<quads[i].points.length; j++) {
                    var p = quads[i].points[j];
                    if (selection.contains(p.coord)) {
                        staging.push(p);
                    }
                }
            }
            // separate so that points are not skipped when deleting
            for (var i=0; i<staging.length;i++) {
                staging[i].quad.removePoint(staging[i])
                points.remove(staging[i])
            }
            renderAll(ctx);
        }
    });
});