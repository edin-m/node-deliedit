var stream = require('stream');
var util = require('util');

var Transform = stream.Transform || require('readable-stream').Transform;

function Deliedit(opts) {
    if (!(this instanceof Deliedit)) {
        return new Deliedit(opts);
    }
    opts = opts || {};
    // add start end ref throws

    this.opts = opts;
    if (typeof opts.transform === 'function' && typeof opts.transformFunc === 'undefined') {
        console.warn('opts.transform is deprecated! use opts.transformFunc');
    }
    this.transformFunc = opts.transform || opts.transformFunc || passthrough;
    this.delimiters = opts.delimiters;

    this.refStartAt = 0;
    this.refEndAt = 0;
    this.delimiterStarted = false;
    this.buffer = '';

    Transform.call(this, opts);
}

util.inherits(Deliedit, Transform);

Deliedit.prototype._transform = function (chunk, enc, cb) {
    var data = chunk.toString();

    for (var i = 0; i < data.length; i++) {

        var equalsStartRef = data.charAt(i) === this.delimiters.start.charAt(this.refStartAt);
        var equalsEndRef = data.charAt(i) === this.delimiters.end.charAt(this.refEndAt);

        // --- tracking start delimiter ---
        if (equalsStartRef && !this.delimiterStarted) {
            this.refStartAt++;
            this.buffer += data[i];
        } else {
            this.refStartAt = 0;
        }
        // --- end tracking start delimiter ---

        // --- tracking start delimiter ---
        if (equalsEndRef && this.delimiterStarted) {
            this.refEndAt++;
            this.buffer += data[i];
        } else {
            this.refEndAt = 0;
        }
        // -- end tracking start delimiter ---

        // --- start of logic ---
        var toPushData = '';

        if (this.delimiterStarted) {
            toPushData = '';
            if (!this.refEndAt) {
                toPushData += this.buffer;
                this.buffer = '';

                toPushData += data[i];

                if (!this.opts.invert) {
                    toPushData = this.transformFunc(toPushData);
                }
            } else {
                if (this.refEndAt === this.delimiters.end.length) {
                    if (this.opts.withDelimiters) {
                        toPushData += this.buffer;
                        this.buffer = '';
                    }
                }
            }
            
        } else {
            toPushData = '';
            if (!this.refStartAt) {

                toPushData += this.buffer;
                this.buffer = '';

                toPushData += data[i];

                if (this.opts.invert) {
                    toPushData = this.transformFunc(toPushData);
                }
            } else {
                if (this.refStartAt === this.delimiters.start.length) {
                    if (this.opts.withDelimiters) {
                        toPushData += this.buffer;
                        this.buffer = '';
                    }
                }
            }
        }

        if (toPushData.length > 0) {
            this.push(toPushData);
        }
        // --- end of logic ---

        if (this.refStartAt === this.delimiters.start.length) {
            this.delimiterStarted = true;
            this.buffer = '';
        }

        if (this.refEndAt === this.delimiters.end.length) {
            this.delimiterStarted = false;
            this.buffer = '';
        }

    }

    cb();
};

function passthrough(char) {
    return char;
}

function uppercase(char) {
    return ('' + char).toUpperCase();
}

function ignorechar() {
    return '';
}

module.exports = {
    Deliedit: Deliedit,
    ignorechar: ignorechar,
    uppercase: uppercase,
    passthrough: passthrough
};
