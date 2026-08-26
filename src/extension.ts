import * as vscode from 'vscode';
import * as path from 'path';
import {
  LanguageClient,
  LanguageClientOptions,
  ServerOptions,
  TransportKind
} from 'vscode-languageclient/node';

let client: LanguageClient | undefined;

export function activate(context: vscode.ExtensionContext) {
  // Keep Hello World command if you like
  const helloWorld = vscode.commands.registerCommand('paintscript.helloWorld', () => {
    vscode.window.showInformationMessage('Hello from PaintScript!');
  });
  context.subscriptions.push(helloWorld);

  // Command to manually activate language server (optional)
  const activateServerCmd = vscode.commands.registerCommand(
    'paintscript.activate_language_server',
    () => {
      startLanguageServer(context);
    }
  );
  context.subscriptions.push(activateServerCmd);

  // Auto-start when a PaintScript file is opened
  startLanguageServer(context);
}

function startLanguageServer(context: vscode.ExtensionContext) {
  if (client) {
    return; // already started
  }

  const serverModule = context.asAbsolutePath(
    path.join('out', 'server', 'server.js')
  );

  const serverOptions: ServerOptions = {
    run: { module: serverModule, transport: TransportKind.stdio },
    debug: { module: serverModule, transport: TransportKind.stdio }
  };

  const clientOptions: LanguageClientOptions = {
    documentSelector: [{ language: 'paintscript', scheme: 'file' }]
  };

  client = new LanguageClient(
    'paintscriptLanguageServer',
    'PaintScript Language Server',
    serverOptions,
    clientOptions
  );

  client.start();
}

export function deactivate(): Thenable<void> | undefined {
  if (!client) {
    return undefined;
  }
  return client.stop();
}
