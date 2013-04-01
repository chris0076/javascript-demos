function isEqualA(a, b) {
    var x = (a.length == b.length);
    var y = true;

    var m = Math.max(a.length, b.length)
    for (var i = 0; i < m; i++) {
        if (Math.abs(a[i] - b[i]) > .00001) {
            console.log(a[i] - b[i]);
            y = false;
            break;
        }
    }

    if (!x || !y) {
        console.log({
            "x":x,
            "y":y,
            "a":a,
            "b":b,
        });
        console.log('');
    }
}

function isEqual(a, b) {
    if (Math.abs(a - b) > .00001) {
        console.log({
            "a":a,
            "b":b,
        });
        console.log('');
    }
}

function test() {
    var a = new Vector(1,2,3);
    var b = new Vector([2,3]);
    var c = new Vector([.231, 4.24, 6.99]);
    var d = new Vector([-2, -5]);

    console.log("init");
    isEqualA(a.comp, [1, 2, 3]);
    isEqualA(b.comp, [2, 3]);
    isEqualA(c.comp, [.231, 4.24, 6.99]);
    isEqualA(d.comp, [-2, -5]);

    console.log("add");
    isEqualA(a.add(b).comp, [3, 5, 3]);
    isEqualA(a.add(c).comp, [1.231, 6.24, 9.99]);
    isEqualA(a.add(d).comp, [-1, -3, 3]);
    isEqualA(b.add(a).comp, [3, 5, 3]);
    isEqualA(b.add(c).comp, [2.231, 7.24, 6.99]);
    isEqualA(b.add(d).comp, [0, -2]);
    isEqualA(c.add(b).comp, [2.231, 7.24, 6.99]);
    isEqualA(c.add(d).comp, [-1.769, -0.76, 6.99]);
    isEqualA(d.add(c).comp, [-1.769, -0.76, 6.99]);

    console.log("sub");
    isEqualA(a.sub(b).comp, [-1,-1, 3]);
    isEqualA(a.sub(c).comp, [0.769, -2.24, -3.99]);
    isEqualA(a.sub(d).comp, [3, 7, 3]);
    isEqualA(b.sub(a).comp, [1, 1, -3]);
    isEqualA(b.sub(c).comp, [1.769, -1.24, -6.99]);
    isEqualA(b.sub(d).comp, [4, 8]);
    isEqualA(c.sub(b).comp, [-1.769, 1.24, 6.99]);
    isEqualA(c.sub(d).comp, [2.231, 9.24, 6.99]);
    isEqualA(d.sub(c).comp, [-2.231, -9.24, -6.99]);

    console.log("mul");
    isEqualA(a.mul(b).comp, [2, 6, 0]);
    isEqualA(a.mul(c).comp, [0.231, 8.48, 20.97]);
    isEqualA(a.mul(d).comp, [-2, -10, 0]);
    isEqualA(b.mul(a).comp, [2, 6, 0]);
    isEqualA(b.mul(c).comp, [0.462, 12.72, 0.0]);
    isEqualA(b.mul(d).comp, [-4, -15]);
    isEqualA(c.mul(b).comp, [0.462, 12.72, 0.0]);
    isEqualA(c.mul(d).comp, [-0.462, -21.2, 0.0]);
    isEqualA(d.mul(c).comp, [-0.462, -21.2, 0.0]);

    console.log("div");
    isEqualA(a.div(b).comp, [.5, .6666666666, Infinity]);
    isEqualA(a.div(c).comp, [4.329004329, 0.471698113208, 0.429184549356]);
    isEqualA(a.div(d).comp, [-.5, -.4, Infinity]);
    isEqualA(b.div(a).comp, [2, 1.5, 0]);
    isEqualA(b.div(c).comp, [8.65800865801, 0.707547169811, 0.0]);
    isEqualA(b.div(d).comp, [-1, -.6]);
    isEqualA(c.div(b).comp, [0.1155, 1.4133333333333333, Infinity]);
    isEqualA(c.div(d).comp, [-0.1155, -0.848000000000, Infinity]);
    isEqualA(d.div(c).comp, [-8.658008658008658, -1.1792452830188678, 0]);

    console.log("neg");
    isEqualA(a.negate().comp, [-1, -2, -3]);
    isEqualA(b.negate().comp, [-2, -3]);
    isEqualA(c.negate().comp, [-.231, -4.24, -6.99]);
    isEqualA(d.negate().comp, [2, 5]);

    console.log("abs");
    isEqualA(a.abs().comp, [1, 2, 3]);
    isEqualA(b.abs().comp, [2, 3]);
    isEqualA(c.abs().comp, [.231, 4.24, 6.99]);
    isEqualA(d.abs().comp, [2, 5]);

    console.log("pow");
    isEqualA(a.pow(2).comp, [1, 4, 9]);
    isEqualA(b.pow(2).comp, [4, 9]);
    isEqualA(c.pow(2).comp, [0.053361, 17.9776, 48.8601]);
    isEqualA(d.pow(2).comp, [4, 25]);

    console.log("floor");
    isEqualA(a.floor().comp, [1, 2, 3]);
    isEqualA(b.floor().comp, [2, 3]);
    isEqualA(c.floor().comp, [0, 4, 6]);
    isEqualA(d.floor().comp, [-2, -5]);

    console.log("round");
    isEqualA(a.round().comp, [1, 2, 3]);
    isEqualA(b.round().comp, [2, 3]);
    isEqualA(c.round().comp, [0, 4, 7]);
    isEqualA(d.round().comp, [-2, -5]);

    console.log("ceil");
    isEqualA(a.ceil().comp, [1, 2, 3]);
    isEqualA(b.ceil().comp, [2, 3]);
    isEqualA(c.ceil().comp, [1, 5, 7]);
    isEqualA(d.ceil().comp, [-2, -5]);

    console.log("fract");
    isEqualA(a.fract().comp, [0, 0, 0]);
    isEqualA(b.fract().comp, [0, 0]);
    isEqualA(c.fract().comp, [.231, .24, .99]);
    isEqualA(d.fract().comp, [0, 0]);


    console.log("distance2");
    isEqual(a.distance2(b), 11);
    isEqual(a.distance2(c), 21.529061000000002);
    isEqual(a.distance2(d), 67);
    isEqual(b.distance2(a), 11);
    isEqual(b.distance2(c), 53.527061);
    isEqual(b.distance2(d), 80);
    isEqual(c.distance2(b), 53.527061);
    isEqual(c.distance2(d), 139.215061);
    isEqual(d.distance2(c), 139.215061);

    console.log("distance");
    isEqual(a.distance(b), 3.3166247903554);
    isEqual(a.distance(c), 4.63994191773992);
    isEqual(a.distance(d), 8.18535277187245);
    isEqual(b.distance(a), 3.3166247903554);
    isEqual(b.distance(c), 7.316219037180339);
    isEqual(b.distance(d), 8.94427190999916);
    isEqual(c.distance(b), 7.316219037180339);
    isEqual(c.distance(d), 11.798943215390096);
    isEqual(d.distance(c), 11.798943215390096);

    console.log("dot");
    isEqual(a.dot(b), 8);
    isEqual(a.dot(c), 29.680999999999997);
    isEqual(a.dot(d), -12);
    isEqual(b.dot(a), 8);
    isEqual(b.dot(c), 13.182);
    isEqual(b.dot(d), -19);
    isEqual(c.dot(b), 13.182);
    isEqual(c.dot(d), -21.662000000000003);
    isEqual(d.dot(c), -21.662000000000003);

    console.log("cross");
    isEqualA(a.cross(b).comp, [-9, 6, -1]);
    isEqualA(a.cross(c).comp, [1.26, -6.297, 3.778]);
    isEqualA(a.cross(d).comp, [15, -6, -1]);
    isEqualA(b.cross(a).comp, [9, -6, 1]);
    isEqualA(b.cross(c).comp, [20.97, -13.98, 7.787]);
    isEqualA(b.cross(d).comp, [0, 0, -4]);
    isEqualA(c.cross(b).comp, [-20.97, 13.98, -7.787]);
    isEqualA(c.cross(d).comp, [34.95, -13.98, 7.325]);
    isEqualA(d.cross(c).comp, [-34.95, 13.98, -7.325]);

    console.log("magnitude2");
    isEqual(a.magnitude2(), 14);
    isEqual(b.magnitude2(), 13);
    isEqual(c.magnitude2(), 66.89106100000001);
    isEqual(d.magnitude2(), 29);

    console.log("magnitude");
    isEqual(a.magnitude(), 3.7416573867739413);
    isEqual(b.magnitude(), 3.605551275463989);
    isEqual(c.magnitude(), 8.178695556138521);
    isEqual(d.magnitude(), 5.385164807134504);

    console.log("normalize");
    isEqualA(a.normalized().comp, [0.267261241912, 0.534522483825, 0.801783725737]);
    isEqualA(b.normalized().comp, [0.554700196225, 0.832050294338]);
    isEqualA(c.normalized().comp, [0.028244112819, 0.518420079449, 0.85465951777]);
    isEqualA(d.normalized().comp, [-0.371390676354, -0.928476690885]);

    console.log("angleVec");
    isEqual(a.angleVec(b), 0.9360174829018622);
    isEqual(a.angleVec(c), 0.24594433670730093);
    isEqual(a.angleVec(d), 2.2087464625177113);
    isEqual(b.angleVec(a), 0.9360174829018622);
    isEqual(b.angleVec(c), 1.1073667235271059);
    isEqual(b.angleVec(d), 2.934096427154591);
    isEqual(c.angleVec(b), 1.1073667235271059);
    isEqual(c.angleVec(d), 2.084987256614591);
    isEqual(d.angleVec(c), 2.084987256614591);

    console.log("angle2d");
    isEqual(a.angle2d(), 1.1071487177940904);
    isEqual(b.angle2d(), 0.982793723247329);
    isEqual(c.angle2d(), 1.5163690024434457);
    isEqual(d.angle2d(), -1.9513027039072615);

    console.log("rotate2d");
    isEqualA(a.rotate2d(2).comp, [-2.2347416902, 0.0770037537314]);
    isEqualA(b.rotate2d(-1).comp, [3.60501756616, -0.0620350520114]);
    isEqualA(c.rotate2d(21).comp, [-3.6739453665, -2.12910461085]);
    isEqualA(d.rotate2d(4).comp, [-2.47672523481, 4.78182309493]);

    console.log("rotate3d");
    isEqualA(a.rotate3d(2, 2, 2).comp, [5.38651145198, 1.57457492138, -1.14656535343]);
    isEqualA(b.rotate3d(-1, 0, 0).comp, [1.08060461174, 3.0, 1.68294196962]);
    isEqualA(c.rotate3d(21, .4, 2).comp, [-2.00875908598, 5.54666432695, -4.62404120913]);
    isEqualA(d.rotate3d(-3, 5, 6).comp, [1.69388198219, -1.72600122488, -5.02887919974]);
}
test();