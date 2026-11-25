"""
Builds the Pixel Vault stop-motion tour on top of pixel_vault_store.blend.

Run headless (never modifies the store file; saves a separate .blend):
  blender -b ../pixel_vault_store.blend --python build.py

Everything lives in the "13_StopMotion" collection, rendered at 12 fps so every
frame is a separately posed "stop-motion" frame.
"""
import bpy, math, os, random, sys
from mathutils import Vector, Euler

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)
import exterior, customer
from customer import facing
OUT_BLEND = os.path.join(HERE, "pixel_vault_stopmotion.blend")

FPS = 12
CUT = 2            # black frames at each cut
LENS = 18          # wide, like the website's 65° vertical FOV
POS_JIT = 0.016    # camera lands slightly off its mark every frame
ROT_JIT = 0.0045
random.seed(7)

# Blender coords: entrance at y=-17 (street beyond it), play zone at y=+17, z up.
# "cust" poses the customer for frame k of n: (location, yaw, mode, walk phase); no "cust" = off screen.
STEP = 2 * math.pi / 10          # walk cycle: 10 hand-posed frames per two steps

def walk(p0, p1, k, n, k0=0):
    t = max(0.0, min(1.0, (k - k0) / max(1, n - 1 - k0)))
    p = Vector(p0).lerp(Vector(p1), t)
    d = Vector(p1) - Vector(p0)
    return (tuple(p), facing(d.x, d.y), "walk", (k - k0) * STEP)

def arrive(k, n):                 # turn toward the door, doors slide open, step inside
    if k < 4:
        return ((-0.3, -19.8, 0), -math.pi / 2 + (k / 3) * (math.pi / 2), "stand", 0)
    return walk((-0.3, -19.8, 0), (0.3, -8.4, 0), k, n, k0=4)

SHOTS = [
    # outside: the street, the AEK STORE sign, a customer walks up
    dict(title="AEK STORE", sub="VIDEO GAME STORE", accent=(0.80, 0.0, 0.0), frames=44, exposure=0.6,
         a=((-7.0, -29.2, 1.35), (-1.5, -17, 2.4)), b=((-4.2, -28.4, 1.55), (0.3, -17, 2.5)),
         cust=lambda k, n: walk((-5.6, -19.8, 0), (-0.3, -19.8, 0), k, n)),
    # doors slide open; the camera follows the customer through them and into the store
    dict(title="WELCOME IN", sub="OPEN LATE, EVERY NIGHT", accent=(0.0, 0.93, 1.0), frames=62,
         exposure=0.5, doors=(8, 14), card_at=40,
         a=((0.7, -23.0, 1.45), (0.0, -15, 1.55)), b=((0.0, -12.3, 1.8), (0, 2, 1.4)),
         cust=arrive),
    # the three main sections, one row each
    dict(title="NEW & HOT", sub="FRESH DROPS", accent=(1.0, 0.8, 0.0), frames=32,
         a=((-9.4, -8.0, 1.8), (-8.4, -3.5, 1.7)), b=((9.4, -8.0, 1.8), (8.4, -3.5, 1.7)),
         cust=lambda k, n: ((0.0, -4.75, 0), facing(2.8, 1.25), "look", 0)),
    dict(title="TOP RATED", sub="CRITICS' FAVOURITES", accent=(0.80, 0.0, 0.0), frames=32,
         a=((9.4, -1.0, 1.7), (8.4, 2.0, 1.8)), b=((-9.4, -1.0, 1.7), (-8.4, 2.0, 1.8))),
    dict(title="CLASSICS", sub="TIMELESS GAMES", accent=(0.0, 0.33, 0.8), frames=32,
         a=((-9.4, 4.4, 1.8), (-8.4, 7.5, 1.7)), b=((9.4, 4.4, 1.8), (8.4, 7.5, 1.7))),
    # best prices: close on the cheapest price tags (BioShock $14.99, Batman $19.99)
    dict(title="BEST PRICES", sub="FROM $14.99", accent=(0.0, 0.85, 0.35), frames=32,
         a=((6.3, -0.6, 1.25), (8.4, 2.6, 1.05)), b=((6.3, 5.2, 1.25), (8.4, 8.2, 1.05)),
         cust=lambda k, n: ((10.2, 5.8, 0), facing(-1.8, 1.7), "look", 0)),
    dict(title="AEK STORE", sub="SEE YOU INSIDE", accent=(0.80, 0.0, 0.0), frames=44,
         a=((0, -6.0, 1.6), (0, 10, 1.5)),    b=((0, -15.6, 4.7), (0, 4, 0.6)),
         cust=lambda k, n: walk((1.0, -3.0, 0), (1.0, 2.0, 0), k, n)),
]

