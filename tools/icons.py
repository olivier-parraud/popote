import asyncio
from playwright.async_api import async_playwright
svg=open("/home/claude/popote/src/icon.svg").read()
async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch(executable_path="/usr/bin/google-chrome", args=["--no-sandbox"])
        for size,name in [(512,"icon-512.png"),(192,"icon-192.png"),(180,"apple-touch-icon.png")]:
            pg = await b.new_page(viewport={"width":size,"height":size})
            s = svg.replace('rx="112"', 'rx="0"') if name=="apple-touch-icon.png" else svg
            await pg.set_content(f'<html><body style="margin:0;background:transparent">{s.replace("<svg ", f"<svg width=\"{size}\" height=\"{size}\" ")}</body></html>')
            await pg.screenshot(path=f"/home/claude/popote/dist/installable/{name}", omit_background=True)
            await pg.close()
        await b.close()
asyncio.run(main())
