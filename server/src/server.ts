import {
  createConnection,
  ProposedFeatures,
  TextDocuments,
  Diagnostic,
  DiagnosticSeverity,
  Connection
} from 'vscode-languageserver/node';

import { TextDocument } from 'vscode-languageserver-textdocument';

const connection = createConnection();
const documents: TextDocuments<TextDocument> = new TextDocuments(TextDocument);

connection.onInitialize(() => {
  return {
    capabilities: {
      textDocumentSync: 1
    }
  };
});

documents.onDidChangeContent(change => {
  validatePaintScript(change.document);
});

function validatePaintScript(doc: TextDocument) {
  const text = doc.getText();
  const diagnostics: Diagnostic[] = [];

  const lines = text.split(/\r?\n/);
  const nonComment = lines.filter(
    l => !l.trim().startsWith('//') && !l.trim().startsWith('/*')
  );

  if (!nonComment[0]?.startsWith('#PaintScript')) {
    diagnostics.push({
      severity: DiagnosticSeverity.Error,
      message: 'First non-comment line must be "#PaintScript {Version}".',
      range: {
        start: { line: 0, character: 0 },
        end: { line: 0, character: lines[0]?.length ?? 0 }
      }
    });
  }

  if (!nonComment[1]?.startsWith('#Sprite')) {
    diagnostics.push({
      severity: DiagnosticSeverity.Error,
      message: 'Second non-comment line must be "#Sprite {Sprite_Instance_Name}".',
      range: {
        start: { line: 1, character: 0 },
        end: { line: 1, character: lines[1]?.length ?? 0 }
      }
    });
  }

  connection.sendDiagnostics({ uri: doc.uri, diagnostics });
}

documents.listen(connection);
connection.listen();
