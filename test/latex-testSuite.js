
var fs = require('fs');
var rimraf = require('rimraf');
var assert = require('chai').assert;
var expect = require('chai').expect;
var should = require('chai').should();

//tested module
var latex = require('../texwrapper').latex;

//consts
var OUT_DIR = 'test/out/';
var RES_DIR = 'test/resources/';

var options = {
  out_directory : OUT_DIR,
};

describe("Compile document to pdf", function() {
  beforeEach(function() {
    _init();
  });

  // Test------------------------------------------------------------------
  it("Compile a simple document", function(done) {
    latex(RES_DIR+'simpleDoc.tex', options, function(err){
      if(!err){
        fs.stat(OUT_DIR+'simpleDoc.pdf',function(err, stats) {
          if(!err){
            //fichier existe
            assert.isOk(stats.isFile(), "File is missing");

            //Contient quelquechose
            var fileSizeInBytes = stats.size;
            fileSizeInBytes = ( fileSizeInBytes / 1000);
            assert.isAbove(fileSizeInBytes, 38, "File hasn't been fully produced");
          }
          done(err);
        });
      }else {
        done(err);
      }
    });
  });
  // Test------------------------------------------------------------------
  it("Compile a complex document to pdf", function(done) {
    latex(RES_DIR+'complexDoc.tex', options, function(err){
      if(!err){
        fs.stat(OUT_DIR+'complexDoc.pdf',function(err, stats) {
          if(!err){
            //fichier existe
            assert.isOk(stats.isFile(), "File is missing");

            //Contient quelquechose
            var fileSizeInBytes = stats.size;
            fileSizeInBytes = ( fileSizeInBytes / 1000);
            assert.isAbove(fileSizeInBytes, 40, "File hasn't been fully produced");
          }
          done(err);
        });
      }else {
        done(err);
      }
    });
  });
  // Test------------------------------------------------------------------
  it("Compile an input", function(done) {
    var content = [
      "\\documentclass{article}",
      "\\begin{document}",
      "abc",
      "\\end{document}"
    ];

    latex(content, options, function(err){
      if(!err){
        fs.stat(OUT_DIR+'texput.pdf',function(err, stats) {
          if(!err){
            //fichier existe
            assert.isOk(stats.isFile(), "File is missing");

            //Contient quelquechose
            var fileSizeInBytes = stats.size;
            fileSizeInBytes = ( fileSizeInBytes / 1000);
            assert.isAbove(fileSizeInBytes, 9, "File hasn't been fully produced");
          }
          done(err);
        });
      }else {
        done(err);
      }
    });
  });
  // Test------------------------------------------------------------------
  it("Try to compile undefined document", function(done) {
    latex(RES_DIR+'missing.tex', options, function(err){
      assert.isDefined(err, 'Module should have raised an error');
      var errorRef = "Error: ENOENT: no such file or directory, stat 'test/resources/missing.tex'";
      assert.strictEqual(""+err, errorRef, "Error is not what was expected");
      done();
    });
  });
  // Test------------------------------------------------------------------
  it("Try to compile not latex array input", function(done) {
    var content = [
      "\\documentclass{article}",
      "\\AAA",
      "abc",
      "\\QSDSQD"
    ];

    latex(content, options, function(err){
      assert.isDefined(err, 'Module should have raised an error');
      var errorLaTeX = "Error: LaTeX Syntax Error\n"+
        "! Undefined control sequence.\n"+
        "<recently read> \\AAAabc \n"+
        "                        \n"+
        "!  ==> Fatal error occurred, no output PDF file produced!\n";

      assert.strictEqual(""+err, errorLaTeX, "Error is not what was expected");
      done();
    });
  });
  // Test------------------------------------------------------------------
  it("Try to compile not latex string input", function(done) {
    var content = "sdfsd <sdf QSd ff";

    latex(content, options, function(err){
      assert.isDefined(err, 'Module should have raised an error');
      var errorRef = "Error: ENOENT: no such file or directory, stat 'sdfsd <sdf QSd ff'";
      assert.strictEqual(""+err, errorRef, "Error is not what was expected");
      done();
    });
  });
  // Test------------------------------------------------------------------
  it("Compile a simple document with errors", function(done) {
    latex(RES_DIR+'simpleDocWithErrors.tex', options, function(err){
      assert.isDefined(err, 'Module should have raised an error');
      var errorLaTeX = "Error: LaTeX Syntax Error\n"+
        "! Undefined control sequence.\n"+
        "l.43 \\chapter\n"+
        "             {blabla} \n"+
        "!  ==> Fatal error occurred, no output PDF file produced!\n";

      assert.strictEqual(""+err, errorLaTeX, "Error is not what was expected");
      done();
    });
  });
  // Test------------------------------------------------------------------
  it("Compile a complex document with links not found", function(done) {
    latex(RES_DIR+'complexDocWithBrokenLinks.tex', options, function(err){
      assert.isDefined(err, 'Module should have raised an error');
      var errorLaTeX = "Error: LaTeX Syntax Error\n"+
        "! LaTeX Error: File `missingdirectory/main.tex' not found.\n"+
        "\n"+
        "Type X to quit or <RETURN> to proceed,\n"+
        "! Emergency stop.\n"+
        "<read *> \n"+
        "         \n"+
        "!  ==> Fatal error occurred, no output PDF file produced!\n";

      assert.strictEqual(""+err, errorLaTeX, "Error is not what was expected");
      done();
    });
  });
  // Test------------------------------------------------------------------
  it("Async compilation of documents", function(done) {
    var test1_finished = false;
    var test2_finished = false;
    latex(RES_DIR+'simpleDoc.tex', options, function(err){
      if(!err){
        test1_finished = true;
      }else{
        done(err);
      }
      if(test2_finished){
        done();
      }
    });
    latex(RES_DIR+'simpleDoc.tex', options, function(err){
      if(!err){
        test2_finished = true;
      }else{
        done(err);
      }
      if(test1_finished){
        done();
      }
    });
  });
});


//_init : Reset le dossier d'output
function _init() {
  options = {
    out_directory : OUT_DIR,
  };

  // rimraf(OUT_DIR, fs, function(err){
  //   if (err) throw err;
  //   fs.mkdir(OUT_DIR);
  // });

}
