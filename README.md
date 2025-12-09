# Extensions Monitor

A VSCode extension designed for academic environments to monitor and block AI-assisted coding extensions during exams and technical assessments.

## Overview

Extensions Monitor helps educators and exam proctors ensure academic integrity by detecting and blocking AI coding assistants such as GitHub Copilot, ChatGPT extensions, Claude, Codeium, and 100+ other AI tools.

**Important**: This extension requires a subscription. Do not install it without proper credentials, as it will block your IDE until unlocked by an instructor.

## Features

### AI Extension Detection
- **Hardcoded blocklist**: 100+ AI extensions that cannot be bypassed through settings
- **Keyword detection**: Automatically detects extensions containing AI-related keywords in their ID or description (copilot, chatgpt, claude, codeium, tabnine, etc.)
- **Configurable lists**: Additional blocked/whitelisted extensions can be configured via VSCode settings

### Visual Indicators
The extension provides multiple visual cues so instructors can quickly verify it's active:

- **Left Status Bar** (Yellow): Shows "EXAM MODE - Monitor Active"
- **Right Status Bar** (Red): Shows "MONITORED"
- **Activity Bar Icon**: Green shield with badge indicator
- **Sidebar Panel**: Green panel displaying "EXAM MODE" status

### Password-Protected Unlock
When a blocked extension is detected:
1. A password prompt appears blocking normal IDE usage
2. Instructors can unlock using their credentials (format: `email#password`)
3. After unlock, a 15-second grace period prevents immediate re-prompting
4. Credentials are verified against a secure backend

### Remote Activation Control
Administrators can remotely activate/deactivate the extension across all machines:

- **EXAM MODE** (Active): AI extensions are blocked, yellow/red status bars shown
- **LECTURE MODE** (Inactive): AI extensions allowed, blue status bar shown

The activation status is checked once at VSCode startup from a Google Sheet, allowing centralized control over all student machines.

### Activity Logging
- Logs extension monitoring activity to `~/Desktop/log/extensions_log.txt`
- Tracks when the extension is active on the IDE
- Logs mode changes (EXAM MODE / LECTURE MODE)

## Installation

1. Install the extension from the VSCode Marketplace or from a `.vsix` file
2. Restart VSCode
3. The extension activates automatically on startup

## Configuration

### Settings

Access settings via `File > Preferences > Settings` and search for "monitoredExtensions":

```json
{
  "monitoredExtensions.blockedList": [
    "some.extension-id"
  ],
  "monitoredExtensions.whiteList": [
    "allowed.extension-id"
  ]
}
```

**Note**: The hardcoded blocklist in `config.js` cannot be modified through settings, ensuring AI extensions remain blocked.

### Blocked Extensions

The following categories of AI extensions are blocked:

| Category | Examples |
|----------|----------|
| GitHub Copilot | `github.copilot`, `github.copilot-chat` |
| Claude/Anthropic | `saoudrizwan.claude-dev`, `cline.cline` |
| Codeium | `codeium.codeium`, `codeium.windsurf` |
| Amazon Q | `aws.amazon-q-vscode` |
| Sourcegraph Cody | `sourcegraph.cody-ai` |
| Tabnine | `tabnine.tabnine-vscode` |
| ChatGPT | `gencay.vscode-chatgpt`, `timkmecl.chatgpt` |
| Continue.dev | `continue.continue` |
| Supermaven | `supermaven.supermaven` |
| And 90+ more... | See `config.js` for full list |

## Use Cases

- **Academic Exams**: Prevent students from using AI assistance during coding exams
- **Technical Interviews**: Ensure candidates demonstrate their own skills
- **Certification Tests**: Maintain integrity of technical certifications
- **Classroom Exercises**: Focus on learning fundamentals without AI shortcuts

## For Instructors

### Verifying Installation
Look for these visual indicators:
1. Yellow status bar item on the left showing "EXAM MODE"
2. Red status bar item on the right showing "MONITORED"
3. Green shield icon in the activity bar with a badge

### Unlocking the IDE
If a student needs temporary access (e.g., to uninstall a blocked extension):
1. Enter credentials in the format: `email#password`
2. The IDE will be unlocked for 15 seconds
3. During this grace period, the student can modify their extensions

### Remote Activation Setup
To enable remote activation control via Google Sheets:

1. Create a "Settings" sheet in your Google Spreadsheet
2. Add a boolean value (`TRUE` or `FALSE`) in cell B1
3. Add this `doGet` function to your Google Apps Script:

```javascript
function doGet(e) {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Settings");
  var status = sheet.getRange("B1").getValue();

  return ContentService
    .createTextOutput(JSON.stringify({ isActive: status === true }))
    .setMimeType(ContentService.MimeType.JSON);
}
```

4. Deploy the script as a web app
5. Set B1 to `TRUE` for exam mode, `FALSE` for lecture mode

**Note**: Students must restart VSCode to pick up activation changes.

## Requirements

- VSCode version 1.73.0 or higher
- Active subscription for credential verification

## Known Limitations

- The blocking mechanism uses VSCode's input box which can be dismissed (ESC key)
- Students could potentially use a different IDE or code editor
- Extensions installed after the check interval (15 seconds) won't be detected until the next cycle

## Release Notes

### 1.10.0
- Fixed webview panel not displaying content
- Added webview type declaration in package.json
- Added proper HTML DOCTYPE and meta tags
- Enabled scripts in webview options

### 1.9.0
- Enhanced sidebar panel with detailed status information
- Added SVG icons for EXAM/LECTURE modes
- Added feature list with icons explaining current restrictions
- Improved visual styling with status badges

### 1.8.0
- Updated Google Apps Script deployment URL

### 1.7.0
- Added remote activation control via Google Sheets
- New EXAM MODE / LECTURE MODE toggle
- Status checked at VSCode startup
- Updated UI: red sidebar for exam mode, blue for lecture mode
- Improved README with setup instructions

### 1.6.0
- Improved README documentation

### 1.5.0
- Added dual status bar indicators (left yellow, right red)
- Added activity bar badge indicator
- Added green sidebar panel
- Expanded AI extension blocklist to 100+ extensions
- Added keyword detection for Claude, Anthropic, Codeium, Tabnine, etc.
- Fixed Google Apps Script authentication
- Added 15-second grace period after unlock
- Updated minimum VSCode version to 1.73.0

### 1.0.0
- Initial release with basic extension monitoring
- GitHub Copilot and ChatGPT blocking
- Password-protected unlock feature

## License

Commercial License - See LICENSE.md for details.

## Repository

[https://github.com/skanderturki/extensions-monitor](https://github.com/skanderturki/extensions-monitor)

## Support

For issues and feature requests, please visit the [GitHub Issues](https://github.com/skanderturki/extensions-monitor/issues) page.
