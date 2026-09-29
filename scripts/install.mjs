#!/usr/bin/env node
// Project-local, additive installation. Never reads or writes credentials.
import { existsSync, lstatSync, mkdirSync, readFileSync, writeFileSync, cpSync } from 'node:fs';
import { resolve, dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { isDeepStrictEqual } from 'node:util';
const root = fileURLToPath(new URL('../', import.meta.url));
const clients = {
  opencode: {config:'opencode.json', example:'opencode.json', key:'mcp', skill:'.opencode/skills/tastefulkit'},
  cursor: {config:'.cursor/mcp.json', example:'cursor-mcp.json', key:'mcpServers', skill:'.cursor/skills/tastefulkit'},
};
export function install(client, project) {
  const spec=clients[client];
  if (!spec) throw new Error('Choose cursor or opencode. See README for native plugin clients.');
  const target=resolve(project);
  if (!existsSync(target) || !lstatSync(target).isDirectory()) throw new Error('Project directory must already exist.');
  const config=join(target,spec.config), skill=join(target,spec.skill);
  for (const dest of [config,skill]) {
    let path=dest;
    while (path !== target) {
      let stat;
      try { stat=lstatSync(path); } catch (error) { if (error.code!=='ENOENT') throw error; }
      if (stat?.isSymbolicLink()) throw new Error('Refusing a symlinked destination.');
      path=dirname(path);
    }
  }
  // Do not shadow an OpenCode JSONC config; merge it manually instead.
  if (client==='opencode' && existsSync(join(target,'opencode.jsonc'))) throw new Error('Existing opencode.jsonc: merge examples/opencode.json manually.');
  let previous={};
  if (existsSync(config)) {
    try { previous=JSON.parse(readFileSync(config,'utf8')); }
    catch { throw new Error('Existing configuration is not strict JSON. Merge the example manually; nothing changed.'); }
  }
  if (!previous || Array.isArray(previous) || typeof previous!=='object') throw new Error('Existing configuration must be an object.');
  if (previous[spec.key]!==undefined && (!previous[spec.key] || Array.isArray(previous[spec.key]) || typeof previous[spec.key]!=='object')) throw new Error('Invalid existing MCP configuration.');
  const example=JSON.parse(readFileSync(join(root,'examples',spec.example),'utf8'));
  const desired=example[spec.key].tastefulkit;
  const existing=previous[spec.key]?.tastefulkit;
  if (existing!==undefined && !isDeepStrictEqual(existing,desired)) throw new Error('TastefulKit is already configured differently; nothing changed.');
  const source=join(root,'plugins/tastefulkit/skills/tastefulkit');
  // Refuse all skill replacement: a repeated install is safe but explicit.
  if (existsSync(skill)) throw new Error('TastefulKit skill already exists; review updates manually. Nothing changed.');
  const next={...previous,[spec.key]:{...previous[spec.key],tastefulkit:desired}};
  mkdirSync(dirname(skill),{recursive:true});
  cpSync(source,skill,{recursive:true,errorOnExist:true,force:false});
  mkdirSync(dirname(config),{recursive:true});
  writeFileSync(config,JSON.stringify(next,null,2)+'\n');
  return {config,skill};
}
if (process.argv[1] && resolve(process.argv[1])===fileURLToPath(import.meta.url)) {
  try {
    const [, , client, project]=process.argv;
    if (!client || !project || process.argv.length!==4) throw new Error('Usage: node scripts/install.mjs <cursor|opencode> /path/to/project');
    const result=install(client,project);
    console.log(`Installed skill and MCP config: ${result.skill}, ${result.config}`);
    console.log('Provide TASTEFULKIT_API_KEY privately in the client environment, then restart the client.');
  } catch (error) { console.error(error.message); process.exitCode=1; }
}
