const { BANNED_EXTENSIONS, WHITE_LIST_EXTENSIONS } = require('./config');
const TIMEOUT = 15000;
const vscode = require('vscode');
const path = require('path');
const fs = require('fs');
const { checkCredentials } = require('./password');

// Track last unlock time to provide grace period after password entry
let lastUnlockTime = 0;

// Status bar items for visual indication (left and right)
let statusBarItemLeft;
let statusBarItemRight;

// Function to write to the log file
const writeToLogFile = (logFilePath, message) => {
	try {
		fs.appendFile(logFilePath, `${new Date().toISOString()} - ${message}\n`, (err) => {
			if (err) {
				console.error('Failed to write to log file:', err);
			} else {
				// Do nothing
			}
		});
	} catch (error) {
		console.error('Failed to write to log file:', err);
	}
};

// Writes in a file the current date if this extension is installed
const logConfirmationExtensionIsInstalled = () => {

	const installedExtensions = vscode.extensions.all.map(ext => ext.id);

	const yourExtensionId = 'skanderturki.extensions-monitor';

	if (installedExtensions.includes(yourExtensionId)) {
		writeToLogFile(process.logFilePath, "Extension extensions-monitor exists on your IDE\n");
	}

}

// use Blocked list strategy only
const checkExtensions = () => {
	//checkWhitelistOnlyExtensions();
	//checkCopilotSettings();
	checkBlockedExtensions();
	logConfirmationExtensionIsInstalled();
}

const checkCopilotSettings = () => {
	const config = vscode.workspace.getConfiguration('github');
	if (config.get('copilot.enable')) {
		config.update('github.copilot.enable', false, vscode.ConfigurationTarget.Global)
			.then(() => {
				console.log('Github copilot disabled...');
			});
	}

}

// const checkWhitelistOnlyExtensions = () => {
// 	let isCurrentlyBlocked = process.context.globalState.get('isCurrentlyBlocked');
// 	if (isCurrentlyBlocked) {
// 		return;
// 	}

// 	const installedExtensions = vscode.extensions.all;

// 	// get IDE configured whitelist (initialized in package.json but can be changed by user)
// 	const whitelistExtensions = vscode.workspace.getConfiguration('monitoredExtensions').get('whiteList', []);

// 	for(let extension of installedExtensions){
// 		let notfound = true;
// 		if (! whitelistExtensions.includes(extension.id)) {
// 			// Check hard-coded whitelist (see config.js), these cannot be changed by user
// 			WHITE_LIST_EXTENSIONS.forEach(extensionID => {
// 				if ((extension.id.toLowerCase() === extensionID.toLowerCase()) || (extension.id.startsWith('vscode.'))){
// 					notfound = false;
// 				}
// 			})
// 		} else {
// 			notfound = false;
// 		}
// 		if (notfound) {
// 			process.context.globalState.update('isCurrentlyBlocked', true);
// 			promptForPassword(extension.id);
// 			return;
// 		}
// 	};
// }

const checkBlockedExtensions = () => {

	// If the editor is currently blocked we don't re-check,
	// the user has to enter password or re-start IDE
	let isCurrentlyBlocked = process.context.globalState.get('isCurrentlyBlocked');
	if (isCurrentlyBlocked) {
		return;
	}

	// Grace period: don't block immediately after instructor unlocks
	if (Date.now() - lastUnlockTime < TIMEOUT) {
		return;
	}
	// Get all installed extensions
	const installedExtensions = vscode.extensions.all;

	// Define extensions you want to block 
	// Warning: These can be removed from the IDE settings
	const blockedExtensions = vscode.workspace.getConfiguration('monitoredExtensions').get('blockedList', []);

	// Manually add some extensions to block so that they cannot be removed from the IDE settings

	// Check and block extensions
	try {
		for (let extension of installedExtensions) {
			let found = false;
			if (
				blockedExtensions.includes(extension.id.toLowerCase())
				|| ["copilot", "chatgpt", "gemini", "openai", "llama", "claude", "anthropic", "codeium", "tabnine", "cody", "amazon-q", "codewhisperer", "supermaven", "codegee", "phind", "gpt-4", "gpt4", "gpt-3", "gpt3", "ai-assist", "code-ai", "aicode", "ollama", "mistral", "codestral", "huggingface", "bard"].some(
					substring => extension.packageJSON.description.toLowerCase().includes(substring)
				)
				|| ["copilot", "chatgpt", "gemini", "openai", "llama", "claude", "anthropic", "codeium", "tabnine", "cody", "amazonq", "codewhisperer", "supermaven", "codegee", "phind", "ai-code", "aicode", "ollama", "mistral", "codestral", "huggingface", "bard", "cline", "aider", "refact", "continue"].some(
					substring => extension.id.toLowerCase().includes(substring)
				)
			) {
				found = true;
			}
			for (let blocked of BANNED_EXTENSIONS) {
				if (blocked.toLowerCase() === extension.id.toLowerCase()) {
					found = true;
					break;
				}
			};
			if (found) {
				process.context.globalState.update('isCurrentlyBlocked', true);
				promptForPassword(extension.id);
				return;
			}
		};
	}
	catch (e) {

	}

}

