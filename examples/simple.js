
//Simple example

var latex = require('../texwrapper').latex;
latex([
  "\\documentclass{article}",
  "\\begin{document}",
  "abc",
  "\\end{document}"
]).pipe(process.stdout);
