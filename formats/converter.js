#! /usr/bin/env node

/**
	A command-line helper to convert from format to another
*/

"use strict";

var _ = require('underscore');
var fs = require('fs');
var text = require('./text');
var excel = require('./excel');
var util = require("util");

var operations = {
	"json-to-text": function(content) {
		return text.encode(JSON.parse(content));
	},
	"text-to-json" : function(content) {
		return text.decode(content);
	},
	"excel-to-json" : function(fileName) {
		return excel.decode(fileName);
	}
};

// CLI

function printUsage() {
	console.log('A little command-line helper to convert from format to another');
	console.log('\nUsage: node converter.js <operation> <source> <destination>\n');
	console.log('where <operation> is one of:');
	_.keys(operations).forEach(function(operationName) {
		console.log('        ' + operationName);
	});
	console.log('\n      <source> is the source file');
	console.log('\n      <destination> is the destination file');

}

var oper = process.argv[2];
var src = process.argv[3];
var dest = process.argv[4];

if(!oper || !operations[oper]) {
	printUsage();

	throw "Missing or invalid operations. Valid values: " + _.keys(operations).join(', ');
}

if(!src) {
	printUsage();

	throw "No source file specified";
}

if(!fs.existsSync(src)) {
	printUsage();

	throw "Can not find source file " + src;
}

if(!dest) {
	printUsage();

	throw "No destination file specified";
}

if(fs.existsSync(dest)) {
	printUsage();

	throw "Destination file " + dest + " exists already! I'm not going to overwrite it";
}

var encoded;
if(oper == "excel-to-json") {
	//just pass the file name
	encoded = operations[oper](src);

	console.log("------------------- encoded");
	console.log(encoded);
} else {

	var srcFileContent = fs.readFileSync(src, 'utf8');
	encoded = operations[oper](srcFileContent);
}


fs.writeFileSync(dest, util.inspect(encoded), 'utf8');

console.log('Successfully wrote result to file ' + dest);