import bpy
s = bpy.context.scene
print("ENGINE", s.render.engine, "RES", s.render.resolution_x, s.render.resolution_y, "FPS", s.render.fps, "CAM", s.camera)
print("COLLS", [c.name for c in bpy.data.collections])
for o in sorted(bpy.data.objects, key=lambda o: o.name)[:400]:
    if o.parent is None:
        d = o.dimensions
        print(f"{o.type:8} {o.name:40} loc=({o.location.x:.1f},{o.location.y:.1f},{o.location.z:.1f}) dim=({d.x:.1f},{d.y:.1f},{d.z:.1f}) kids={len(o.children)}")
print("NOBJ", len(bpy.data.objects), "LIGHTS", [ (l.name, l.type) for l in bpy.data.objects if l.type=='LIGHT'][:20])
import sys; print("WORLD", s.world.name if s.world else None)
