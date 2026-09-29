import { cpSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
const root = new URL('../', import.meta.url);
for (const client of ['claude', 'cursor', 'openclaw']) {
  cpSync(fileURLToPath(new URL('plugins/tastefulkit/skills', root)),
    fileURLToPath(new URL(`integrations/${client}/tastefulkit/skills`, root)), {recursive: true});
}