scene = bpy.context.scene
prefs = bpy.context.preferences.edit
prefs.keyframe_new_interpolation_type = 'CONSTANT'   # stop-motion: no in-betweens

# ── collection ──────────────────────────────────────────────────────────────
coll = bpy.data.collections.get("13_StopMotion") or bpy.data.collections.new("13_StopMotion")
if coll.name not in scene.collection.children:
    scene.collection.children.link(coll)
for o in list(coll.objects):
    bpy.data.objects.remove(o, do_unlink=True)

def link(o):
    coll.objects.link(o)
    return o

# ── fonts ───────────────────────────────────────────────────────────────────
def load_font(path):
    try:
        return bpy.data.fonts.load(path, check_existing=True) if os.path.exists(path) else None
    except Exception:
        return None
FONT_BOLD = load_font(r"C:\Windows\Fonts\ariblk.ttf") or load_font(r"C:\Windows\Fonts\seguibl.ttf")
FONT_REG  = load_font(r"C:\Windows\Fonts\bahnschrift.ttf") or FONT_BOLD

# ── materials ───────────────────────────────────────────────────────────────
def emit_mat(name, color, strength=1.0, alpha=None):
    m = bpy.data.materials.get(name) or bpy.data.materials.new(name)
    m.use_nodes = True
    nt = m.node_tree; nt.nodes.clear()
    out = nt.nodes.new("ShaderNodeOutputMaterial")
    em = nt.nodes.new("ShaderNodeEmission")
    em.inputs["Color"].default_value = (*color, 1)
    em.inputs["Strength"].default_value = strength
    if alpha is None:
        nt.links.new(em.outputs[0], out.inputs["Surface"])
    else:
        tr = nt.nodes.new("ShaderNodeBsdfTransparent")
        mix = nt.nodes.new("ShaderNodeMixShader")
        mix.inputs[0].default_value = alpha
        nt.links.new(tr.outputs[0], mix.inputs[1]); nt.links.new(em.outputs[0], mix.inputs[2])
        nt.links.new(mix.outputs[0], out.inputs["Surface"])
        set_blended(m)
    return m

def set_blended(m):
    for attr, val in (("surface_render_method", "BLENDED"), ("blend_method", "BLEND")):
        try: setattr(m, attr, val)
        except Exception: pass

def grain_mat():
    m = bpy.data.materials.new("SM_Grain"); m.use_nodes = True
    nt = m.node_tree; nt.nodes.clear()
    out = nt.nodes.new("ShaderNodeOutputMaterial")
    tc = nt.nodes.new("ShaderNodeTexCoord")
    nz = nt.nodes.new("ShaderNodeTexNoise")
    nz.noise_dimensions = '4D'
    nz.inputs["Scale"].default_value = 900
    nz.inputs["Detail"].default_value = 1.0
    nt.links.new(tc.outputs["UV"], nz.inputs["Vector"])
    em = nt.nodes.new("ShaderNodeEmission")
    nt.links.new(nz.outputs["Fac"], em.inputs["Color"])
    tr = nt.nodes.new("ShaderNodeBsdfTransparent")
    mix = nt.nodes.new("ShaderNodeMixShader"); mix.inputs[0].default_value = 0.11
    nt.links.new(tr.outputs[0], mix.inputs[1]); nt.links.new(em.outputs[0], mix.inputs[2])
    nt.links.new(mix.outputs[0], out.inputs["Surface"])
    set_blended(m)
    return m, nz

