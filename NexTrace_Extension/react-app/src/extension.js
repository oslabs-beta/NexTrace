const vscode = require('vscode');
const path = require('path');


/**
 * @param {vscode.ExtensionContext} context
 */
function activate(context) {

  const reactAppPath = path.join(context.extensionPath, 'react-app', 'dist', 'bundle.js');
  const reactAppUri = vscode.Uri.file(reactAppPath).with({ scheme: 'vscode-resource' });

  const webviewContent = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <meta http-equiv="Content-Security-Policy" content="default-src 'none'; script-src vscode-resource:;">
    </head>
    <body>
        <div id="root"></div>
        <script src="${reactAppUri}"></script>
    </body>
    </html>
  `;

	console.log('Congratulations, your extension "NexTrace" is now active!');

	const panel = vscode.window.createWebviewPanel(
		'nextrace-display', // Identifies the type of the webview. Used internally
		'NexTrace Display', // Title of the panel displayed to the user
		vscode.ViewColumn.One, // Editor column to show the new webview panel in.
		{
      enableScripts: true
    } // Webview options. More on these later.
	);
	panel.webview.html = webviewContent;

	// The command has been defined in the package.json file
	// Now provide the implementation of the command with registerCommand
	// The commandId parameter must match the command field in package.json
	
	// let disposable = vscode.commands.registerCommand('NexTrace.helloWorld', function () {
	// 	vscode.window.showInformationMessage('Hello World from NexTrace!');
	// });
	const disposable = vscode.commands.registerCommand('NexTrace.startServer', () => {
		// Start your server here
		require('./server'); // Replace with the correct path to your server file
	  });
	
	context.subscriptions.push(disposable);
}

// This method is called when your extension is deactivated
function deactivate() {}

// function getWebviewContent() {
//   const reactAppPath = path.join(context.extensionPath, 'react-app', 'dist', 'bundle.js');
//   const reactAppUri = vscode.Uri.file(reactAppPath).with({ scheme: 'vscode-resource' });

//   const webviewContent = `
//     <!DOCTYPE html>
//     <html lang="en">
//     <head>
//         <meta charset="UTF-8">
//         <meta name="viewport" content="width=device-width, initial-scale=1.0">
//     </head>
//     <body>
//         <div id="root"></div>
//         <script src="${reactAppUri}"></script>
//     </body>
//     </html>
//   `;

//   return webviewContent;
// }



// function getWebviewContent() {
//   return `
//     <!DOCTYPE html>
//     <html lang="en">
//     <head>
//         <meta charset="UTF-8">
//         <meta name="viewport" content="width=device-width, initial-scale=1.0">
//         <title>Cat Coding</title>
//     </head>
//     <body>
//       <table>
//       <thead>
//         <tr>
//           <th>header1</th>
//           <th>header2</th>
//           <th>header3</th>
//         </tr>
//       </thead>
//       <tbody>
//         <tr>
//           <td>text1.1</td>
//           <td>text1.2</td>
//           <td>text1.3</td>
//         </tr>
//         <tr>
//           <td>text2.1</td>
//           <td>text2.2</td>
//           <td>text2.3</td>
//         </tr>
//         <tr>
//           <td>text3.1</td>
//           <td>text3.2</td>
//           <td>text3.3</td>
//         </tr>
//         <tr>
//         </tr>
//       </tbody>
//       </table>
//     </body>
//     </html>`;
// }



// import PanelProvider from './PanelProvider';
// function getWebviewContent() {
//   return PanelProvider();
// }

module.exports = {
	activate,
	deactivate
}
