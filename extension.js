const { BANNED_EXTENSIONS, WHITE_LIST_EXTENSIONS } = require('./config');
const TIMEOUT = 15000;
const vscode = require('vscode');
const path = require('path');
const fs = require('fs');
const { checkCredentials, checkActivationStatus } = require('./password');

// Track last unlock time to provide grace period after password entry
let lastUnlockTime = 0;

// Status bar items for visual indication (left and right)
let statusBarItemLeft;
let statusBarItemRight;

// Track if exam mode is active (from remote server)
let isExamModeActive = true; // Default to true (fail-safe)

// Reference to webview provider for updating UI
let viewProviderInstance;

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

	// If exam mode is not active, skip blocking
	if (!isExamModeActive) {
		return;
	}

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

// Update UI based on exam mode status
function updateUIForMode(isActive) {
	if (isActive) {
		// EXAM MODE - Yellow/Red warnings
		statusBarItemLeft.text = "$(shield) EXAM MODE - Monitor Active";
		statusBarItemLeft.tooltip = "Extensions Monitor is active - AI extensions are blocked";
		statusBarItemLeft.backgroundColor = new vscode.ThemeColor('statusBarItem.warningBackground');
		statusBarItemLeft.show();

		statusBarItemRight.text = "$(eye) MONITORED";
		statusBarItemRight.tooltip = "This VSCode instance is being monitored for AI extensions";
		statusBarItemRight.backgroundColor = new vscode.ThemeColor('statusBarItem.errorBackground');
		statusBarItemRight.show();
	} else {
		// LECTURE MODE - Green, non-intrusive
		statusBarItemLeft.text = "$(book) LECTURE MODE";
		statusBarItemLeft.tooltip = "Extensions Monitor is in lecture mode - AI extensions allowed";
		statusBarItemLeft.backgroundColor = undefined;
		statusBarItemLeft.show();

		statusBarItemRight.hide();
	}

	// Update webview if available
	if (viewProviderInstance && viewProviderInstance._view) {
		viewProviderInstance.updateContent(isActive);
	}
}

/**
 * @param {vscode.ExtensionContext} context
 */
function activate(context) {

	// Create LEFT status bar item (initially hidden until status check completes)
	statusBarItemLeft = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left, 100);
	statusBarItemLeft.text = "$(sync~spin) Checking...";
	statusBarItemLeft.tooltip = "Checking extension monitor status...";
	statusBarItemLeft.show();
	context.subscriptions.push(statusBarItemLeft);

	// Create RIGHT status bar item (initially hidden)
	statusBarItemRight = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 100);
	context.subscriptions.push(statusBarItemRight);

	// Register action bar view
	viewProviderInstance = new MyViewProvider(context);
	context.subscriptions.push(
		vscode.window.registerWebviewViewProvider('extensions-monitor-view', viewProviderInstance)
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

	// Check activation status from remote server at startup
	checkActivationStatus()
		.then(isActive => {
			isExamModeActive = isActive;
			updateUIForMode(isActive);

			if (isActive) {
				writeToLogFile(process.logFilePath, "EXAM MODE activated\n");
				checkExtensions();
			} else {
				writeToLogFile(process.logFilePath, "LECTURE MODE - monitoring disabled\n");
			}
		})
		.catch(err => {
			console.error('Failed to check activation status:', err);
			// Default to exam mode on error (fail-safe)
			isExamModeActive = true;
			updateUIForMode(true);
			checkExtensions();
		});

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
		this.updateContent(isExamModeActive);
	}

	updateContent(isActive) {
		if (!this._view) return;

		if (isActive) {
			// EXAM MODE
			this._view.badge = {
				value: 1,
				tooltip: 'EXAM MODE - AI extensions blocked'
			};
			this._view.webview.html = `
				<html>
					<body style="background-color: #f44336; color: white; padding: 20px; text-align: center;">
						<h1>EXAM MODE</h1>
						<h2>Monitor Active</h2>
						<p>AI extensions are being blocked</p>
					</body>
				</html>
			`;
		} else {
			// LECTURE MODE
			this._view.badge = {
				value: 0,
				tooltip: 'Lecture Mode - AI extensions allowed'
			};
			this._view.webview.html = `
				<html>
					<body style="background-color: #2196F3; color: white; padding: 20px; text-align: center;">
						<h1>LECTURE MODE</h1>
						<h2>Monitor Inactive</h2>
						<p>AI extensions are allowed</p>
					</body>
				</html>
			`;
		}
	}
}


module.exports = {
	activate,
	deactivate
};
