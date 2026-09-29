"""Offline package contracts and cross-client drift checks (Python 3.11+)."""
import json
from pathlib import Path
import re
import tomllib

ROOT = Path(__file__).resolve().parents[1]
URL = 'https://tastefulkit.com/mcp/'


def read(path):
    return json.loads((ROOT / path).read_text())


def check():
    files = list(ROOT.rglob('*.json'))
    for path in files:
        if '.git' not in path.parts:
            json.loads(path.read_text())
    manifests = [
        ('plugins/tastefulkit', '.codex-plugin/plugin.json'),
        ('integrations/claude/tastefulkit', '.claude-plugin/plugin.json'),
        ('integrations/cursor/tastefulkit', '.cursor-plugin/plugin.json'),
        ('integrations/openclaw/tastefulkit', 'plugin.json'),
    ]
    canonical = ROOT / 'plugins/tastefulkit/skills/tastefulkit'
    expected = {str(p.relative_to(canonical)): p.read_bytes() for p in canonical.rglob('*') if p.is_file()}
    skill = (canonical / 'SKILL.md').read_text()
    assert skill.startswith('---\nname: tastefulkit\ndescription: ')
    assert all(name in skill for name in ['list_designs','search_designs','get_design','get_design_filters','get_user_info'])
    for base, manifest in manifests:
        value = read(f'{base}/{manifest}')
        assert value['name'] == 'tastefulkit' and value['version'] == '0.1.0'
        assert value['author']['name'] == 'LVTD, LLC'
        assert value['repository'] == 'https://github.com/LVTD-LLC/tastefulkit-skills'
        for field in ['skills', 'mcpServers']:
            if field in value:
                path = value[field]
                assert path.startswith('./') and '..' not in Path(path).parts
                assert (ROOT / base / path).exists(), path
        actual = ROOT / base / 'skills/tastefulkit'
        assert expected == {str(p.relative_to(actual)): p.read_bytes() for p in actual.rglob('*') if p.is_file()}, base
        mcp = read(f'{base}/' + ('mcp.json' if 'openclaw' in base else '.mcp.json'))['mcpServers']['tastefulkit']
        assert mcp['url'] == URL
        if 'plugins/' == base[:8]:
            assert mcp['bearer_token_env_var'] == 'TASTEFULKIT_API_KEY'
            assert 'headers' not in mcp and mcp['type'] == 'http'
        else:
            assert mcp['headers'] == {'Authorization':'Bearer ${TASTEFULKIT_API_KEY}'}
            assert mcp['type'] == ('streamable-http' if 'openclaw' in base else 'http')
    for catalog in ['.agents/plugins/marketplace.json','.claude-plugin/marketplace.json','.cursor-plugin/marketplace.json']:
        value=read(catalog)
        assert value['name']=='tastefulkit'
        for entry in value['plugins']:
            source=entry['source'];path=source['path'] if isinstance(source,dict) else source
            assert path.startswith('./') and '..' not in Path(path).parts
            assert (ROOT/path).is_dir()
    cursor=read('integrations/cursor/tastefulkit/.cursor-plugin/plugin.json')
    assert cursor['variables']['required']==['TASTEFULKIT_API_KEY']
    opencode=read('examples/opencode.json')['mcp']['tastefulkit']
    assert opencode['url']==URL and opencode['oauth'] is False
    assert opencode['headers']['Authorization']=='Bearer {env:TASTEFULKIT_API_KEY}'
    codex=tomllib.loads((ROOT/'examples/codex.toml').read_text())['mcp_servers']['tastefulkit']
    assert codex['url']==URL and codex['bearer_token_env_var']=='TASTEFULKIT_API_KEY'
    # Verify local Markdown links stay resolvable; remote links are checked separately.
    for path in [ROOT/'README.md',* (ROOT/'docs').glob('*.md')]:
        for target in re.findall(r'\]\(([^)]+)\)',path.read_text()):
            if '://' not in target and not target.startswith('#'):
                assert (path.parent/target.split('#')[0]).exists(), (path,target)
    print(f'PASS: {len(manifests)} package contracts, synchronized skills, catalogs, auth syntax and local documentation links.')


if __name__ == '__main__':
    check()
