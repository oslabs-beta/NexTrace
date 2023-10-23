const path = require('path');
const vscode = require('vscode');
const jscodeshift = require('jscodeshift');
const { addLogs } = require('./utils/addLogs');
const { removeLogs } = require('./utils/removeLogs');
const { transformer } = require('./utils/astConstructor');
const { detransformer } = require('./utils/astDeconstructor');
const { server, closeServer } = require('./react-app/src/server');

/**
 * @param {vscode.ExtensionContext} context
 */
function activate(context) {
  //PRIMARY PANEL FOR HTTP REQUESTS W/ METRICS & GRAPHS
  try {
    //METRICS DISPLAY PANEL
    context.subscriptions.push(
      vscode.commands.registerCommand('NexTrace.openTable', () => {
        const panel = vscode.window.createWebviewPanel(
          'nextrace-metrics', // Identifies the type of the webview. Used internally
          'Request Metrics', // Title of the panel displayed to the user
          vscode.ViewColumn.One, // Editor column to show the new webview panel in.
          {
            retainContextWhenHidden: true,
            enableScripts: true,
            localResourceRoots: [vscode.Uri.file(path.join(context.extensionPath, 'react-app'))],
          }
        );

        const reactAppPath = path.join(context.extensionPath, 'react-app', 'dist', 'bundle.js');
        const reactAppUri = panel.webview.asWebviewUri(vscode.Uri.file(reactAppPath));

        const cssAppPath = path.join(context.extensionPath, 'react-app', 'src', 'style.css');
        const cssAppUri = panel.webview.asWebviewUri(vscode.Uri.file(cssAppPath));

        const webviewContent = `
        <!DOCTYPE html>
        <html lang="en">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <meta http-equiv="Content-Security-Policy" content="default-src 'self'; connect-src 'self' http://localhost:3695 ws://localhost:3695; style-src 'self' vscode-webview-resource: 'unsafe-inline'; style-src-elem 'self' vscode-webview-resource: 'unsafe-inline'; script-src 'self' 'unsafe-inline' https://*.vscode-cdn.net vscode-webview-resource:;">
          <link rel="stylesheet" type="text/css" href="${cssAppUri}">
        </head>
        <body>
          <div id="root"></div>
          <div id="route" data-route-path="/metrics"></div>
          <script>
          window.vscodeApi = acquireVsCodeApi();
          </script>
          <script src="${reactAppUri}"></script>
        </body>
        </html>
        `;
        panel.webview.html = webviewContent;
      })
    );

    //CONSOLE DISPLAY PANEL
    context.subscriptions.push(
      vscode.commands.registerCommand('NexTrace.openConsole', () => {
        const panel = vscode.window.createWebviewPanel(
          'nextrace-console', // Identifies the type of the webview. Used internally
          'Console Summary', // Title of the panel displayed to the user
          vscode.ViewColumn.One, // Editor column to show the new webview panel in.
          {
            retainContextWhenHidden: true,
            enableScripts: true,
            localResourceRoots: [vscode.Uri.file(path.join(context.extensionPath, 'react-app'))],
          }
        );

        const reactAppPath = path.join(context.extensionPath, 'react-app', 'dist', 'bundle.js');
        const reactAppUri = panel.webview.asWebviewUri(vscode.Uri.file(reactAppPath));

        const webviewContent = `
        <!DOCTYPE html>
        <html lang="en">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <meta http-equiv="Content-Security-Policy" content="default-src 'self'; connect-src 'self' http://localhost:3695 ws://localhost:3695; style-src 'self' vscode-webview-resource: 'unsafe-inline'; style-src-elem 'self' vscode-webview-resource: 'unsafe-inline'; script-src 'self' 'unsafe-inline' https://*.vscode-cdn.net vscode-webview-resource:;">          
        </head>
        <body>
          <div id="root"></div>
          <div id="route" data-route-path="/console"></div>
          <script>
          window.vscodeApi = acquireVsCodeApi();
          </script>
          <script src="${reactAppUri}"></script>
        </body>
        </html>
        `;
        panel.webview.html = webviewContent;
        panel.webview.onDidReceiveMessage((message) => {
          if (message.command === 'NexTrace.fileNav') {
            vscode.commands.executeCommand(message.command, message.path)
          }
        });
      })
    );


    //PRIMARY SIDE BAR HTML
    const panelAppPath = path.join(context.extensionPath, 'react-sidepanel', 'dist', 'bundle.js');
    const thisProvider = {
      webviewView: null,
      resolveWebviewView: function (webviewView, context, token) {
        const panelAppUri = webviewView.webview.asWebviewUri(vscode.Uri.file(panelAppPath));
        this.webviewView = webviewView;
        webviewView.webview.options = {
          enableScripts: true,
        };

        webviewView.webview.html = `
        <!DOCTYPE html>
        <html lang="en">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <meta http-equiv="Content-Security-Policy" content="default-src 'self' data: https: http: vscode-webview-resource: 'unsafe-inline'; img-src 'self' data: https: http:;">
          <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.1.0/css/all.min.css"/>
        </head>
        <body>
          <div id="root"></div>
          <img src="https://media.giphy.com/media/JIX9t2j0ZTN9S/giphy.gif" width="300" style="margin-top: 3em;"/>
          <script>
          window.vscodeApi = acquireVsCodeApi();
          </script>
          <script src="${panelAppUri}"></script>
        </body>
        </html>
        `;

        // Handle any messages or events from the webview view here
        webviewView.webview.onDidReceiveMessage((message) => {
          // Handle the message from the webview view
          if (message.command === 'transformCode' || message.command === 'detransformCode') {
            transformCode(message.path, message.command);
          }
          else if (message.command === 'NexTrace.saveState') {
            vscode.commands.executeCommand(message.command, message)
          }
          else if (message.command === 'gatherFilePaths') {
            handleLogs(message.path, message.command, message.rootPath);
          }
          else if (message.command === 'removeLogs') {
            handleLogs(message.path, message.command);
          }
          else if (message.command === 'alert') {
            vscode.window.showInformationMessage(message.text);
          }
          else vscode.commands.executeCommand(message);
        });
      },
    };
    //REGISTERS PRIMARY SIDE BAR PROVIDER
    const disposable2 = vscode.window.registerWebviewViewProvider("nextrace-primary-sidebar.views", thisProvider);
    context.subscriptions.push(disposable2);

    //REGISTERS START SERVER COMMAND
    const disposable = vscode.commands.registerCommand('NexTrace.startServer', () => { server() });
    context.subscriptions.push(disposable);

    //REGISTERS STOP SERVER COMMAND
    const stopDisposable = vscode.commands.registerCommand('NexTrace.stopServer', () => { closeServer() });
    context.subscriptions.push(stopDisposable);

    //REGISTERS FILE NAVIGATION COMMAND
    const disposable3 = vscode.commands.registerCommand("NexTrace.fileNav", (filePath) => {
      const test = vscode.workspace.openTextDocument(filePath);
      vscode.window.showTextDocument(test);
    });
    context.subscriptions.push(disposable3);

    //REGISTERS STATE SAVE COMMAND FOR SIDE PANEL BUTTONS
    const stateSaveDisposable = vscode.commands.registerCommand('NexTrace.saveState', (stateData) => {
      const { path, name, rootDir, button } = stateData;
      const state = { path, name, rootDir, button }
      context.globalState.update('sidePanelState', state)
    });
    context.subscriptions.push(stateSaveDisposable);

    //REGISTERS STATE GET COMMAND FOR SIDE PANEL BUTTONS
    const stateGetDisposable = vscode.commands.registerCommand('NexTrace.getState', () => {
      const savedState = context.globalState.get('sidePanelState');
      thisProvider.webviewView.webview.postMessage({
        command: 'NexTrace.getStateResponse',
        data: savedState,
      });
    });
    context.subscriptions.push(stateGetDisposable);

    console.log('Congratulations, your extension "NexTrace" is now active!');
  }
  catch (err) { console.log(err) }
}

