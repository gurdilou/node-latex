
//Simple example
var latex = require('../texwrapper').latex;
var fs = require('fs');

var fileStrm = fs.createReadStream("./testdoc.tex");
latex(fileStrm).pipe(process.stdout);
