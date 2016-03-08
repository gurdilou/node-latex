
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



describe("Compile document to pdf", function() {
  //Set up
  before(function() {
    // console.log("setup");
    _init();
  });

  it("Compile a simple document", function(done) {

    var options = {
      out_directory : OUT_DIR,
    };

    latex(RES_DIR+'simpleDoc.tex', options, function(err){
      fs.stat(OUT_DIR+'simpleDoc.pdf',function(err, stats){
        if(!err){
          expect(stats.isFile()).to.be.ok;
        }
        done(err);
      });
    });



    // TODO: Check tmp files not exist
    // TODO: Check error content
  });


  it("Compile an input", function() {
    // TODO: check file exists
    // Check tmp files not exist
    // Check error content
  });
  it("Try to compile undefined document", function() {
    // TODO: check file not exists
    // Check tmp files not exists
    // Check error content
  });
  it("Try to compile not latex input", function() {
    // TODO: check file not exists
    // Check tmp files not exists
    // Check error content
  });
  it("Compile a complex document to pdf", function() {
    // TODO: check file exists
    // Check tmp files not exist
    // Check error content
  });
  it("Compile a simple document with errors", function() {
    // TODO: check file not exists
    // Check tmp files not exist
    // Check error content
  });
  it("Compile a complex document with links not found", function() {
    // TODO: check file not exists
    // Check tmp files not exist
    // Check error content
  });
  it("Async compilation of documents", function() {
    // TODO: check one file exists only
    // Check tmp files not exist
    // Check error contents
  });
});


//_init : Reset le dossier d'output
function _init() {
  rimraf(OUT_DIR, fs, function(err){
    if (err) throw err;
    fs.mkdir(OUT_DIR);
  });

}
