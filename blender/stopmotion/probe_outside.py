import bpy, os
from mathutils import Vector
s = bpy.context.scene
for cn in ["01_Room", "05_Entrance"]:
    for o in bpy.data.collections[cn].all_objects:
        bb = [o.matrix_world @ Vector(c) for c in o.bound_box]
        ys = [v.y for v in bb]
        if min(ys) < -15:
            print("OBJ", cn, o.name, o.type, "y", round(min(ys),2), round(max(ys),2), "x", round(min(v.x for v in bb),1), round(max(v.x for v in bb),1), "z", round(max(v.z for v in bb),1),
                  [m.material.name for m in o.material_slots] if o.type=='MESH' else "")
print("WORLD", [n.type for n in s.world.node_tree.nodes] if s.world and s.world.use_nodes else None)
for c in bpy.data.collections["13_StopMotion"].objects:
    c.hide_render = True
cam = bpy.data.objects.new("probe", bpy.data.cameras.new("probe")); s.collection.objects.link(cam)
cam.data.lens = 18
s.camera = cam
s.render.resolution_percentage = 40
for name, pos, look in [("front", (3, -27, 1.8), (0, -17, 2.2)), ("door", (-2.5, -20.5, 1.6), (0, -17, 1.6))]:
    cam.location = pos
    cam.rotation_euler = (Vector(look) - Vector(pos)).to_track_quat('-Z', 'Y').to_euler()
    s.frame_set(1)
    s.render.filepath = os.path.join(os.path.dirname(bpy.data.filepath), "test", f"outside_{name}.png")
    bpy.ops.render.render(write_still=True)
