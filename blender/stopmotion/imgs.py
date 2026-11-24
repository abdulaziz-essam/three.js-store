import bpy, os
for im in bpy.data.images:
    p = bpy.path.abspath(im.filepath) if im.filepath else ""
    print("IMG", im.name, "| src", im.source, "| packed", bool(im.packed_file), "| path", p, "| exists", os.path.exists(p) if p else None, "| size", tuple(im.size))
