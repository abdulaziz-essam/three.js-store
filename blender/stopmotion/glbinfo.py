import bpy
s = bpy.context.scene
print("KEYS", list(s.keys()))
for k in s.keys():
    if 'gltf' in k.lower():
        print("EXP", k, dict(s[k]) if hasattr(s[k], 'keys') else s[k])
o = bpy.data.objects["Sign_PixelVault_Text"]
print("SIGN", o.location[:], o.data.size, o.data.align_x, o.data.font.name if o.data.font else None, [c.name for c in o.users_collection], o.parent.name if o.parent else None)
for x in bpy.data.objects:
    if x.name.startswith("Sign_PixelVault"):
        print("SIGNOBJ", x.name, x.type, tuple(round(v,2) for v in x.dimensions))
print("COLLS_EXCLUDED", [c.name for c in bpy.context.view_layer.layer_collection.children if c.exclude])
