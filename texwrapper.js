// Imports
var spawn   = require("child_process").spawn;
var path    = require("path");
var fs      = require("fs");
var fse     = require("fs-extra");
var temp    = require("temp");
var through = require("through");
var path    = require('path');


// temp.track();


function _createTempDirectory(cb){
  //Eagerly create temporary directory
  var dirTmp = {};
  dirTmp.directory_built = false;
  dirTmp.directory_err   = null;
  dirTmp.directory_wait  = [];
  dirTmp.directory_path  = "/tmp";
  dirTmp.directory_count = 0;



  temp.mkdir("node-latex", function(err, dirPath) {
    if(!err) {
      process.on("exit", function() {
        fse.removeSync(dirPath);
      });
    }

    dirTmp.directory_err = err;
    dirTmp.directory_path = dirPath;
    dirTmp.directory_built = true;
    for(var i=0; i< dirTmp.directory_wait.length; ++i) {
      dirTmp.directory_wait[i]();
    }
    dirTmp.directory_wait.length = 0;
    cb(dirTmp);
  });
}

//Waits for directory to be built
function _awaitDir(dirTmp, cb) {

  function _makeLocalDir(dirTmp) {
    if(dirTmp.directory_err) {
      cb(dirTmp.directory_err, null);
      return;
    }
    var temp_path = path.join(dirTmp.directory_path, "" +dirTmp.directory_count++);
    fse.mkdirp(temp_path, function(err) {
      if(err) {
        cb(err, null);
        return;
      }
      cb(null, temp_path);
    });
  }

  if(dirTmp.directory_built) {
    _makeLocalDir(dirTmp);
  } else {
    dirTmp.directory_wait.push(_makeLocalDir);
  }
}

//Send errors downstream to result
function _handleErrors(log_file, cb) {
  fs.exists(log_file, function(exists) {
    if(!exists) {
      cb(new Error("Error opening log file"));
      return;
    }
    //Try to crawl through the horrible mess that LaTeX shat upon us
    var log = fs.createReadStream(log_file);
    var err = [];
    log.on("data", function(data) {
      var lines = data.toString().split("\n");
      var detailsToInclude = 0;

      for(var i=0; i<lines.length; ++i) {
        var l = lines[i];
        if(l.length > 0 && l.charAt(0) === "!") {
          //Adding error
          err.push(l);
          detailsToInclude=2;
        }else{
          if(detailsToInclude > 0){
            err.push(l);
            detailsToInclude--;
          }
        }
      }
    });
    log.on("end", function() {
      if(err.length > 0) {
        err.unshift("LaTeX Syntax Error");
        cb(new Error(err.join("\n")));
      } else {
        cb(new Error("Unspecified LaTeX error"));
      }
    });
  });
}

function _requestTempDirectory(cb){
  _createTempDirectory(function(dirTmp){
    _awaitDir(dirTmp, function(err, dirPath) {
      cb(err, dirPath);
    });
  });
}

// Compile a latex source file
function _compileSource(config, cb){
  //Verif de l'entrée
  fs.stat(config.input_path, function(err, stats){
    if(err){
      cb("", err);
      return;
    }

    _requestTempDirectory(function(err, dirPath){
      if(err){
        cb("", err);
        return;
      }
      var basedir = path.dirname(config.input_path);
      var basename = path.basename(config.input_path);
      var basenameClean = path.basename(config.input_path, '.tex');

      var outDir = dirPath;
      var output_file = outDir+"/"+basenameClean+"."+config.format;
      var log_file = outDir+"/"+basenameClean+".log";


      //Invoke LaTeX
      var tex = spawn(config.tex_command, [
        "-interaction=nonstopmode",
        "-output-directory="+outDir,
        "-halt-on-error",
        basename
      ], {
        cwd: basedir,
        env: process.env
      });

      // Let the user know if LaTeX couldn't be found
      tex.on('error', function(err) {
        if (err.code === 'ENOENT') {
          console.error("\nThere was an error spawning " + config.tex_command + ". \n"+
                        "Please make sure your LaTeX distribution is"+
                        "properly installed.\n");
        }
        cb("", err);
      });

      //Wait for LaTeX to finish its thing
      tex.on("exit", function(code, signal) {
        _onCompilationEnd(config, output_file, log_file, basedir, basenameClean, cb);
      });
    });
  });
}