def vignette_mat():
    m = bpy.data.materials.new("SM_Vignette"); m.use_nodes = True
    nt = m.node_tree; nt.nodes.clear()
    out = nt.nodes.new("ShaderNodeOutputMaterial")
    tc = nt.nodes.new("ShaderNodeTexCoord")
    sub = nt.nodes.new("ShaderNodeVectorMath"); sub.operation = 'SUBTRACT'
    sub.inputs[1].default_value = (0.5, 0.5, 0)
    mul = nt.nodes.new("ShaderNodeVectorMath"); mul.operation = 'MULTIPLY'
    mul.inputs[1].default_value = (1.0, 0.5625, 0)
    ln = nt.nodes.new("ShaderNodeVectorMath"); ln.operation = 'LENGTH'
    mr = nt.nodes.new("ShaderNodeMapRange")
    mr.inputs["From Min"].default_value = 0.28
    mr.inputs["From Max"].default_value = 0.62
    mr.inputs["To Min"].default_value = 0.0
    mr.inputs["To Max"].default_value = 0.8
    nt.links.new(tc.outputs["UV"], sub.inputs[0]); nt.links.new(sub.outputs[0], mul.inputs[0])
    nt.links.new(mul.outputs[0], ln.inputs[0]);    nt.links.new(ln.outputs["Value"], mr.inputs["Value"])
    em = nt.nodes.new("ShaderNodeEmission"); em.inputs["Color"].default_value = (0.02, 0.012, 0.005, 1)
    tr = nt.nodes.new("ShaderNodeBsdfTransparent")
    mix = nt.nodes.new("ShaderNodeMixShader")
    nt.links.new(mr.outputs["Result"], mix.inputs[0])
    nt.links.new(tr.outputs[0], mix.inputs[1]); nt.links.new(em.outputs[0], mix.inputs[2])
    nt.links.new(mix.outputs[0], out.inputs["Surface"])
    set_blended(m)
    return m

# ── camera ──────────────────────────────────────────────────────────────────
cam_data = bpy.data.cameras.new("SM_Camera")
cam_data.lens = LENS
cam_data.clip_start = 0.02
cam_data.clip_end = 200
cam = link(bpy.data.objects.new("SM_Camera", cam_data))
scene.camera = cam

FRAME_W = 36.0 / LENS            # visible width at 1 m (sensor 36 mm, horizontal fit)
FRAME_H = FRAME_W * 1080 / 1920

def plane(name, w, h, mat, z, x=0.0, y=0.0):
    me = bpy.data.meshes.new(name)
    hw, hh = w / 2, h / 2
    me.from_pydata([(-hw, -hh, 0), (hw, -hh, 0), (hw, hh, 0), (-hw, hh, 0)], [], [(0, 1, 2, 3)])
    uv = me.uv_layers.new()
    for li, co in zip(range(4), [(0, 0), (1, 0), (1, 1), (0, 1)]):
        uv.data[li].uv = co
    me.materials.append(mat)
    o = link(bpy.data.objects.new(name, me))
    o.parent = cam
    o.location = (x * -z, y * -z, z)   # x/y given at 1 m, scaled with depth
    s = -z
    o.scale = (s, s, s)
    return o

# Overlays, nearest first. Sizes are in "1 m from lens" units, then scaled to their depth.
bar_h = FRAME_H * 0.11
black = emit_mat("SM_Black", (0.012, 0.008, 0.004))
plane("SM_BarTop",    FRAME_W * 1.1, bar_h, black, -0.10, y=(FRAME_H / 2 - bar_h / 2))
plane("SM_BarBottom", FRAME_W * 1.1, bar_h, black, -0.10, y=-(FRAME_H / 2 - bar_h / 2))
gm, grain_noise = grain_mat()
plane("SM_Grain", FRAME_W * 1.1, FRAME_H * 1.1, gm, -0.12)
plane("SM_Vignette", FRAME_W * 1.02, FRAME_H * 1.02, vignette_mat(), -0.14)
cut = plane("SM_CutBlack", FRAME_W * 1.2, FRAME_H * 1.2, black, -0.09)

