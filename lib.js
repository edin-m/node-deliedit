var stream = require('stream');
var util = require('util');
var fs = require('fs');

var Transform = stream.Transform || require('readable-stream').Transform;

function ignorechar(char) {
    return '';
}

function Deliedit(opts) {
    opts = opts || {};
    // add start end ref throws

    this.opts = opts;
    this.transform = opts.transform || ignorechar;
    this.delimiters = opts.delimiters;

    this.refStartAt = 0;
    this.refEndAt = 0;
    this.delimiterStarted = false;
    this.buffer = '';

    Transform.call(this, opts);
}

util.inherits(Deliedit, Transform);

Deliedit.prototype._transform = function(chunk, enc, cb) {
    var data = chunk.toString();

    for(var i = 0; i < data.length; i++) {

        var equalsStartRef = data.charAt(i) === this.delimiters.start.charAt(this.refStartAt);
        var equalsEndRef = data.charAt(i) === this.delimiters.end.charAt(this.refEndAt);

        // --- tracking start delimiter ---
        if(equalsStartRef && !this.delimiterStarted) {
            this.refStartAt++;
            this.buffer += data[i];
        }
        else {
            this.refStartAt = 0;
        }
        // --- end tracking start delimiter ---

        // --- tracking start delimiter ---
        if(equalsEndRef && this.delimiterStarted) {
            this.refEndAt++;
            this.buffer += data[i];
        }
        else {
            this.refEndAt = 0;
        }
        // -- end tracking start delimiter ---

        // --- start of logic ---
        var toPushData = '';

        if(this.delimiterStarted) {

            toPushData = '';

            if(!this.refEndAt) {

                toPushData += this.buffer;
                this.buffer = '';

                toPushData += data[i];

                if(!this.opts.invert) {
                    toPushData = this.opts.transform(toPushData);
                }
            } else {
                if(this.refEndAt === this.delimiters.end.length) {
                    if(this.opts.withDelimiters) {
                        toPushData += this.buffer;
                        this.buffer = '';
                    }
                }
            }
            
        } else {

            toPushData = '';

            if(!this.refStartAt) {

                toPushData += this.buffer;
                this.buffer = '';

                toPushData += data[i];

                if(this.opts.invert) {
                    toPushData = this.opts.transform(toPushData);
                }
            }
            else {
                if(this.refStartAt === this.delimiters.start.length) {
                    if(this.opts.withDelimiters) {
                        toPushData += this.buffer;
                        this.buffer = '';
                    }
                }
            }

        }

        this.push(toPushData);
        // --- end of logic ---

        if(this.refStartAt === this.delimiters.start.length) {
            this.delimiterStarted = true;
            this.buffer = '';
        }

        if(this.refEndAt === this.delimiters.end.length) {
            this.delimiterStarted = false;
            this.buffer = '';
        }

    }

    cb();
};

function uppercase(char) {
    return ('' + char).toUpperCase();
}

function one() {
    return fs.createReadStream(require('path').join(process.cwd(), process.argv[2]))
    .pipe(new Deliedit({
        delimiters: {
            start: 'XXX',
            end: 'YYY'
        },
        invert: false,
        withDelimiters: false,
        transform: uppercase 
    })).pipe(process.stdout);
}
 
one();

module.exports = {
    Deliedit: Deliedit,
    ignorechar: ignorechar,
    uppercase: uppercase
};
