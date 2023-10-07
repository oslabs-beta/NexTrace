const vscode = require('vscode');
const path = require('path');
const jscodeshift = require('jscodeshift');
const { transformer } = require('./utils/astConstructor');


/**
 * @param {vscode.ExtensionContext} context
 */
function activate(context) {
  //PRIMARY PANEL FOR HTTP REQUESTS W/ METRICS & GRAPHS
  try {
    context.subscriptions.push(
      vscode.commands.registerCommand('NexTrace.openTable', () => {
        const panel = vscode.window.createWebviewPanel(
          'nextrace-display', // Identifies the type of the webview. Used internally
          'NexTrace Display', // Title of the panel displayed to the user
          vscode.ViewColumn.One, // Editor column to show the new webview panel in.
          {
            enableScripts: true,
            localResourceRoots: [vscode.Uri.file(path.join(context.extensionPath, 'react-app'))]
          } // Webview options. More on these later.
        );

    const reactAppPath = path.join(context.extensionPath, 'react-app', 'dist', 'bundle.js');
    const reactAppUri = panel.webview.asWebviewUri(vscode.Uri.file(reactAppPath));

    const cssAppPath = path.join(context.extensionPath, 'react-app', 'src', 'style.css');
    const cssAppUri = panel.webview.asWebviewUri(vscode.Uri.file(cssAppPath)); //.with({ scheme: 'vscode-webview-resource' })
    
    // <meta http-equiv="Content-Security-Policy" content="default-src 'self' 'unsafe-inline'; script-src 'unsafe-inline' 'self' https://*.vscode-cdn.net vscode-webview-resource:; script-src-elem 'unsafe-inline' 'self' https://*.vscode-cdn.net vscode-webview-resource:;">

    const webviewContent = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <meta http-equiv="Content-Security-Policy" content="default-src 'self'; connect-src 'self' http://localhost:3695; style-src 'self' vscode-webview-resource: 'unsafe-inline'; style-src-elem 'self' vscode-webview-resource: 'unsafe-inline'; script-src 'self' 'unsafe-inline' https://*.vscode-cdn.net vscode-webview-resource:;">
          <link rel="stylesheet" type="text/css" href="${cssAppUri}">
      </head>
      <body>
          <div id="root"></div>
          <h1>Hello World!</h1>
          <script src="${reactAppUri}"></script>
      </body>
      </html>
    `;

    panel.webview.html = webviewContent;
  })
);
  }
  catch(err) {
    console.log(err);
  }

  //PRIMARY SIDE BAR HTML 
  const panelAppPath = path.join(context.extensionPath, 'react-sidepanel', 'dist', 'bundle.js');
  const thisProvider = {
    resolveWebviewView: function (webviewView, context, token) {
      // Customize the webview view here
      webviewView.webview.options = {
        // Enable JavaScript in the webview
        enableScripts: true,
      };

      const panelAppUri = webviewView.webview.asWebviewUri(vscode.Uri.file(panelAppPath));
      // Set the HTML content for the webview view
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
          <img src="https://media.giphy.com/media/JIX9t2j0ZTN9S/giphy.gif" width="300" />
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
        if (message.command === 'transformCode') {
          console.log('here is the message: ', message.path)
          const userProvidedPath = message.path;
          transformCode(userProvidedPath);
        }
        else vscode.commands.executeCommand(message);
      });
    },
  };


  //REGISTERS PRIMARY SIDE BAR PROVIDER
  const disposable2 = vscode.window.registerWebviewViewProvider(
    "nextrace-primary-sidebar.views",
    thisProvider
  );
  context.subscriptions.push(disposable2);

  let serverInstance
  //REGISTERS START SERVER COMMAND
  const disposable = vscode.commands.registerCommand('NexTrace.startServer', () => {
  // Start your server here
  console.log('server is starting')
  serverInstance = require('./react-app/src/server'); 
  });
  context.subscriptions.push(disposable);

  const stopDisposable = vscode.commands.registerCommand('NexTrace.stopServer', () => {
    // Stop your server here
    console.log('server is STOPPING')
    if (serverInstance) {
      serverInstance.close(() => {
        console.log('Server stopped.');
      });
    }
  });
  context.subscriptions.push(stopDisposable);


  console.log('Congratulations, your extension "NexTrace" is now active!');
}

async function transformCode(userProvidedPath) {

  try {
    const document = await vscode.workspace.openTextDocument(userProvidedPath);
    const editor = await vscode.window.showTextDocument(document);
    const fileContent = document.getText();

    const transformedContent = transformer({
      source: fileContent
    }, {
      jscodeshift
    });

    const fullRange = new vscode.Range(document.positionAt(0),
      document.positionAt(fileContent.length)
    );

    editor.edit(editBuilder => {
      editBuilder.replace(fullRange, transformedContent);
    });
  } catch (err) {
    vscode.window.showErrorMessage('Failed to open or transform file: ', err.message);
  }
}

function deactivate() { }

module.exports = {
  activate,
  deactivate
}