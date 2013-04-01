function Vector(comp) {
    if (comp instanceof Vector) {
        this.comp = comp.comp;
    } else if ($.isArray(comp)) {
        this.comp = comp;
    } else {
        this.comp = [].slice.call(arguments);
    }

    this.toString = function () {

        return "Vector("+this.comp.join(", ")+")";
    }

    this.distance2 = function (other) {
        var sum = 0.0;
        var m = Math.max(this.comp.length, other.comp.length)
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
        var m = Math.max(this.comp.length, other.comp.length)
        for (var i = 0; i < m; i++) {
            var x = this.comp[i]*other.comp[i];
            sum += isNaN(x) ? 0 : x;
        }
        return sum;
    };

    this.cross = function (other) {
        var temp = [];
        temp.push(this.comp[1] * other.comp[2] - this.comp[2] * other.comp[1]);
        temp.push(this.comp[2] * other.comp[0] - this.comp[0] * other.comp[2]);
        temp.push(this.comp[0] * other.comp[1] - this.comp[1] * other.comp[0]);
        return new Vector(temp);
    };

    this.magnitude2 = function () {
        return this.dot(this);
    };

    this.magnitude = function () {
        return Math.sqrt(this.magnitude2());
    };

    this.normalize = function () {
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

    this.rotate2d = function (theta) {
        var ct = Math.cos(theta);
        var st = Math.sin(theta);
        var x = this.comp[0];
        var y = this.comp[1];
        var c0 = ct*x - st*y;
        var c1 = st*x + ct*y;
        return new Vector([c0, c1]);
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
        var temp = []
        for (var i = 0; i < this.comp.length; i++) {
            temp.push(f(this.comp[i]));
        }
        return new Vector(temp);
    };

    this.map2 = function (f, other) {
        var single = false;
        var temp = [];
        try {
            var m = Math.max(this.comp.length, other.comp.length);
        } catch  (err) {
            single = true;
            var m = this.comp.length;
        }
        for (var i = 0; i < m; i++) {
            var x = this.comp[i] ? this.comp[i] : 0;
            if (single) {
                y = other;
            } else {
                var y = other.comp[i] ? other.comp[i] : 0;
            }
            temp.push(f(x, y));
        }
        return new Vector(temp);
    };

    this.add    = function (other) { return this.map2( function (x, y) { return x + y; }, other )};
    this.iadd   = function (other) { this.comp = this.add(other).comp; };
    this.sub    = function (other) { return this.map2( function (x, y) { return x - y; }, other )};
    this.isub   = function (other) { this.comp = this.sub(other).comp; };
    this.mul    = function (other) { return this.map2( function (x, y) { return x * y; }, other )};
    this.imul   = function (other) { this.comp = this.mul(other).comp; };
    this.div    = function (other) { return this.map2( function (x, y) { return x / y; }, other )};
    this.idiv   = function (other) { this.comp = this.div(other).comp; };

    this.negate = function ()   { return this.map( function (x) { return -x; }) };
    this.abs    = function ()   { return this.map( Math.abs ); };
    this.pow    = function (n)  { return this.map( function (x) { return Math.pow(x, n); } )};
    this.floor  = function ()   { return this.map( Math.floor ) };
    this.round  = function ()   { return this.map( Math.round ) };
    this.ceil   = function ()   { return this.map( Math.ceil ) };
    this.fract  = function ()   { return this.map( function (x) { return x - Math.floor(x); } )};

    this.copy   = function ()   { return new Vector(this); };
}
