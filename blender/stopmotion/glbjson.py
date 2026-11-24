import json, struct, sys
def info(path):
    b = open(path, 'rb').read()
    ln = struct.unpack_from('<I', b, 12)[0]
    j = json.loads(b[20:20+ln])
    names = sorted(n.get('name','') for n in j.get('nodes', []))
    return dict(size=len(b), nodes=len(j.get('nodes',[])), meshes=len(j.get('meshes',[])), materials=len(j.get('materials',[])),
                images=len(j.get('images',[])), cameras=len(j.get('cameras',[])), exts=j.get('extensionsUsed'), anims=len(j.get('animations',[])),
                lights=len(j.get('extensions',{}).get('KHR_lights_punctual',{}).get('lights',[])), names=names,
                attrs=sorted({k for m in j.get('meshes',[]) for p in m['primitives'] for k in p['attributes']}), gen=j['asset'].get('generator'))
a = info(sys.argv[1])
if len(sys.argv) > 2:
    b = info(sys.argv[2])
    for k in a:
        if k != 'names': print(k, a[k], '|', b[k])
    sa, sb = set(a['names']), set(b['names'])
    print("only_in_old", sorted(sa - sb)[:30]); print("only_in_new", sorted(sb - sa)[:30])
else:
    print({k: v for k, v in a.items() if k != 'names'}); print([n for n in a['names'] if 'Sign_Pixel' in n or 'Cam' in n][:20])
