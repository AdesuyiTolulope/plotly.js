var through = require('through2');

/**
 * Browserify transform that strips comments out
 * of the plotly.js bundles
 */

var WHITESPACE_BEFORE = '\\s*';
var NOT_PRECEEDED_BY_COLON = '(?<!:)'; // to keep links e.g. https://
var SINGLELINE_COMMENT = NOT_PRECEEDED_BY_COLON + '//.*';

module.exports = function() {
    var allChunks = [];
    return through(function(chunk, enc, next) {
        allChunks.push(chunk);
        next();
    }, function(done) {
        var str = Buffer.concat(allChunks).toString('utf-8');
        this.push(
            str
                // first replace multi-line comments
                .replace(
                    // adapted https://blog.ostermiller.org/finding-comments-in-source-code-using-regular-expressions/
                    new RegExp(/\s*\/\*([^*]|(\*+([^*\/])))*\*+\//, 'g'), ''
                )
                // next replace single-line comments
                .replace(
                    new RegExp(WHITESPACE_BEFORE + SINGLELINE_COMMENT, 'g'), ''
                )
        );
        done();
    });
};
