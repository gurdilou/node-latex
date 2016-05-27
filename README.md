latex
==========

Simple LaTeX wrapper for node.js. Accepts LaTeX raw inputs, or filepaths.

### Installation ###

First, you need to install latex.  On any Debian based system, you can do this with the following command:

    sudo apt-get install texlive

On OS X, you will need to install [MacPorts](http://www.macports.org/) first.  Once that is set up, you can then do:

    sudo port install texlive

For Windows, you can try using cygwin though I have not tested this.

Once you have a working version of latex, you can install node-latex using the following command:

    npm install latex-file

### Usage ###


Here is an example of how to use the library :

    var latex = require('../texwrapper').latex;
    latex([
      "\\documentclass{article}",
      "\\begin{document}",
      "hello world",
      "\\end{document}"
    ]).pipe(process.stdout);

This will spit out a formatted PDF article to stdout that says "hello world".  The result of calling the function is returned as a stream and can be processed using other tools.  If you want to convert the result into an image or pdf, you can use [graphics magic](http://aheckmann.github.com/gm/).


Or you can use it to produce files :

    var options = {
      out_directory : 'test/out/',
    };
    latex('test/resources/simpleDoc.tex', options, function(err){
    });


### How to use ###

The only exported function from `node-latex` is a function that takes either :
  * a raw LaTeX document. The type of `doc` must be one of the following:
    * A string
    * A [Buffer](http://nodejs.org/api/buffer.html)
    * An array of strings and/or Buffers
    * A readable [Stream](http://nodejs.org/api/stream.html)

  * a filepath, and invoke a callback when finished.

If you precise `out_directory` in the options, or give a filepath, the file will be produced in the directory.

In addition, you can also specify the following additional parameters via the `options` struct:

* `command`: An optional override for the latex command (default calls `pdflatex`);
* `format`: Either "pdf" or "dvi" (default returns a pdf);
* `pipe_in_stream` : set to `true` if you want to output the pdf in current stream;
* `out_directory` : the output directory with the compiled file.

### Errors handling ###

If there were errors in the syntax of the document, they will be raised as errors on this Stream object. The package will try to add some context to help you.

If you decide to get the output in stream, errors will be raised in it

### Credits ###
(c) 2013 Mikola Lysenko.  MIT License
(c) 2016 Thomas Luce.  MIT License
