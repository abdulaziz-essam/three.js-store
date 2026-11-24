import bpy, os, sys, time
s = bpy.context.scene
s.render.resolution_percentage = 50
here = os.path.dirname(bpy.data.filepath)
frames = [int(a) for a in sys.argv[sys.argv.index("--") + 1:]] if "--" in sys.argv else [12, 52, 90]
for f in frames:
    s.frame_set(f)
    s.render.filepath = os.path.join(here, "test", f"still_{f:03d}.png")
    t = time.time()
    bpy.ops.render.render(write_still=True)
    print("STILL", f, f"{time.time()-t:.1f}s")
