"""
Renames the store sign and re-exports the website's store model.

  blender -b pixel_vault_store.blend --python export_store_glb.py -- [--save-blend] [--out path.glb]

The website loads one mesh per material ("Store_<material>"), so every visible
mesh/text object is baked to world space and merged by material before export.
Only materials present in the current .glb are exported (the floor, for example,
is drawn by the website itself).
"""
import bpy, bmesh, json, os, struct, sys

STORE_NAME = "AEK STORE"
HERE = os.path.dirname(os.path.abspath(__file__))
SITE_GLB = os.path.normpath(os.path.join(HERE, "..", "client", "public", "models", "pixel_vault_store.glb"))

argv = sys.argv[sys.argv.index("--") + 1:] if "--" in sys.argv else []
save_blend = "--save-blend" in argv
out = argv[argv.index("--out") + 1] if "--out" in argv else SITE_GLB

# 1. sign text
sign = bpy.data.objects.get("Sign_PixelVault_Text")
if sign:
    sign.data.body = STORE_NAME
if save_blend:
    bpy.ops.wm.save_mainfile()

# 2. which materials the website model uses
def glb_material_names(path):
    b = open(path, "rb").read()
    ln = struct.unpack_from("<I", b, 12)[0]
    return [m["name"] for m in json.loads(b[20:20 + ln])["materials"]]
keep = set(glb_material_names(SITE_GLB))

# 3. merge per material in world space
dg = bpy.context.evaluated_depsgraph_get()
merged = {name: bmesh.new() for name in keep}
# The website builds the game pedestals itself (ShopFloor/GameDisplay)
SKIP_COLLECTIONS = {"08_GameDisplays"}
SKIP_OBJECTS = {o.name for n in SKIP_COLLECTIONS if bpy.data.collections.get(n)
                for o in bpy.data.collections[n].all_objects}
def skipped(obj):
    return obj.name in SKIP_OBJECTS

for obj in bpy.context.view_layer.objects:
    if obj.type not in {"MESH", "FONT", "CURVE"} or not obj.visible_get() or obj.hide_render or skipped(obj):
        continue
    ev = obj.evaluated_get(dg)
    me = ev.to_mesh()
    if me is None:
        continue
    mats = [s.material.name if s.material else None for s in obj.material_slots] or [None]
    for idx, mname in enumerate(mats):
        if mname not in keep:
            continue
        bm = bmesh.new(); bm.from_mesh(me)
        bm.transform(obj.matrix_world)
        bmesh.ops.delete(bm, geom=[f for f in bm.faces if f.material_index != idx], context="FACES")
        if not bm.faces:
            bm.free(); continue
        for f in bm.faces:
            f.material_index = 0
        tmp = bpy.data.meshes.new("tmp")
        bm.to_mesh(tmp); bm.free()
        for i, uv in enumerate(list(tmp.uv_layers)):
            if i == 0: uv.name = "UVMap"
            else: tmp.uv_layers.remove(uv)
        merged[mname].from_mesh(tmp)
        bpy.data.meshes.remove(tmp)
    ev.to_mesh_clear()

scene = bpy.data.scenes.new("GLB_Export")
for mname, bm in merged.items():
    if not bm.faces:
        print("EMPTY", mname); continue
    me = bpy.data.meshes.new(f"Store_{mname}")
    bm.to_mesh(me); bm.free()
    me.materials.append(bpy.data.materials[mname])
    scene.collection.objects.link(bpy.data.objects.new(f"Store_{mname}", me))

# Re-compress the big room textures like the original web export (~75% JPEG)
import tempfile
tmpdir = tempfile.mkdtemp(prefix="aek_glb_")
scene.render.image_settings.file_format = "JPEG"
scene.render.image_settings.quality = 75
for img in bpy.data.images:
    if img.source == "FILE" and img.size[0] >= 1024:
        dst = os.path.join(tmpdir, f"{len(os.listdir(tmpdir))}_{os.path.splitext(img.name)[0]}.jpg")
        img.save_render(dst, scene=scene)
        img.filepath = dst
        img.reload()

bpy.context.window.scene = scene
bpy.ops.export_scene.gltf(
    filepath=out, export_format="GLB", use_active_scene=True,
    export_cameras=False, export_lights=False, export_apply=True, export_yup=True,
    export_texcoords=True, export_normals=True, export_tangents=False,
    export_materials="EXPORT", export_image_format="JPEG", export_animations=False,
    **({"export_image_quality": 75} if "export_image_quality" in bpy.ops.export_scene.gltf.get_rna_type().properties else
       {"export_jpeg_quality": 75} if "export_jpeg_quality" in bpy.ops.export_scene.gltf.get_rna_type().properties else {}),
)
print("EXPORTED", out, os.path.getsize(out) // 1024, "KB")
