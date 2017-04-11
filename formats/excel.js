"use strict";

var _ = require('underscore');
var helpers = require('../lib/helpers');
var validators = require('../lib/validators');
var parseXlsx = require('excel');
var deasync = require('deasync');

var not = helpers.not;

var file = "./suite.xlsx";


function trimLines(line) {
    return line.trim();
}

function splitByEmptyLines(a, b) {
    if(b === "") {
        a.push([]);
    } else {
        _.last(a).push(b);
    }
    return a;
}

function createMap(a, b) {
    var name = _.head(b);
    var keys = _.tail(b);
    a[name] = parseParams(keys);

    return a;
}

function parseParams(keys) {
    return _(keys).chain()
        .map(function(key) {
            var parts = key.split(/\s\s+|\t\s?/);
            var head = _.head(parts);
            var tail = _.tail(parts);
            var last = _.last(parts);
            var isReturn = validators.isReturn(last);
            var params = isReturn ? _.initial(tail) : tail;

            var result = [head];

            if(params.length) {
                result.push(params);
            }

            if(isReturn) {
                result.push(last);
            }

            return result;
        })
        .flatten(true)
        .value();
}


function decode(fileName) {

    var keys;
	parseXlsx(fileName, function(err, data) {
		if(err) throw err;
		// data is an array of arrays

		keys = _(data).chain()
					.flatten()
					.map(trimLines)
					.reduce(splitByEmptyLines, [[]])
					.filter(not(_.isEmpty))
					.reduce(createMap, {})
					.value();

      	//console.log(keys);
        //return keys;
	});

    while(keys === undefined) {
      require('deasync').runLoopOnce();
    }

    console.log(keys);

    return JSON.stringify(keys);
}

decode(file);

module.exports = {
    decode: decode
};
