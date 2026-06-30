// One-off: unpack the standalone Roster HTML bundle into ./roster-extracted/
// so we can read the actual design files. Mirrors the in-browser decoder.

const fs = require('fs');
const path = require('path');
const zlib = require('zlib');

const SRC = path.resolve(__dirname, 'Roster RMS _standalone_.html');
const OUT = path.resolve(__dirname, 'roster-extracted');

const html = fs.readFileSync(SRC, 'utf8');

function extractTagContent(re) {
  const m = re.exec(html);
  if (!m) throw new Error('Bundle section not found: ' + re);
  return m[1];
}

const manifestJSON = extractTagContent(
  /<script type="__bundler\/manifest">([\s\S]*?)<\/script>/
);
const templateJSON = extractTagContent(
  /<script type="__bundler\/template">([\s\S]*?)<\/script>/
);
const extResJSON = (() => {
  const m = /<script type="__bundler\/ext_resources">([\s\S]*?)<\/script>/.exec(html);
  return m ? m[1] : '[]';
})();

const manifest = JSON.parse(manifestJSON);
let template = JSON.parse(templateJSON);
const extResources = JSON.parse(extResJSON);

fs.mkdirSync(OUT, { recursive: true });

const uuids = Object.keys(manifest);
console.log('Decoding', uuids.length, 'assets…');

const filenameMap = {};
// ext_resources has [{ uuid, id (relative path), ... }] — use id as filename
for (const r of extResources) filenameMap[r.uuid] = r.id;

let idx = 0;
for (const uuid of uuids) {
  const entry = manifest[uuid];
  let bytes = Buffer.from(entry.data, 'base64');
  if (entry.compressed) {
    bytes = zlib.gunzipSync(bytes);
  }

  // Pick a filename
  let name = filenameMap[uuid];
  if (!name) {
    const ext =
      entry.mime?.includes('javascript') ? 'js' :
      entry.mime?.includes('css') ? 'css' :
      entry.mime?.includes('html') ? 'html' :
      entry.mime?.includes('json') ? 'json' :
      entry.mime?.includes('image/png') ? 'png' :
      entry.mime?.includes('image/jpeg') ? 'jpg' :
      'bin';
    name = `asset-${++idx}.${ext}`;
  } else {
    // Avoid leading slash and ".." traversal
    name = name.replace(/^\/+/, '').replace(/\.\./g, '__');
  }

  const dest = path.join(OUT, name);
  fs.mkdirSync(path.dirname(dest), { recursive: true });
  fs.writeFileSync(dest, bytes);

  // Replace UUIDs in template with relative file paths so the HTML works
  template = template.split(uuid).join(name);
}

fs.writeFileSync(path.join(OUT, 'index.html'), template);
console.log('Wrote', uuids.length + 1, 'files to', OUT);
