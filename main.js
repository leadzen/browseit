const vscode = require('vscode');

function activate(context) {
  for (var name in commands) {
    context.subscriptions.push(vscode.commands.registerCommand(name, commands[name]));
  }
}

function deactivate() {
}

const path = require('path');

const commands = {
  "browse.it"(resource) {
    if (resource) {
      var filepath = resource.fsPath;
      var root = getWorkspaceRoot(filepath) || path.dirname(filepath);
    }

    var urlpath = path.relative(root, filepath).replace(/\\/g, '/');

    var server = getServer(root);
    var uri = 'http://localhost:' + server.address().port + '/' + urlpath;
    vscode.commands.executeCommand('vscode.open', uri);
  }
}

const folders = vscode.workspace.workspaceFolders || [];

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

function createServer(root, terminal) {
  return http.createServer(service)
    .on("listening", function () {
      terminal = vscode.window.createTerminal();
      terminal.sendText("# http://localhost:" + this.address().port + "/");
    })
    .on("request", function () {
      terminal.dispose();
      this.off('request', arguments.callee);
    })
    .listen(0);

  function service(request, response) {
    try {
      var pathname = decodeURI(request.url);
      if (path.sep === '\\')
        pathname = pathname.replace(/\//g, '\\');
      var fullpath = root + pathname;
      var stat = fs.statSync(fullpath, { throwIfNoEntry: false });
      if (stat && !stat.isDirectory()) {
        var type = mime[path.extname(fullpath).slice(1)];
        response.setHeader("Content-Type", type);
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
