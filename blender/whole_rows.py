"""
Each section owns a whole row (matches client/src/data/storeLayout.ts):
- display pedestals spread from x = ±1.8/±5.4 to x = ±2.8/±8.4
- the section's hanging sign becomes a wide banner over the row

  blender -b pixel_vault_store.blend --python whole_rows.py
"""
import bpy

X_MAP = {-5.4: -8.4, -1.8: -2.8, 1.8: 2.8, 5.4: 8.4}
for o in bpy.data.objects:
    if o.name.startswith("Display_") and o.parent is None:
        x = round(o.location.x, 1)
        if x in X_MAP:
            o.location.x = X_MAP[x]
            print("MOVED", o.name, x, "->", X_MAP[x])

BANNER_W, BANNER_H, TEXT = 4.0, 1.6, 1.65     # width/height/text scale factors
for section in ("NewHot", "TopRated", "Classics"):
    root = bpy.data.objects.get(f"Hang_{section}_L")
    if not root:
        continue
    for c in root.children:
        if c.name.endswith(("_Board", "_Edge")):
            c.scale = (BANNER_W, 1.0, BANNER_H)
        elif "_Cable_" in c.name:
            c.location.x *= BANNER_W
        elif c.type == "FONT":
            c.data.size *= TEXT
    print("BANNER", section)

bpy.ops.wm.save_mainfile()
