"""Read-only live check. Run: uv run --with 'mcp>=1.26,<2' python scripts/smoke_mcp.py."""
import asyncio
import json
import os

import httpx
from mcp import ClientSession
from mcp.client.streamable_http import streamable_http_client

EXPECTED = {'list_designs', 'search_designs', 'get_design', 'get_design_filters', 'get_user_info'}


def data(result):
    if result.isError:
        raise RuntimeError('MCP tool returned an error (body omitted).')
    if result.structuredContent is not None:
        return result.structuredContent
    return json.loads(next(block.text for block in result.content if block.type == 'text'))


async def main():
    key = os.environ.get('TASTEFULKIT_API_KEY')
    if not key:
        raise RuntimeError('Set TASTEFULKIT_API_KEY privately in the process environment.')
    async with httpx.AsyncClient(headers={'Authorization': f'Bearer {key}'}, timeout=30) as http:
        async with streamable_http_client('https://tastefulkit.com/mcp/', http_client=http) as (read, write, _):
            async with ClientSession(read, write) as session:
                await session.initialize()
                tools = await session.list_tools()
                names = {tool.name for tool in tools.tools}
                assert EXPECTED <= names, 'Expected tools are missing'
                assert all(tool.annotations and tool.annotations.readOnlyHint for tool in tools.tools if tool.name in EXPECTED)
                data(await session.call_tool('get_user_info', {}))
                data(await session.call_tool('get_design_filters', {}))
                listing = data(await session.call_tool('list_designs', {'page': 1}))
                data(await session.call_tool('search_designs', {'q': 'minimal', 'page': 1}))
                if not listing['items']:
                    raise RuntimeError('No designs available: detail check could not run.')
                detail = data(await session.call_tool('get_design', {'design_id': str(listing['items'][0]['id'])}))
                assert 'design_markdown' in detail, 'Missing guide field'
                print('PASS: initialize, tool discovery, read-only annotations, and all five tools. No account data printed.')


if __name__ == '__main__':
    try:
        asyncio.run(asyncio.wait_for(main(), timeout=90))
    except Exception:
        # Transport exceptions can include request metadata. Never print them.
        print('FAIL: MCP smoke check did not complete. Check key, network, and current server contract privately.')
        raise SystemExit(1) from None
