const vscode = require('vscode');
const path = require('path');


/**
 * @param {vscode.ExtensionContext} context
 */
function activate(context) {

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
        <meta http-equiv="Content-Security-Policy" content="default-src 'self'; style-src 'self' vscode-webview-resource: 'unsafe-inline'; style-src-elem 'self' vscode-webview-resource: 'unsafe-inline'; script-src 'self' 'unsafe-inline' https://*.vscode-cdn.net vscode-webview-resource:;">
        //OLD META ---> <meta http-equiv="Content-Security-Policy" content="default-src 'self'; style-src 'self' 'unsafe-inline' vscode-webview-resource:; style-src-elem 'self' 'unsafe-inline' vscode-webview-resource:; script-src 'self' 'unsafe-inline' https://*.vscode-cdn.net vscode-webview-resource:;">
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


	console.log('Congratulations, your extension "NexTrace" is now active!');
    
  }
  catch(err) {
    console.log(err);
  }
	

	const disposable = vscode.commands.registerCommand('NexTrace.startServer', () => {
		// Start your server here
		require('./server'); // Replace with the correct path to your server file
	  });
	
	context.subscriptions.push(disposable);
}

function deactivate() {}

module.exports = {
	activate,
	deactivate
}
