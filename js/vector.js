function Vector(comp) {
    'use strict';
    if (comp instanceof Vector) {
        this.comp = comp.comp;
    } else if ($.isArray(comp)) {
        this.comp = comp;
    } else {
        this.comp = [].slice.call(arguments);
    }

    this.toString = function () {

        return "Vector(" + this.comp.join(", ") + ")";
    };

    this.getset = function (idx, val) {
        if (val) {
            this.comp[idx] = val;
        } else {
            return this.comp[idx];
        }
    };

    this.x = function (val) { return this.getset(0, val); };
    this.y = function (val) { return this.getset(1, val); };
    this.z = function (val) { return this.getset(2, val); };


    this.distance2 = function (other) {
        var sum = 0.0;
        var m = Math.max(this.comp.length, other.comp.length);
        for (var i = 0; i < m; i++) {
            sum += Math.pow(this.comp[i] - other.comp[i], 2);
        }
        return sum;
    };

    this.distance = function (other) {
        return Math.sqrt(this.distance2(other));
    };

    this.dot = function (other) {
        var sum = 0.0;
        var m = Math.max(this.comp.length, other.comp.length);
        for (var i = 0; i < m; i++) {
            var x = this.comp[i]*other.comp[i];
            sum += isNaN(x) ? 0 : x;
        }
        return sum;
    };

    this.cross = function (other) {
        var temp = [];
        var a = this.comp;
        var b = other.comp;
        temp.push(a[1] * b[2] - a[2] * b[1]);
        temp.push(a[2] * b[0] - a[0] * b[2]);
        temp.push(a[0] * b[1] - a[1] * b[0]);
        return new Vector(temp);
    };

    this.cross2d = function (other) {
        var a = this.comp;
        var b = other.comp;
        return a[0] * b[1] - a[1] * b[0];
    }

    this.magnitude2 = function () {
        return this.dot(this);
    };

    this.magnitude = function () {
        return Math.sqrt(this.magnitude2());
    };

    this.normalized = function () {
        return this.div(this.magnitude());
    };

    this.angleVec = function (other) {
        var x = this.dot(other);
        var a = this.magnitude();
        var b = other.magnitude();
        var y = x / (a * b);
        return Math.acos(y);
    };

    this.angle2d = function () {
        return Math.atan2(this.comp[1], this.comp[0]);
    };

    this.setAngle = function (theta) {
        var ct = Math.cos(theta);
        var st = Math.sin(theta);
        this.comp = new Vector(ct, st).mul(this.magnitude()).comp;
        return this;
    }

    this.rotate2d = function (theta) {
        var ct = Math.cos(theta);
        var st = Math.sin(theta);
        var x = this.comp[0];
        var y = this.comp[1];
        var c0 = ct*x - st*y;
        var c1 = st*x + ct*y;
        return new Vector([c0, c1]);
    };

    this.irotate2d = function (theta) {
        this.comp = this.rotate2d(theta).comp
        return this;
    };

    this.rotate3d = function (theta, phi, psi) {
        var ct = Math.cos(theta);
        var st = Math.sin(theta);
        var ch = Math.cos(phi);
        var sh = Math.sin(phi);
        var cs = Math.cos(psi);
        var ss = Math.sin(psi);

        var x = this.comp[0];
        var y = this.comp[1];
        var z = this.comp[2];

        var c0 = ct*cs*x + (-ch*ss+sh*st*ss)*y + (sh*ss+ch*st*cs)*z;
        var c1 = ct*ss*x + (ch*cs+sh*st*ss)*y + (-sh*cs+ch*st*ss)*z;
        var c2 = (-st)*x + (sh*ct)*y + (ch*ct)*z;
        return new Vector([c0, c1, c2]);
    };

    this.map = function (f) {
        var temp = [];
        for (var i = 0; i < this.comp.length; i++) {
            temp.push(f(this.comp[i]));
        }
        return new Vector(temp);
    };

    this.map2 = function (f, other) {
        var single = false;
        var temp = [];
        var m;
        if (other.comp) {
            m = Math.max(this.comp.length, other.comp.length);
        }
        else {
            single = true;
            m = this.comp.length;
        }

        var x, y;
        for (var i = 0; i < m; i++) {
            x = this.comp[i] ? this.comp[i] : 0;
            if (single) {
                y = other;
            } else {
                y = other.comp[i] ? other.comp[i] : 0;
            }
            temp.push(f(x, y));
        }
        return new Vector(temp);
    };

    this.add    = function (other) { return this.map2( function (x, y) { return x + y; }, other ); };
    this.iadd   = function (other) { this.comp = this.add(other).comp; return this; };
    this.sub    = function (other) { return this.map2( function (x, y) { return x - y; }, other ); };
    this.isub   = function (other) { this.comp = this.sub(other).comp; return this; };
    this.mul    = function (other) { return this.map2( function (x, y) { return x * y; }, other ); };
    this.imul   = function (other) { this.comp = this.mul(other).comp; return this; };
    this.div    = function (other) { return this.map2( function (x, y) { return x / y; }, other ); };
    this.idiv   = function (other) { this.comp = this.div(other).comp; return this; };

    this.eq     = function (other) { return this.map2( function (x, y) { return x === y; }, other ); };
    this.ne     = function (other) { return this.map2( function (x, y) { return x !== y; }, other ); };
    this.lt     = function (other) { return this.map2( function (x, y) { return x < y; }, other ); };
    this.gt     = function (other) { return this.map2( function (x, y) { return x > y; }, other ); };
    this.le     = function (other) { return this.map2( function (x, y) { return x <= y; }, other ); };
    this.ge     = function (other) { return this.map2( function (x, y) { return x >= y; }, other ); };

    this.all    = function () {
        for (var i = 0; i < this.comp.length; i++) {
            if (!this.comp[i]) {
                return false;
            }
        }
        return true;
    };

    this.any    = function () {
        for (var i = 0; i < this.comp.length; i++) {
            if (this.comp[i]) {
                return true;
            }
        }
        return false;
    };

    this.negate = function ()   { return this.map( function (x) { return -x; }); };
    this.abs    = function ()   { return this.map( Math.abs ); };
    this.pow    = function (n)  { return this.map( function (x) { return Math.pow(x, n); } ); };
    this.floor  = function ()   { return this.map( Math.floor ); };
    this.round  = function ()   { return this.map( Math.round ); };
    this.ceil   = function ()   { return this.map( Math.ceil ); };
    this.fract  = function ()   { return this.map( function (x) { return x - Math.floor(x); } ); };

    this.copy   = function ()   { return new Vector(this); };
}
