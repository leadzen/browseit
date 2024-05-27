const vscode = require('vscode');

global.vscode = vscode;

const folders = vscode.workspace.workspaceFolders || [];

function activate(context) {
  console.log("Open with Server Extension Activate ...");
  console.log("Extension path: %s", context.extensionPath);
  

  for (var name in commands) {
    context.subscriptions.push(vscode.commands.registerCommand(name, commands[name]));
  }
}

function deactivate() {
  console.log("Open with Server Deactivate ...");
}

const path = require('path');

const commands = {
  "browse.it"(resource) {
    console.log("Open with Browser ...");
    if (resource) {
      var filepath = resource.fsPath;
      console.log(filepath);
      var root = getWorkspaceRoot(filepath) || path.dirname(filepath);
    }

    console.log('Web root: %s', root);

    var urlpath = path.relative(root, filepath).replace(/\\/g, '/');
    console.log("Relative path: %s", urlpath);

    var server = getServer(root);
    var uri = 'http://localhost:' + server.address().port + '/' + urlpath;
    console.log("Open URL: %s", uri);
    vscode.commands.executeCommand('vscode.open', uri);
  }
}

function getWorkspaceRoot(filepath) {
  for (var folder of folders) {
    var root = folder.uri.fsPath;
    if (filepath.startsWith(root))
      return root;
  }
}

/*------------------------------------------------------------------------------
Web Server
*/
const http = require('http');
const fs = require('fs');
const mime = require('./mime.js');

const servers = {};

function getServer(root) {
  return servers[root] || (servers[root] = createServer(root));
}

function createServer(root, port) {
  return http.createServer(service)
    .on("listening", function () {
      console.log("Web Server open at http://localhost:" + this.address().port + "/");
    })
    .on("close", function () {
      console.log("Web Server close at http://localhost:" + this.address().port + "/")
    })
    .on("error", function (error) {
      console.log(error);
    })
    .listen(port | 0);

  function service(request, response) {
    try {
      var pathname = request.url;
      console.log("Request URL: %s", pathname);

      if (path.sep === '\\')
        pathname = pathname.replace(/\//g, '\\');
      var fullpath = root + pathname;
      console.log("Request Filepath: %s", fullpath);
      var stat = fs.statSync(fullpath, {throwIfNoEntry: false});
      if(stat && !stat.isDirectory()) {
        var type = mime[path.extname(fullpath).slice(1)];
        if(type) {
          response.setHeader("Content-Type", type + "; charset=utf-8");
        }
        fs.createReadStream(fullpath).pipe(response);
      }
      else {
        response.statusCode = '404';
        response.end();
      }
    }
    catch (error) {
      response.statusCode = '500';
      response.end(error.message);
    }
  }
}


module.exports = {
  activate,
  deactivate
}