# ── title cards (paper cutouts parented to the camera) ──────────────────────
paper = emit_mat("SM_Paper", (0.97, 0.93, 0.84), 1.9)
ink   = emit_mat("SM_Ink",   (0.06, 0.04, 0.02), 1.0)
subink = emit_mat("SM_SubInk", (0.16, 0.11, 0.07), 1.0)

def text_obj(name, body, size, mat, font, parent):
    cu = bpy.data.curves.new(name, "FONT")
    cu.body = body; cu.size = size
    cu.align_x = 'CENTER'; cu.align_y = 'CENTER'
    if font: cu.font = font
    cu.materials.append(mat)
    o = link(bpy.data.objects.new(name, cu))
    o.parent = parent
    return o

CARD_DEPTH = -0.2
CARD_SCALE = 0.72   # card size relative to frame
cards = []
for i, s in enumerate(SHOTS):
    if not s.get("title"):
        cards.append((None, s)); continue
    root = link(bpy.data.objects.new(f"SM_Card_{i}", None))
    root.parent = cam
    root.location = (0, -FRAME_H * 0.27 * -CARD_DEPTH, CARD_DEPTH)
    root.scale = (-CARD_DEPTH * CARD_SCALE,) * 3
    cards.append((root, s))

def _card_plane(name, w, h, mat, parent, x, y, z):
    me = bpy.data.meshes.new(name)
    hw, hh = w / 2, h / 2
    me.from_pydata([(-hw, -hh, 0), (hw, -hh, 0), (hw, hh, 0), (-hw, hh, 0)], [], [(0, 1, 2, 3)])
    me.materials.append(mat)
    o = link(bpy.data.objects.new(name, me))
    o.parent = parent; o.location = (x, y, z)
    return o

for i, (root, s) in enumerate(cards):
    if root is None: continue
    cw = max(0.115 * len(s["title"]) * 0.8 + 0.16, 0.042 * len(s["sub"]) * 0.62 + 0.12)
    ch = 0.25
    _card_plane(f"SM_Card_{i}_Shadow", cw, ch, emit_mat(f"SM_Accent_{i}", s["accent"], 1.0), root, 0.018, -0.018, -0.002)
    _card_plane(f"SM_Card_{i}_Border", cw + 0.012, ch + 0.012, ink, root, 0, 0, -0.001)
    _card_plane(f"SM_Card_{i}_Paper", cw, ch, paper, root, 0, 0, 0)
    t = text_obj(f"SM_Card_{i}_Title", s["title"], 0.115, ink, FONT_BOLD, root)
    t.location = (0, 0.035, 0.001)
    st = text_obj(f"SM_Card_{i}_Sub", s["sub"], 0.042, subink, FONT_REG, root)
    st.data.space_character = 1.25
    st.location = (0, -0.068, 0.001)

# ── real cover art (the website applies these at runtime; the .blend only has a few) ──
# Cover art for every game (downloaded from the same URLs the website uses)
COVERS = os.path.join(HERE, "covers")
COVER_FILES = {k: k for k in ["cyberpunk", "eldenring", "spiderman", "tlou2", "witcher3", "gow", "rdr2",
                              "baldursgate", "kingdomhearts", "batman", "bioshock", "sekiro"]}

def cover_image(key):
    path = os.path.join(COVERS, COVER_FILES[key] + ".jpg")
    return bpy.data.images.load(path, check_existing=True) if os.path.exists(path) else None

