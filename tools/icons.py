# Génère les icônes de l'appli à partir de src/b/icon.svg
import asyncio, sys
from playwright.async_api import async_playwright
svg = open("/home/claude/popote/src/b/icon.svg").read()
out = sys.argv[1] if len(sys.argv) > 1 else "/home/claude/popote/dist/installable"
async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch()
        for size, name, square in [(512,"icon-512.png",False),(192,"icon-192.png",False),(512,"icon-maskable.png",True),(180,"apple-touch-icon.png",True)]:
            pg = await b.new_page(viewport={"width":size,"height":size})
            s = svg.replace('rx="112"', 'rx="0"') if square else svg
            s = s.replace("<svg ", f'<svg width="{size}" height="{size}" ')
            await pg.set_content(f'<html><body style="margin:0;background:transparent">{s}</body></html>')
            await pg.screenshot(path=f"{out}/{name}", omit_background=True)
            await pg.close()
        await b.close()
asyncio.run(main())
