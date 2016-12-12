function Color(r, g, b) {
    this.r = r;
    this.g = g;
    this.b = b;
}

Color.fromHex = function (hex) {
    if (hex.substr(0, 1) === '#') {
        hex = hex.substr(1);
    }

    var r = parseInt(hex.substr(0, 2), 16);
    var g = parseInt(hex.substr(2, 2), 16);
    var b = parseInt(hex.substr(4, 2), 16);

    return new Color(r, g, b);
};

Color.prototype.add = function (color) {
    this.r += color.r;
    this.g += color.g;
    this.b += color.b;

    return this;
};

Color.prototype.clone = function () {
    return new Color(this.r, this.g, this.b);
};

Color.prototype.toHex = function() {
    var toHex = function (num) {
        var hex = Math.round(num).toString(16);
        return hex.length === 1 ? '0' + hex : hex;
    };

    return '#' + toHex(this.r) + toHex(this.g) + toHex(this.b);
};

Color.prototype.tween = function (c2, value) {
    var c = this.clone();

    var stepColor = {
        r: (c2.r - c.r) * value,
        g: (c2.g - c.g) * value,
        b: (c2.b - c.b) * value
    };

    return c.add(stepColor);
};

Color.prototype.pulsar = function (c2, duration) {
    var c = this.clone();

    var framerate = 1000 / 30;
    var steps = duration / framerate;
    var stepColor = {
        r: (c2.r - c.r) / steps,
        g: (c2.g - c.g) / steps,
        b: (c2.b - c.b) / steps
    };

    return function (next, done) {
        var i = null;
        var j = 0;

        var step = function () {
            if (++j > steps) {
                clearInterval(i);
                if (done) {
                    done();
                }
            } else {
                next(c.add(stepColor));
            }
        };

        i = setInterval(step, framerate);
    };
};
