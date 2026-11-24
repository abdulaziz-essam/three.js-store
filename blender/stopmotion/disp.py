import bpy
for n in ["Display_spiderman", "Display_batman"]:
    o = bpy.data.objects[n]
    for c in o.children_recursive:
        mats = [s.material.name if s.material else None for s in getattr(c, "material_slots", [])]
        print("CH", n, c.name, c.type, tuple(round(v,2) for v in c.dimensions), mats)
for m in bpy.data.materials:
    if "batman" in m.name.lower() or "cover" in m.name.lower():
        print("MAT", m.name, [n.type for n in m.node_tree.nodes] if m.node_tree else None)
tv = [o for o in bpy.data.objects if "tv" in o.name.lower() or "screen" in o.name.lower()]
for o in tv[:20]:
    print("TV", o.name, o.type, [s.material.name if s.material else None for s in getattr(o,'material_slots',[])])
