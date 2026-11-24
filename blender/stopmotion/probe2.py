import bpy
for n in ["Door_Neon", "WelcomeMat_Text", "Sign_PixelVault_Text"]:
    o = bpy.data.objects.get(n)
    if o: print("TXT", n, repr(o.data.body), [s.material.name for s in o.material_slots], tuple(round(v,2) for v in o.matrix_world.translation), tuple(round(v,2) for v in o.matrix_world.to_euler()))
for n in ["Door_0_Glass","Door_1_Glass","Door_OutsideGlow","Wall_Front"]:
    o = bpy.data.objects[n]; print("OBJ", n, tuple(round(v,2) for v in o.location), o.parent.name if o.parent else None, [m.type for m in o.modifiers])
for mn in ["Wall", "Display_Glass", "Red_Neon"]:
    m = bpy.data.materials[mn]; print("MAT", mn, [n.type for n in m.node_tree.nodes])