for key in COVER_FILES:
    m = bpy.data.materials.get(f"Cover_{key}")
    img = cover_image(key)
    if not (m and m.node_tree and img):
        continue
    nt = m.node_tree
    bsdf = next(n for n in nt.nodes if n.type == "BSDF_PRINCIPLED")
    tex = next((n for n in nt.nodes if n.type == "TEX_IMAGE"), None) or nt.nodes.new("ShaderNodeTexImage")
    tex.image = img
    nt.links.new(tex.outputs["Color"], bsdf.inputs["Base Color"])
    # a little self-glow so covers read clearly on camera
    emi_col = bsdf.inputs.get("Emission Color") or bsdf.inputs.get("Emission")
    if emi_col is not None:
        nt.links.new(tex.outputs["Color"], emi_col)
        if "Emission Strength" in bsdf.inputs:
            bsdf.inputs["Emission Strength"].default_value = 0.35

# The display cover meshes have cropped UVs; give each one clean front/back faces
def cover_face_mat(key):
    img = cover_image(key)
    m = bpy.data.materials.new(f"SM_CoverFace_{key}"); m.use_nodes = True
    nt = m.node_tree
    bsdf = next(n for n in nt.nodes if n.type == "BSDF_PRINCIPLED")
    tex = nt.nodes.new("ShaderNodeTexImage"); tex.image = img
    nt.links.new(tex.outputs["Color"], bsdf.inputs["Base Color"])
    nt.links.new(tex.outputs["Color"], bsdf.inputs["Emission Color"])
    bsdf.inputs["Emission Strength"].default_value = 0.45
    bsdf.inputs["Roughness"].default_value = 0.35
    return m

for key in COVER_FILES:
    cov = bpy.data.objects.get(f"Display_{key}_Cover")
    if not cov or not cover_image(key):
        continue
    xs = [v[0] for v in cov.bound_box]; ys = [v[1] for v in cov.bound_box]; zs = [v[2] for v in cov.bound_box]
    mat = cover_face_mat(key)
    for side, y in (("front", min(ys) - 0.002), ("back", max(ys) + 0.002)):
        x0, x1, z0, z1 = min(xs), max(xs), min(zs), max(zs)
        me = bpy.data.meshes.new(f"SM_Cover_{key}_{side}")
        if side == "front":   # faces -y
            verts = [(x0, y, z0), (x1, y, z0), (x1, y, z1), (x0, y, z1)]; uvs = [(0, 0), (1, 0), (1, 1), (0, 1)]
        else:                 # faces +y, mirrored so it reads correctly from behind
            verts = [(x1, y, z0), (x0, y, z0), (x0, y, z1), (x1, y, z1)]; uvs = [(0, 0), (1, 0), (1, 1), (0, 1)]
        me.from_pydata(verts, [], [(0, 1, 2, 3)])
        uv = me.uv_layers.new()
        for li, co in enumerate(uvs):
            uv.data[li].uv = co
        me.materials.append(mat)
        o = link(bpy.data.objects.new(me.name, me))
        o.parent = cov
        o.matrix_parent_inverse.identity()

# Play Zone TVs: show the website's default games on each screen
tv_screens = [(-7.0, 2.08, 1.14, "eldenring"), (0.0, 2.6, 1.425, "cyberpunk"), (7.0, 2.08, 1.14, "gow")]
for x, w, h, key in tv_screens:
    img = cover_image(key)
    if not img:
        continue
    m = bpy.data.materials.new(f"SM_TV_{key}"); m.use_nodes = True
    nt = m.node_tree; nt.nodes.clear()
    out = nt.nodes.new("ShaderNodeOutputMaterial")
    tc = nt.nodes.new("ShaderNodeTexCoord")
    # letterbox the portrait cover into the wide screen: zoom into the middle band
    mp = nt.nodes.new("ShaderNodeMapping")
    mp.inputs["Scale"].default_value = (1.0, 0.38, 1)
    mp.inputs["Location"].default_value = (0, 0.36, 0)
    tex = nt.nodes.new("ShaderNodeTexImage"); tex.image = img
    em = nt.nodes.new("ShaderNodeEmission"); em.inputs["Strength"].default_value = 1.4
    nt.links.new(tc.outputs["UV"], mp.inputs["Vector"]); nt.links.new(mp.outputs[0], tex.inputs["Vector"])
    nt.links.new(tex.outputs["Color"], em.inputs["Color"]); nt.links.new(em.outputs[0], out.inputs["Surface"])
    me = bpy.data.meshes.new(f"SM_TV_{key}")
    hw, hh = w / 2 * 0.97, h / 2 * 0.95
    me.from_pydata([(-hw, 0, -hh), (hw, 0, -hh), (hw, 0, hh), (-hw, 0, hh)], [], [(0, 3, 2, 1)])
    uv = me.uv_layers.new()
    for li, co in zip(range(4), [(0, 0), (0, 1), (1, 1), (1, 0)]):
        uv.data[li].uv = co
    me.materials.append(m)
    o = link(bpy.data.objects.new(f"SM_TV_{key}", me))
    o.location = (x, 16.42, 2.6)