function handleLogs(files, command, rootPath) {
  const allowedFileTypes = new Set(['.js', '.jsx', '.ts', '.tsx']);
  files.forEach((path, i) => {
    if (path) {
      const fileType = path.slice(-4);
      if ((allowedFileTypes.has(fileType) || allowedFileTypes.has(fileType.slice(1))) && path !== rootPath) {
        transformCode(path, command, i);
      }
    }
  });
}

async function transformCode(userProvidedPath, command, index) {
  try {
    const document = await vscode.workspace.openTextDocument(userProvidedPath);
    const fileContent = document.getText();
    let transformedContent;
    if (command === 'transformCode') {
      transformedContent = transformer({
        source: fileContent
      }, {
        jscodeshift
      }, userProvidedPath);
    }
    else if (command === 'detransformCode') {
      transformedContent = detransformer({
        source: fileContent
      }, {
        jscodeshift
      }, userProvidedPath);
    }
    else if (command === 'gatherFilePaths') {
      transformedContent = addLogs({
        source: fileContent
      }, {
        jscodeshift
      }, userProvidedPath, index);
    }
    else if (command === 'removeLogs') {
      transformedContent = removeLogs({
        source: fileContent
      }, {
        jscodeshift
      }, userProvidedPath, index);
    }

    const fullRange = new vscode.Range(document.positionAt(0),
      document.positionAt(fileContent.length)
    );
    const edit = new vscode.WorkspaceEdit();
    edit.replace(document.uri, fullRange, transformedContent);
    await vscode.workspace.applyEdit(edit);
  } catch (err) {
    vscode.window.showErrorMessage('Failed to open or transform file: ', err.message);
  }
}

function deactivate() {
}

module.exports = {
  activate,
  deactivate
}