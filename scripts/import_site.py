"""Capture public, owner-authorized Space Oddity pages as a portable static site."""
from pathlib import Path
from lxml import html, etree
from urllib.parse import urljoin, urlsplit, unquote
from urllib.request import urlopen, Request
from concurrent.futures import ThreadPoolExecutor
import hashlib, json, re, shutil

ROOT = Path(__file__).resolve().parents[1]
SITE = ROOT / 'site'
ASSETS = SITE / 'assets'
ASSETS.mkdir(parents=True, exist_ok=True)
mapping = {}
failures = []

def register(url):
    url = urljoin('https://www.spaceoddity.xyz/', url)
    if url not in mapping:
        name = re.sub(r'[^a-zA-Z0-9._-]', '-', unquote(urlsplit(url).path.split('/')[-1]))[-100:] or 'asset'
        mapping[url] = 'assets/' + hashlib.sha256(url.encode()).hexdigest()[:12] + '-' + name
    return mapping[url]

def download(item):
    url, relative = item
    target = SITE / relative
    if target.exists(): return
    try:
        with urlopen(Request(url, headers={'User-Agent':'Mozilla/5.0'}), timeout=45) as response:
            target.write_bytes(response.read())
    except Exception as exc:
        failures.append({'url':url,'error':str(exc)})

docs = {}
for page in ['home','agency','films']:
    source = Path('/tmp/spaceoddity-' + page + '.html')
    shutil.copyfile(source, ROOT / 'source' / (page + '.html'))
    doc = html.fromstring(source.read_text())
    # Replace the proprietary platform runtime with a small static-site runtime.
    for node in doc.xpath('//script'):
        node.getparent().remove(node)
    for node in doc.xpath('//base | //link[@rel="preconnect"] | //link[@rel="alternate"]'):
        node.getparent().remove(node)
    for node in doc.xpath('//link[@rel="stylesheet" or @rel="icon"]'):
        node.set('href', '../' * (page != 'home') + register(node.get('href')))
    for node in doc.xpath('//img'):
        src = node.get('data-src') or node.get('src')
        if src:
            node.set('src', '../' * (page != 'home') + register(src))
            for attr in ['srcset','data-src','data-image','onload']:
                node.attrib.pop(attr,None)
            node.set('class', node.get('class','') + ' loaded')
    for node in doc.xpath('//a[@href]'):
        href = node.get('href')
        if href in ['/','/agency','/films']:
            node.set('href', ('../' if page != 'home' else './') + (href.strip('/') + '/' if href != '/' else ''))
    for node in doc.xpath('//*[@data-block-scripts or @data-block-css]'):
        node.attrib.pop('data-block-scripts',None)
        node.attrib.pop('data-block-css',None)
    head = doc.find('head')
    head.append(html.Element('link',rel='stylesheet',href=('../' if page != 'home' else '')+'assets/portable.css'))
    script = html.Element('script',src=('../' if page != 'home' else '')+'assets/portable.js',defer='defer')
    head.append(script)
    for node in doc.xpath('//meta[@name="viewport"]'):
        node.set('content','width=device-width, initial-scale=1')
    doc.set('data-static-page',page)
    docs[page] = doc

with ThreadPoolExecutor(max_workers=10) as pool:
    list(pool.map(download,list(mapping.items())))

# Vendor any files directly referenced by the original CSS.
for url, relative in list(mapping.items()):
    path = SITE / relative
    if path.suffix != '.css' or not path.exists(): continue
    css = path.read_text()
    def replace_url(match):
        value = match.group(1).strip('"\' ')
        if value.startswith('data:') or value.startswith('#'): return match.group(0)
        if (ASSETS / value).is_file(): return match.group(0)
        target_url = urljoin(url,value)
        return 'url("'+Path(register(target_url)).name+'")'
    path.write_text(re.sub(r'url\(([^)]+)\)',replace_url,css))
with ThreadPoolExecutor(max_workers=10) as pool:
    list(pool.map(download,list(mapping.items())))

for page, doc in docs.items():
    target = SITE / ('' if page == 'home' else page) / 'index.html'
    target.parent.mkdir(exist_ok=True)
    target.write_text('<!DOCTYPE html>\n'+html.tostring(doc,encoding='unicode'))
(ROOT / 'asset-manifest.json').write_text(json.dumps(mapping,indent=2))
(ROOT / 'download-errors.json').write_text(json.dumps(failures,indent=2))
(SITE / '.nojekyll').touch()
print(json.dumps({'pages':len(docs),'assets':len(mapping),'failures':failures},indent=2))