# The checkout corner is dim on camera; a soft fill light over the counter
ld = bpy.data.lights.new("SM_CheckoutFill", "AREA")
ld.energy = 900; ld.size = 4; ld.color = (1.0, 0.9, 0.78)
fill = link(bpy.data.objects.new("SM_CheckoutFill", ld))
fill.location = (6.5, -10.5, 4.6)

# ── outside: night street + storefront, and the customer ─────────────────────
def hide_always(o):
    o.hide_render = True; o.hide_viewport = True
exterior.build(link, hide_always, cover_image, FONT_BOLD)
mk = lambda name, size, loc, mat, parent=None: exterior.make_box(link, name, size, loc, mat, parent=parent)
cust = customer.Customer(link, mk, exterior.pbr)

# Section row strips, same as the website's ShopFloor RowStrip (three z -> blender -y)
ROW_STRIPS = [(-3.5, (1.0, 0.8, 0.0)), (2.0, (1.0, 0.16, 0.16)), (7.5, (0.16, 0.48, 1.0))]
strip_mat = exterior.pbr("SM_RowStrip", (0.035, 0.035, 0.045), rough=0.6, metal=0.2)
for y, col in ROW_STRIPS:
    exterior.box_span(link, f"SM_Row_{y}", -10.6, 10.6, y - 1.3, y + 1.3, 0.0, 0.006, strip_mat)
    edge = exterior.neon(f"SM_RowEdge_{y}", col, 4)
    for side in (-1, 1):
        e0 = y + side * 1.3
        exterior.box_span(link, f"SM_RowEdge_{y}_{side}", -10.6, 10.6, min(e0, e0 - side * 0.06), max(e0, e0 - side * 0.06), 0.0, 0.008, edge)
DOOR_PARTS = {-1: ["Door_0_Glass", "Door_0_Frame", "Door_0_Handle"], 1: ["Door_1_Glass", "Door_1_Frame", "Door_1_Handle"]}
DOOR_HOME = {nm: bpy.data.objects[nm].location.x for parts in DOOR_PARTS.values() for nm in parts}
def set_doors(open_t, f):
    for side, parts in DOOR_PARTS.items():
        for nm in parts:
            o = bpy.data.objects[nm]
            o.location.x = DOOR_HOME[nm] + side * 1.38 * open_t
            o.keyframe_insert("location", index=0, frame=f)

# ── animation ───────────────────────────────────────────────────────────────
def look_rot(pos, target):
    d = Vector(target) - Vector(pos)
    return d.to_track_quat('-Z', 'Y').to_euler()

def ease(t):
    return t * t * (3 - 2 * t)

def set_vis(obj, visible, f):
    obj.hide_render = not visible
    obj.hide_viewport = not visible
    obj.keyframe_insert("hide_render", frame=f)
    obj.keyframe_insert("hide_viewport", frame=f)

frame = 1
set_doors(0.0, 1)
for root, _ in cards:
    if root is None: continue
    set_vis(root, False, 1)
    for ch in root.children:
        set_vis(ch, False, 1)

def card_visible(root, visible, f):
    set_vis(root, visible, f)
    for ch in root.children:
        set_vis(ch, visible, f)

set_vis(cut, False, 1)
POP = [0.55, 1.14, 0.95, 1.0]   # squash-and-settle, one pose per frame