/**
 * @param {vscode.ExtensionContext} context
 */
function activate(context) {

	// Create LEFT status bar item with warning background (highly visible)
	statusBarItemLeft = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left, 100);
	statusBarItemLeft.text = "$(shield) EXAM MODE - Monitor Active";
	statusBarItemLeft.tooltip = "Extensions Monitor is active - AI extensions are blocked";
	statusBarItemLeft.backgroundColor = new vscode.ThemeColor('statusBarItem.warningBackground');
	statusBarItemLeft.show();
	context.subscriptions.push(statusBarItemLeft);

	// Create RIGHT status bar item with error background (red, highly visible)
	statusBarItemRight = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 100);
	statusBarItemRight.text = "$(eye) MONITORED";
	statusBarItemRight.tooltip = "This VSCode instance is being monitored for AI extensions";
	statusBarItemRight.backgroundColor = new vscode.ThemeColor('statusBarItem.errorBackground');
	statusBarItemRight.show();
	context.subscriptions.push(statusBarItemRight);

	// register action bar view
	const viewProvider = new MyViewProvider(context);
	context.subscriptions.push(
		vscode.window.registerWebviewViewProvider('extensions-monitor-view', viewProvider)
	);

	// Print in a file the date if this extension is still installed
	const homeDir = require('os').homedir();
	const desktopDir = `${homeDir}/Desktop/log`;
	if (!fs.existsSync(desktopDir)) {
		fs.mkdirSync(desktopDir);
	}
	process.logFilePath = path.join(desktopDir, 'extensions_log.txt');

	// Check unwanted extensions
	process.context = context;
	context.globalState.update('isCurrentlyBlocked', false);
	checkExtensions();

	const interval = setInterval(checkExtensions, TIMEOUT);

	context.subscriptions.push({
		dispose: () => {
			clearInterval(interval); // Clean up interval when the extension is deactivated
		}
	});
};

// This method is called when your extension is deactivated
function deactivate() {
	if (statusBarItemLeft) {
		statusBarItemLeft.dispose();
	}
	if (statusBarItemRight) {
		statusBarItemRight.dispose();
	}
};

function promptForPassword(extensionID) {
	// Show the password input box and block the UI
	vscode.window.showInputBox({
		title: `WARNING: ${extensionID} is a banned extension and should be removed from your IDE`,
		prompt: `You have installed extensions that are not allowed: ${extensionID}\n
		Please request from your instructor to unblock VSCode\n\n
		!!`,
		password: true,  // Makes the input field hidden for sensitive input
		placeHolder: 'Password'
	}).then((value) => {
		if (!value) {
			vscode.window.showErrorMessage('Missing credentials. Access denied.');
			// Optionally, you can re-prompt the user if the password is incorrect
			promptForPassword(extensionID); // Recursive call to keep asking for the correct password
		} else {
			let email = value.substring(0, value.indexOf('#'));
			let password = value.substring(value.indexOf('#') + 1, value.length);
			if (!email || !password) {
				vscode.window.showErrorMessage('Missing credentials. Access denied.');
				// Optionally, you can re-prompt the user if the password is incorrect
				promptForPassword(extensionID); // Recursive call to keep asking for the correct password
			} else {
				checkCredentials(email, password)
					.then(check => {
						if (check.authenticated && check.validity) {
							vscode.window.showInformationMessage('Password correct, access granted!');
							process.context.globalState.update('isCurrentlyBlocked', false);
							lastUnlockTime = Date.now(); // Set grace period
						} else {
							vscode.window.showErrorMessage('Invalid credentials. Access denied.');
							// Optionally, you can re-prompt the user if the password is incorrect
							promptForPassword(extensionID); // Recursive call to keep asking for the correct password
						}
					})
					.catch(err => {
						console.log(err);
						vscode.window.showErrorMessage(err);
						// Optionally, you can re-prompt the user if the password is incorrect
						promptForPassword(extensionID); // Recursive call to keep asking for the correct password
					})
			}
		}
	});
}

class MyViewProvider {
	resolveWebviewView(webviewView) {
		// Store reference to set badge
		this._view = webviewView;

		// Set badge on activity bar icon (shows "ON" indicator)
		webviewView.badge = {
			value: 1,
			tooltip: 'Exam Monitor is ACTIVE'
		};

		// Define the HTML content of the webview
		webviewView.webview.html = `
			<html>
				<body style="background-color: #4CAF50; color: white; padding: 20px; text-align: center;">
					<h1>EXAM MODE</h1>
					<h2>Monitor Active</h2>
					<p>AI extensions are being blocked</p>
				</body>
			</html>
		`;
	}
}


module.exports = {
	activate,
	deactivate
};
