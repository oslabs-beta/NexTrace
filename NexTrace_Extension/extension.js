const vscode = require('vscode');
const path = require('path');


/**
 * @param {vscode.ExtensionContext} context
 */
function activate(context) {

  //PRIMARY PANEL FOR HTTP REQUESTS W/ METRICS & GRAPHS
  try {
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
      </head>
      <body>
          <div id="root"></div>
          <img src="https://media.giphy.com/media/JIX9t2j0ZTN9S/giphy.gif" width="300" />
          <script>
            const vscode = acquireVsCodeApi();
          </script>
          <script src="${panelAppUri}"></script>
      </body>
      </html>
      `;
  
      // Handle any messages or events from the webview view here
      webviewView.webview.onDidReceiveMessage((message) => {
        // Handle the message from the webview view
        console.log(message);
        vscode.commands.executeCommand(message);
      });
    },
  };

  
  //REGISTERS PRIMARY SIDE BAR PROVIDER
  const disposable2 = vscode.window.registerWebviewViewProvider(
    "nextrace-primary-sidebar.views",
    thisProvider
  );
  context.subscriptions.push(disposable2);
	
  //REGISTERS START SERVER COMMAND
	const disposable = vscode.commands.registerCommand('NexTrace.startServer', () => {
		// Start your server here
		require('./react-app/src/server'); // Replace with the correct path to your server file
	  });
	context.subscriptions.push(disposable);


	console.log('Congratulations, your extension "NexTrace" is now active!');
}
function deactivate() {}

module.exports = {
	activate,
	deactivate
}