for i, s in enumerate(SHOTS):
    root = cards[i][0]
    start = frame
    cust.set_visible(bool(s.get("cust")), start, set_vis)
    if "doors" in s:
        d0, d1 = s["doors"]
        for k in range(d0, d1 + 1):
            set_doors((k - d0) / (d1 - d0), start + k)
    n = s["frames"]
    is_last_shot = i == len(SHOTS) - 1
    if i > 0:
        set_vis(cut, True, start)
        set_vis(cut, False, start + CUT)
    for k in range(n):
        f = start + k
        t = ease(k / (n - 1))
        p = Vector(s["a"][0]).lerp(Vector(s["b"][0]), t)
        l = Vector(s["a"][1]).lerp(Vector(s["b"][1]), t)
        hold_still = is_last_shot and k >= n - 6
        if not hold_still:
            p += Vector((random.uniform(-1, 1), random.uniform(-1, 1), random.uniform(-1, 1))) * POS_JIT
        cam.location = p
        r = look_rot(p, l)
        if not hold_still:
            r.x += random.uniform(-1, 1) * ROT_JIT
            r.y += random.uniform(-1, 1) * ROT_JIT * 0.6
            r.z += random.uniform(-1, 1) * ROT_JIT
        cam.rotation_euler = r
        cam.keyframe_insert("location", frame=f)
        cam.keyframe_insert("rotation_euler", frame=f)

        if s.get("cust"):
            loc, yaw, mode, phase = s["cust"](k, n)
            cust.pose(f, loc, yaw, mode, phase)

        # exposure flickers in hard steps around the shot's base level
        scene.view_settings.exposure = s.get("exposure", 0.35) + random.choice([0.0, -0.08, -0.15, 0.05])
        scene.view_settings.keyframe_insert("exposure", frame=f)
        if root is None:
            continue

        # card: appears after the cut, pops in, then "boils" on twos
        card_k = k - s.get("card_at", CUT if i > 0 else 4)
        if card_k == 0:
            card_visible(root, True, f)
        if card_k >= 0:
            sc = POP[card_k] if card_k < len(POP) else 1.0
            root.scale = (sc * -CARD_DEPTH * CARD_SCALE,) * 3
            if card_k % 2 == 0:
                rng = random.Random(f)
                root.rotation_euler = Euler((0, 0, math.radians(rng.uniform(-1.6, 1.6))))
                root.location = (rng.uniform(-0.6, 0.6) * 0.002,
                                 -FRAME_H * 0.27 * -CARD_DEPTH + rng.uniform(-0.6, 0.6) * 0.002,
                                 CARD_DEPTH)
            root.keyframe_insert("scale", frame=f)
            root.keyframe_insert("rotation_euler", frame=f)
            root.keyframe_insert("location", frame=f)
    frame += n
    if root is not None:
        card_visible(root, False, frame)

end = frame - 1

# Grain re-rolls every frame
for f in range(1, end + 1):
    grain_noise.inputs["W"].default_value = f * 3.71
    grain_noise.inputs["W"].keyframe_insert("default_value", frame=f)

# ── render settings ─────────────────────────────────────────────────────────
scene.frame_start = 1
scene.frame_end = end
scene.render.fps = FPS
scene.render.fps_base = 1
scene.render.resolution_x = 1920
scene.render.resolution_y = 1080
scene.render.resolution_percentage = 100
try:
    scene.eevee.taa_render_samples = 24
    scene.eevee.use_raytracing = True      # wet street + floor reflect the neon
except Exception:
    pass
scene.render.filepath = os.path.join(HERE, "frames", "sm_")
scene.render.image_settings.file_format = 'PNG'

# Saving into a subfolder would break the store's relative texture paths
for im in bpy.data.images:
    if im.source == 'FILE' and im.filepath:
        im.filepath = bpy.path.abspath(im.filepath)
bpy.ops.wm.save_as_mainfile(filepath=OUT_BLEND, copy=True, relative_remap=False)
print(f"BUILT frames=1..{end} ({end / FPS:.1f}s at {FPS} fps) -> {OUT_BLEND}")
