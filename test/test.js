var deliedit = require('../lib.js');
var Deliedit = deliedit.Deliedit;
var ignorechar = deliedit.ignorechar;
var uppercase = deliedit.uppercase;
var streamEqual = require('stream-equal');
var fs = require('fs');
var path = require('path');
var expect = require('chai').expect;

function resolve(filename) {
    return path.resolve(__dirname, filename);
}

describe('testing deliedit library', function() {

    function createDeliedit(start, end, invert, delims) {
        return new Deliedit({
            delimiters: {
                start: start,
                end: end
            },
            invert: typeof invert !== 'undefined' ? invert : false,
            withDelimiters: typeof delims !== 'undefined' ? delims : false,
            transform: uppercase
        });
    }

    describe('should test basic delimiter editing', function() {

        it('should deliedit WITHOUT invert and WITHOUT delimiters', function(done) {
            var deliedit = createDeliedit('XXX', 'YYY', false, false);

            var inStream = fs.createReadStream(resolve('in.txt')).pipe(deliedit);
            var refStream = fs.createReadStream(resolve('noinvert-nodelims.out'));

            streamEqual(inStream, refStream, function(err, equal) {
                expect(err).to.not.exist;
                expect(equal).to.be.true;
                done();
            });
        });

        it('should deliedit WITHOUT invert and WITH delimiters', function(done) {
            var deliedit = createDeliedit('XXX', 'YYY', false, true);

            var inStream = fs.createReadStream(resolve('in.txt')).pipe(deliedit);
            var refStream = fs.createReadStream(resolve('noinvert-delims.out'));

            streamEqual(inStream, refStream, function(err, equal) {
                expect(err).to.not.exist;
                expect(equal).to.be.true;
                done();
            });
        });

        it('should deliedit WITH invert and WITHOUT delimiters', function(done) {
            var deliedit = createDeliedit('XXX', 'YYY', true, false);

            var inStream = fs.createReadStream(resolve('in.txt')).pipe(deliedit);
            var refStream = fs.createReadStream(resolve('invert-nodelims.out'));

            streamEqual(inStream, refStream, function(err, equal) {
                expect(err).to.not.exist;
                expect(equal).to.be.true;
                done();
            });
        });

        it('should deliedit WITH invert and WITH delimiters', function(done) {
            var deliedit = createDeliedit('XXX', 'YYY', true, true);

            var inStream = fs.createReadStream(resolve('in.txt')).pipe(deliedit);
            var refStream = fs.createReadStream(resolve('invert-delims.out'));

            streamEqual(inStream, refStream, function(err, equal) {
                expect(err).to.not.exist;
                expect(equal).to.be.true;
                done();
            });
            
        });
    });

    describe('should test uppercase filter', function() {
        
        it('should transform text between delimiters to uppercase');

    });

});
