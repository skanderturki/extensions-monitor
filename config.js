// Here add the identifiers of the extensions to block, these cannot be removed from the IDE settings
const BANNED_EXTENSIONS = [
  // GitHub Copilot
  'github.copilot',
  'github.copilot-chat',
  'github.copilot-labs',
  'github.copilot-nightly',

  // Claude / Anthropic
  'anthropic.claude-vscode',
  'anthropics.claude',
  'saoudrizwan.claude-dev',
  'cline.cline',
  'rooveterinaryinc.roo-cline',
  'kodu-ai.claude-coder-agent',
  'kodu-ai.kodu-coder-agent',
  'claudedev.claude',

  // Codeium
  'codeium.codeium',
  'codeium.codeium-enterprise',
  'codeium.windsurf',

  // Amazon Q / CodeWhisperer
  'amazonwebservices.aws-toolkit-vscode',
  'amazonwebservices.amazon-q-vscode',
  'aws.amazon-q-vscode',
  'aws.toolkit-vscode',

  // Sourcegraph Cody
  'sourcegraph.cody-ai',
  'sourcegraph.sourcegraph',

  // Continue.dev
  'continue.continue',

  // Cursor (related extensions)
  'anysphere.cursor',
  'cursor.cursor',

  // Tabnine
  'tabnine.tabnine-vscode',
  'tabnine.tabnine-vscode-enterprise',

  // ChatGPT extensions
  'gencay.vscode-chatgpt',
  'genieai.chatgpt-vscode',
  'timkmecl.chatgpt',
  'timkmecl.codegpt3',
  'kiranshah.chatgpt-helper',
  'easycodeai.chatgpt-gpt4-gpt3-vscode',
  'feiskyer.chatgpt-copilot',
  'yalehuang.chatgpt-ai',
  'whensunset.chatgpt-china',
  'handms.handgpt',
  'danielsanmedium.dscodegpt',
  'taldennis-unfoldai-chatgpt-copilot.unfoldai',

  // Blackbox AI
  'blackboxapp.blackbox',
  'blackboxapp.blackboxagent',

  // CodeGeeX
  'aminer.codegeex',
  'codegeex.codegeex',

  // Supermaven
  'supermaven.supermaven',

  // Phind
  'phind.phind',

  // Pieces
  'meshintelligenttechnologiesinc.pieces-vscode',

  // Replit AI
  'replit.replit',

  // Refact.ai
  'smallcloudai.refact',

  // Qodo (formerly Codium AI - different from Codeium)
  'codium.codium',
  'qodo-ai.qodo-gen',

  // Mintlify
  'mintlify.document',
  'mintlify.mintlify',

  // Aider
  'aider.aider',
  'paul-gauthier.aider',

  // Mutable AI
  'mutableai.mutableai',

  // AI Commit / Git AI
  'vivaxy.vscode-conventional-commits-ai',
  'aikeyboardsmith.aicommits',
  'carlrobertoh.openai-commit',

  // Other Copilot variants
  'ai-copilot.genz-copilot',
  'aicopilot.ai-copilot',
  'badboy17g.clara-copilot',
  'freshworksmarketplace.freddy-copilot',
  'optexity.optexitycopilot',
  'youai.vscode-copilot',
  'parallel-universe.gpt-copilot',
  'rickyang.ocopilot',
  'vidyutdatalabs.neocopilot',
  'wuweinero.mini-ai-pilot',
  'zhaoo.catgpt-copilot',
  'tencent-cloud.coding-copilot',
  'ghostcode.apex-copilot',

  // Other AI assistants
  'bito.bito',
  'fittentech.fitten-code',
  'gocodeo.gocodeo',
  'metabob.metabob',
  'michaelnugent.ai-context-manager',
  'purecodeai.purecode-ai',
  'sixth.sixth',
  'visualstudioexptteam.vscodeintellicode',
  'welltestedai.fluttergpt',
  'aruna-labs.mode',
  'jianxiyan.talkx',
  'rjmacarthy.twinny',
  'rubberduck.rubberduck-vscode',

  // Mistral / Codestral
  'mistralai.mistral-vscode',
  'codestral.codestral',

  // Ollama / Local LLMs
  'ollama.ollama-vscode',
  'mattflower.ollama',
  'continue.continue',

  // Hugging Face
  'huggingface.huggingface-vscode',

  // Google AI
  'google.cloud-code',
  'googlecloudtools.cloudcode'
];

// Here add the identifiers of the extensions to allow, these cannot be removed from the IDE settings
const WHITE_LIST_EXTENSIONS = [
  'Wscats.html-snippets',
  'christian-kohler.npm-intellisense',
  'cmstead.js-codeformer',
  'cweijan.dbclient-jdbc',
  'cweijan.vscode-mysql-client2',
  'dbaeumer.vscode-eslint',
  'dbaeumer.vscode-eslint',
  'ecmel.vscode-html-css',
  'ecmel.vscode-html-css',
  'esbenp.prettier-vscode',
  'formulahendry.vscode-mysql',
  'mongodb.mongodb-vscode',
  'ms-azuretools.vscode-docker',
  'ms-python.python',
  'ms-python.python',
  'ms-python.vscode-pylance',
  'ms-python.vscode-pylance',
  'ms-toolsai.jupyter',
  'ms-toolsai.jupyter-keymap',
  'ms-vscode-remote.remote-wsl',
  'ms-vscode.cmake-tools',
  'ms-vscode.cpptools',
  'ms-vscode.cpptools-themes',
  'ms-vscode.js-debug',
  'ms-vscode.js-debug-companion',
  'ms-vscode.live-server',
  'ms-vscode.vscode-js-profile-table',
  'ms-vscode.vscode-typescript-next',
  'mtxr.sqltools-driver-mysql',
  'negokaz.live-server-preview',
  'numso.prettier-standard-vscode',
  'oracle.oracle-java',
  'rangav.vscode-thunder-client',
  'redhat.java',
  'redhat.vscode-xml',
  'redhat.vscode-xml',
  'ritwickdey.liveserver',
  'skanderturki.extensions-monitor',
  'skanderturki.html-snippets-ska',
  'standard.vscode-standard',
  'twxs.cmake',
  'vscjava.vscode-java-debug',
  'vscjava.vscode-maven',
  'xabikos.JavaScriptSnippets',
  'yandeu.five-server',
  'zainchen.json'
];

module.exports = { BANNED_EXTENSIONS, WHITE_LIST_EXTENSIONS };