// Once compilation has ended
function _onCompilationEnd(config, output_file, log_file, basedir, basenameClean, cb) {
  fs.exists(output_file, function(exists) {
    if(exists) {
      var destFile = basedir+"/"+basenameClean+".pdf";
      if(config.out_directory !== ""){
        destFile = config.out_directory+"/"+basenameClean+".pdf";
      }

      // We get back the file only something say we want it
      if( config.isFileInput || (config.out_directory !== "")){
        fse.copy(output_file, destFile, function (err) {
          if(err){
            cb("", err);
            return;
          } else{
            cb(output_file);
          }
        });
      }else{
        cb(output_file);
      }
    } else {
      _handleErrors(log_file, function(err){
        cb("", err);
      });
    }
  });
}

function _createConfigFrom(options) {
  var config = {
      format: "pdf",
      tex_command: "pdflatex",
      pipe_in_stream: 0,
      input_path: "",
      out_directory: "",
    };
  if(!options) {
    options = {};
  }
  config.format = options.format || "pdf";
  config.tex_command = options.command || (config.format === "pdf" ? "pdflatex" : "latex");
  config.pipe_in_stream = options.pipe_in_stream || 0;
  config.out_directory = options.out_directory || "";


  return config;
}

function _createSourceInput(config, doc, cb) {
  config.pipe_in_stream = 1;
  //create temp directory
  _requestTempDirectory(function(err, dirPath) {
    if(err) {
      cb(err);
      return;
    }
    //Write data to tex file
    config.input_path = path.join(dirPath, "texput.tex");
    var tex_file = fs.createWriteStream(config.input_path);

    tex_file.on("close", function() {
      cb();
    });

    //Parse input
    if(typeof doc === "string" || doc instanceof Buffer) {
      tex_file.end(doc);
    } else if(doc instanceof Array) {
      for(var i=0; i<doc.length; ++i) {
        tex_file.write(doc[i]);
      }
      tex_file.end();
    } else if(doc.pipe) {
      doc.pipe(tex_file);
    } else {
      error(new Error("Invalid document"));
      return;
    }
  });
}


//Converts a expression into a LaTeX image
var exports = module.exports = {};


/**
 * Compile a latex direct inputed source to the stream
 * @param  Buffer|Array|pipe   doc      the raw input
 * @param  JsObject   [Optionnal] options  the options, inputs are :
 *                             - format, default is pdf
 *                             - command, default is pdflatex
 *                             - pipe_in_stream, if result should be sent into current stream
 * @param  function callback  [Optionnal] call at the end of the compilation
 */
exports.latex = function(doc, options, callback) {
  // Create config from inputs
  var config = _createConfigFrom(options);

  //variables
  var result = through();
  var compile = function (){

    _compileSource(config, function(output_path, err){
      if(callback){
        callback(err);
      }else if(config.pipe_in_stream){
        if(err){
          result.emit("error", err);
          result.destroySoon();
        }else{
          var stream = fs.createReadStream(output_path);
          stream.pipe(result);
        }
      }else if(err){
        throw err;
      }

    });
  };

  if( (typeof doc === "string" && doc instanceof Buffer) || (doc instanceof Array) || (doc.pipe) ) {
    _createSourceInput(config, doc, function(err){
      if (err){
        error(new Error("Invalid document"));
        return;
      }else{
        compile();
      }
    });
  }else if (typeof doc === "string" && !(doc instanceof Buffer)) {
    config.input_path = doc;
    compile();
  }else{
    error(new Error("Invalid document"));
    return;
  }


  return result;
};
