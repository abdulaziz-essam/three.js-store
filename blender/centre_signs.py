"""
One hanging sign per section, centred over the aisle (was a left + right pair).

  blender -b pixel_vault_store.blend --python centre_signs.py
"""
import bpy

for section in ("NewHot", "TopRated", "Classics", "PlayZone"):
    left = bpy.data.objects.get(f"Hang_{section}_L")
    right = bpy.data.objects.get(f"Hang_{section}_R")
    if right:
        for o in [*right.children_recursive, right]:
            bpy.data.objects.remove(o, do_unlink=True)
    if left:
        left.location.x = 0.0
        print("CENTRED", section)

bpy.ops.wm.save_mainfile()
