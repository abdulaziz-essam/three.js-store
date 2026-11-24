import bpy
for o in bpy.data.objects:
    if o.name.startswith("Station_TV"):
        print("ST", o.name, tuple(round(v,1) for v in o.matrix_world.translation))
        for c in o.children_recursive:
            print("  ", c.name, c.type, tuple(round(v,2) for v in c.dimensions), [s.material.name if s.material else None for s in getattr(c,'material_slots',[])])
me = bpy.data.objects["Display_spiderman_Cover"].data
print("UV", [u.name for u in me.uv_layers], len(me.polygons))
