// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
const vscode = require('vscode');

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed

/**
 * @param {vscode.ExtensionContext} context
 */
function activate(context) {

	// Use the console to output diagnostic information (console.log) and errors (console.error)
	// This line of code will only be executed once when your extension is activated
	console.log('Congratulations, your extension "NexTrace" is now active!');

	const panel = vscode.window.createWebviewPanel(
		'catCoding', // Identifies the type of the webview. Used internally
		'Cat Coding', // Title of the panel displayed to the user
		vscode.ViewColumn.One, // Editor column to show the new webview panel in.
		{} // Webview options. More on these later.
	);
	panel.webview.html = getWebviewContent();

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

function getWebviewContent() {
  return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Cat Coding</title>
</head>
<body>
    <img src="https://media.giphy.com/media/JIX9t2j0ZTN9S/giphy.gif" width="300" />
</body>
</html>`;
}

module.exports = {
	activate,
	deactivate
}
