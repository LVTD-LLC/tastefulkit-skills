import {test} from 'node:test';
import assert from 'node:assert/strict';
import {mkdtempSync,readFileSync,writeFileSync,mkdirSync,symlinkSync,existsSync,rmSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {install} from './install.mjs';
function fixture(t) {const p=mkdtempSync(join(tmpdir(),'tastefulkit-test-'));t.after(()=>rmSync(p,{recursive:true,force:true}));return p;}
for (const client of ['cursor','opencode']) test(`${client}: adds skill and correct MCP auth without losing unrelated config`,t=>{
 const p=fixture(t); const dir=client==='cursor'?join(p,'.cursor'):p;mkdirSync(dir,{recursive:true});
 const config=join(dir,client==='cursor'?'mcp.json':'opencode.json');const key=client==='cursor'?'mcpServers':'mcp';
 writeFileSync(config,JSON.stringify({theme:'keep',[key]:{other:{url:'https://example.com'}}}));
 const result=install(client,p);const value=JSON.parse(readFileSync(config));
 assert.equal(value.theme,'keep');assert.equal(value[key].other.url,'https://example.com');
 assert.equal(value[key].tastefulkit.url,'https://tastefulkit.com/mcp/');
 assert.equal(value[key].tastefulkit.headers.Authorization,client==='cursor'?'Bearer ${env:TASTEFULKIT_API_KEY}':'Bearer {env:TASTEFULKIT_API_KEY}');
 assert.ok(existsSync(join(result.skill,'SKILL.md')));
 const before=readFileSync(config,'utf8');assert.throws(()=>install(client,p),/already exists/);assert.equal(readFileSync(config,'utf8'),before);
});
test('conflicting server leaves skill and configuration untouched',t=>{
 const p=fixture(t);const c=join(p,'opencode.json');writeFileSync(c,'{"mcp":{"tastefulkit":{"url":"https://example.com"}}}');const before=readFileSync(c,'utf8');
 assert.throws(()=>install('opencode',p),/differently/);assert.equal(readFileSync(c,'utf8'),before);assert.ok(!existsSync(join(p,'.opencode')));
});
test('JSONC configuration is not shadowed or overwritten',t=>{
 const p=fixture(t);writeFileSync(join(p,'opencode.jsonc'),'// custom config');assert.throws(()=>install('opencode',p),/jsonc/);assert.ok(!existsSync(join(p,'opencode.json')));
});
test('malformed config fails before creating skill',t=>{
 const p=fixture(t);writeFileSync(join(p,'opencode.json'),'{broken');assert.throws(()=>install('opencode',p),/strict JSON/);assert.ok(!existsSync(join(p,'.opencode')));
});
test('symlinked destination is refused',t=>{
 const p=fixture(t),other=fixture(t);symlinkSync(other,join(p,'.cursor'),'dir');assert.throws(()=>install('cursor',p),/symlink/);assert.ok(!existsSync(join(other,'mcp.json')));
});
test('dangling config symlink cannot write outside the project',t=>{
 const p=fixture(t),other=fixture(t);symlinkSync(join(other,'new.json'),join(p,'opencode.json'));
 assert.throws(()=>install('opencode',p),/symlink/);assert.ok(!existsSync(join(other,'new.json')));
});
