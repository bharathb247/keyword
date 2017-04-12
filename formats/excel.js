"use strict";

var _ = require('underscore');
var helpers = require('../lib/helpers');
var validators = require('../lib/validators');
var parseXlsx = require('excel');
var deasync = require('deasync');

var not = helpers.not;

//var file = "./suite.xlsx";


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

        var formattedData = [];
        var formattedDataKey;
        _.map(data, function(d) {
            if(d[0] != '') {
                //its the key
                formattedData.push(d[0]);
                formattedData.push(d[1]);
            } else {
                formattedData.push(d[1]);
            }
        });      

		keys = _(formattedData).chain()
					.flatten()
					.map(trimLines)
					.reduce(splitByEmptyLines, [[]])
					.filter(not(_.isEmpty))
					.reduce(createMap, {})
					.value();
    });

    while(keys === undefined) {
      require('deasync').runLoopOnce();
    }

    return keys;
}

//decode(file);

module.exports = {
    decode: decode
};
