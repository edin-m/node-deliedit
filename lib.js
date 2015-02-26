var stream = require('stream');
var util = require('util');
var fs = require('fs');

var Transform = stream.Transform || require('readable-stream').Transform;

// function UpperCase(opts) {
//     if(!(this instanceof Transform)) {
//         return new UpperCase();
//     }
// 
//     Transform.call(this);
// }
// 
// util.inherits(UpperCase, Transform);
// 
// UpperCase.prototype._transform = function(chunk, enc, cb) {
//     for(var i = 0; i < chunk.length; i++)
//     if(chunk[i] >= 97 && chunk[i] <= 122) {
//         chunk[i] -= 32;
//     }
//     this.push(chunk);
//     cb();
// }
// 
//// -------------------------------
//
//function CharStream() {
//    Transform.call(this);
//}
//
//util.inherits(CharStream, Transform);
//
//CharStream.prototype._transform = function(chunk, enc, cb) {
//    var data = chunk.toString();
//    for(var i = 0; i < data.length; i++) {
//        this.push(data[i]);
//    }
//    cb();
//};
//
//function PassThrough() {}
//
//util.inherits(PassThrough, Transform);
//
//PassThrough.prototype._transform = function(chunk, enc, cb) {
//    this.push(chunk);
//    cb();
//}

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
        var wasRefStartAt = this.refStartAt;
        if(equalsStartRef && !this.delimiterStarted) {
            this.refStartAt++;
            this.buffer += data[i];
        }
        else {
            this.refStartAt = 0;
        }
        var changedStart = this.refStartAt === 0;
        // --- end tracking start delimiter ---

        // --- tracking start delimiter ---
        var wasRefEndAt = this.refEndAt;
        if(equalsEndRef && this.delimiterStarted) {
            this.refEndAt++;
            this.buffer += data[i];
        }
        else {
            this.refEndAt = 0;
        }
        var changedEnd = this.refEndAt === 0;
        // -- end tracking start delimiter ---

        // --- start of logic ---
        var toPushData = '';

//        if(this.opts.invert && (this.refStartAt || this.refEndAt || this.delimiterStarted)) {
//            toPushData = this.transform(data[i]);
//        }
//
//        if(!this.opts.invert && (!this.delimiterStarted || this.refEndAt || this.refStartAt)) {
//            toPushData = this.transform(data[i]);
//        }

//        if(this.opts.withDelimiters) {
//            if(this.refStartAt === this.delimiters.start.length || this.refEndAt === this.delimiters.end.length) {
//                toPushData = this.buffer;
//                this.buffer = '';
//            }
//        }


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

//            if(!this.refStartAt && !this.refEndAt) {
//
//                var shouldTransform = false;
//                if(!this.delimiterStarted && this.opts.invert) {
//                    shouldTransform = true;
//                }
//                else if(this.delimiterStarted && !this.opts.invert) {
//                    shouldTransform = true;
//                }
//
//                toPushData = data[i];
//                if(shouldTransform) {
//                    toPushData = this.opts.transform(data[i]);
//                }
//            }
//        }

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

function transformation23() {
    return new Deliedit({
        delimiters: {
            start: '<!-- startedit:edits -->',
            end: '<!-- endedit:edits -->'
        },
        invert: true,
        withDelimiters: false,
        transform: ignorechar
    })
    .on('start delimiter', console.log.bind(console, 'started delimiter'))
    .on('end delimiter', console.log.bind(console, 'ended delimiter'));
}

function transformation() {
    return new Deliedit({
        delimiters: {
            start: 'XXX',
            end: 'YYY'
        },
        invert: true,
        withDelimiters: true,
        transform: ignorechar
    })
    .on('start delimiter', console.log.bind(console, 'started delimiter'))
    .on('end delimiter', console.log.bind(console, 'ended delimiter'));
}

function uppercase(char) {
    return ('' + char).toUpperCase();
}

//var pipeline = process.argv[2] ? fs.createReadStream(process.argv[2]) : process.stdin;
// 
//pipeline = pipeline.pipe(transformation());
//pipeline.pipe(fs.createWriteStream('./out.txt'));
//pipeline.pipe(process.stdout);

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
