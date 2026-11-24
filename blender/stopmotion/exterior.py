"""Night street + AEK STORE storefront, built around the store's front wall (y = -17)."""
import bpy, bmesh, math, random
from mathutils import Vector

FRONT_Y = -17.0          # outer face of Wall_Front is at y = -17.09
DOOR_HALF_W, DOOR_H = 1.42, 3.42
WINDOWS = [(-4.4, -2.3), (2.3, 4.4)]   # display windows either side of the door (x ranges)
WIN_Z = (0.45, 3.2)


def _bsdf(m):
    return next(n for n in m.node_tree.nodes if n.type == "BSDF_PRINCIPLED")


def pbr(name, color, rough=0.7, metal=0.0, emit=None, strength=0.0, alpha=None):
    m = bpy.data.materials.new(name)
    m.use_nodes = True
    b = _bsdf(m)
    b.inputs["Base Color"].default_value = (*color, 1)
    b.inputs["Roughness"].default_value = rough
    b.inputs["Metallic"].default_value = metal
    if emit:
        b.inputs["Emission Color"].default_value = (*emit, 1)
        b.inputs["Emission Strength"].default_value = strength
    if alpha is not None:
        b.inputs["Alpha"].default_value = alpha
        for attr, val in (("surface_render_method", "BLENDED"), ("blend_method", "BLEND")):
            try: setattr(m, attr, val)
            except Exception: pass
    return m


def neon(name, color, strength=10.0):
    return pbr(name, (0.02, 0.02, 0.02), rough=0.4, emit=color, strength=strength)


def make_box(link, name, size, loc, mat, rot=(0, 0, 0), parent=None):
    bm = bmesh.new()
    bm.loops.layers.uv.new()
    bmesh.ops.create_cube(bm, size=1.0, calc_uvs=True)
    for v in bm.verts:
        v.co = Vector((v.co.x * size[0], v.co.y * size[1], v.co.z * size[2]))
    me = bpy.data.meshes.new(name)
    bm.to_mesh(me); bm.free()
    me.materials.append(mat)
    o = link(bpy.data.objects.new(name, me))
    o.location = loc
    o.rotation_euler = rot
    if parent:
        o.parent = parent
    return o


def box_span(link, name, x0, x1, y0, y1, z0, z1, mat):
    return make_box(link, name, (x1 - x0, y1 - y0, z1 - z0),
                    ((x0 + x1) / 2, (y0 + y1) / 2, (z0 + z1) / 2), mat)


def text(link, name, body, size, loc, mat, font=None, extrude=0.0, facing="-y"):
    cu = bpy.data.curves.new(name, "FONT")
    cu.body = body; cu.size = size
    cu.align_x = "CENTER"; cu.align_y = "CENTER"
    cu.extrude = extrude
    if font: cu.font = font
    cu.materials.append(mat)
    o = link(bpy.data.objects.new(name, cu))
    o.location = loc
    o.rotation_euler = (math.pi / 2, 0, 0) if facing == "-y" else (math.pi / 2, 0, math.pi)
    return o


def image_panel(link, name, img, w, h, loc, strength=1.2):
    m = bpy.data.materials.new(f"{name}_mat"); m.use_nodes = True
    nt = m.node_tree; nt.nodes.clear()
    out = nt.nodes.new("ShaderNodeOutputMaterial")
    tex = nt.nodes.new("ShaderNodeTexImage"); tex.image = img
    em = nt.nodes.new("ShaderNodeEmission"); em.inputs["Strength"].default_value = strength
    nt.links.new(tex.outputs["Color"], em.inputs["Color"]); nt.links.new(em.outputs[0], out.inputs["Surface"])
    me = bpy.data.meshes.new(name)
    hw, hh = w / 2, h / 2
    me.from_pydata([(-hw, 0, -hh), (-hw, 0, hh), (hw, 0, hh), (hw, 0, -hh)], [], [(0, 1, 2, 3)])
    uv = me.uv_layers.new()
    for li, co in enumerate([(0, 0), (0, 1), (1, 1), (1, 0)]):
        uv.data[li].uv = co
    me.materials.append(m)
    o = link(bpy.data.objects.new(name, me))
    o.location = loc
    return o


def light(link, name, kind, loc, energy, color, size=None, rot=None, spot=None):
    ld = bpy.data.lights.new(name, kind)
    ld.energy = energy; ld.color = color
    if size is not None and hasattr(ld, "size"): ld.size = size
    if spot is not None: ld.spot_size = spot; ld.spot_blend = 0.5
    o = link(bpy.data.objects.new(name, ld))
    o.location = loc
    if rot: o.rotation_euler = rot
    return o


def cut_openings(link, hide):
    """Door + two display windows through the solid front wall (boolean, render-time only)."""
    wall = bpy.data.objects["Wall_Front"]
    bm = bmesh.new()
    def add(x0, x1, z0, z1):
        r = bmesh.ops.create_cube(bm, size=1.0)
        for v in r["verts"]:
            v.co = Vector(((x0 + x1) / 2 + v.co.x * (x1 - x0), FRONT_Y + v.co.y * 1.2, (z0 + z1) / 2 + v.co.z * (z1 - z0)))
    add(-DOOR_HALF_W, DOOR_HALF_W, -0.5, DOOR_H)
    for x0, x1 in WINDOWS:
        add(x0, x1, *WIN_Z)
    me = bpy.data.meshes.new("SM_WallCutter"); bm.to_mesh(me); bm.free()
    cutter = link(bpy.data.objects.new("SM_WallCutter", me))
    cutter.display_type = "WIRE"
    hide(cutter)
    mod = wall.modifiers.new("SM_Openings", "BOOLEAN")
    mod.operation = "DIFFERENCE"; mod.object = cutter
    try: mod.solver = "EXACT"
    except Exception: pass


def build(link, hide, cover_image, font=None):
    rnd = random.Random(42)
    # the doorway used to show a fake daylight card; now it opens onto the street
    glow = bpy.data.objects.get("Door_OutsideGlow")
    if glow: hide(glow)
    cut_openings(link, hide)

    # ── materials
    concrete = pbr("SM_Concrete", (0.30, 0.30, 0.32), rough=0.6)
    nt = concrete.node_tree
    brick = nt.nodes.new("ShaderNodeTexBrick")
    brick.inputs["Scale"].default_value = 0.5
    brick.inputs["Color1"].default_value = (0.30, 0.30, 0.32, 1)
    brick.inputs["Color2"].default_value = (0.26, 0.26, 0.28, 1)
    brick.inputs["Mortar"].default_value = (0.08, 0.08, 0.09, 1)
    brick.inputs["Mortar Size"].default_value = 0.015
    brick.offset = 0.0
    tc = nt.nodes.new("ShaderNodeTexCoord")
    nt.links.new(tc.outputs["Object"], brick.inputs["Vector"])
    nt.links.new(brick.outputs["Color"], _bsdf(concrete).inputs["Base Color"])
    asphalt = pbr("SM_Asphalt", (0.025, 0.025, 0.03), rough=0.16)        # wet: mirrors the neon
    curb    = pbr("SM_Curb", (0.45, 0.45, 0.46), rough=0.7)
    paint   = pbr("SM_RoadPaint", (0.8, 0.78, 0.7), rough=0.5)
    metal   = pbr("SM_DarkMetal", (0.04, 0.04, 0.045), rough=0.35, metal=0.8)
    fascia  = pbr("SM_Fascia", (0.03, 0.03, 0.035), rough=0.5, metal=0.3)
    glass   = pbr("SM_ShopGlass", (0.6, 0.7, 0.8), rough=0.05, alpha=0.12)
    lamp    = pbr("SM_LampHead", (1, 0.9, 0.7), emit=(1.0, 0.78, 0.5), strength=25)
    red     = neon("SM_NeonRed", (1.0, 0.04, 0.08), 14)
    cyan    = neon("SM_NeonCyan", (0.0, 0.85, 1.0), 9)
    magenta = neon("SM_NeonMagenta", (1.0, 0.05, 0.7), 11)
    warm    = neon("SM_WarmStrip", (1.0, 0.75, 0.45), 6)
    nb_wall = pbr("SM_NeighbourWall", (0.07, 0.055, 0.05), rough=0.85)
    win_on  = pbr("SM_WindowOn", (0.2, 0.15, 0.1), emit=(1.0, 0.72, 0.42), strength=3.5)
    win_off = pbr("SM_WindowOff", (0.02, 0.025, 0.035), rough=0.1)

    # ── street
    box_span(link, "SM_Sidewalk", -45, 45, -22.2, -17.09, -0.3, 0.0, concrete)
    box_span(link, "SM_Curb", -45, 45, -22.45, -22.2, -0.4, 0.02, curb)
    box_span(link, "SM_Road", -45, 45, -42, -22.45, -0.6, -0.3, asphalt)
    for x in range(-42, 45, 4):
        box_span(link, f"SM_Lane_{x}", x, x + 2, -31.1, -30.9, -0.3, -0.295, paint)

    # ── storefront
    box_span(link, "SM_Fascia", -12.1, 12.1, -17.35, -17.09, 3.9, 5.7, fascia)
    box_span(link, "SM_Parapet", -12.2, 12.2, -17.4, -16.9, 5.7, 6.1, metal)
    box_span(link, "SM_FasciaStrip", -11.6, 11.6, -17.4, -17.34, 3.88, 3.93, warm)
    text(link, "SM_SignMain", "AEK STORE", 1.15, (0, -17.42, 4.95), red, font, extrude=0.05)
    text(link, "SM_SignSub", "VIDEO GAME STORE", 0.3, (0, -17.38, 4.18), cyan, font)
    # door: neon frame + canopy
    box_span(link, "SM_DoorNeonL", -1.56, -1.46, -17.2, -17.12, 0, 3.5, cyan)
    box_span(link, "SM_DoorNeonR", 1.46, 1.56, -17.2, -17.12, 0, 3.5, cyan)
    box_span(link, "SM_DoorNeonTop", -1.56, 1.56, -17.2, -17.12, 3.42, 3.52, cyan)
    box_span(link, "SM_Canopy", -2.3, 2.3, -18.4, -17.09, 3.62, 3.78, metal)
    box_span(link, "SM_CanopyStrip", -2.2, 2.2, -18.42, -18.36, 3.6, 3.66, red)
    # windows: glass, frames, OPEN sign, cover standee
    for i, (x0, x1) in enumerate(WINDOWS):
        z0, z1 = WIN_Z
        box_span(link, f"SM_Glass_{i}", x0, x1, -17.03, -17.01, z0, z1, glass)
        box_span(link, f"SM_WinSill_{i}", x0 - 0.1, x1 + 0.1, -17.3, -17.09, z0 - 0.12, z0, metal)
        box_span(link, f"SM_WinTop_{i}", x0 - 0.1, x1 + 0.1, -17.2, -17.09, z1, z1 + 0.08, metal)
    text(link, "SM_OpenSign", "OPEN", 0.42, (-3.35, -16.97, 2.55), magenta, font)
    box_span(link, "SM_OpenBorder", -3.95, -2.75, -16.96, -16.94, 2.24, 2.27, magenta)
    for key, x in (("spiderman", 3.35), ):
        img = cover_image(key)
        if img: image_panel(link, "SM_WindowStandee", img, 0.95, 1.42, (x, -16.7, 1.4), 1.0)
    # lightbox posters on the facade
    for key, x in (("cyberpunk", -7.6), ("eldenring", 7.6)):
        img = cover_image(key)
        if not img: continue
        box_span(link, f"SM_LightboxFrame_{key}", x - 1.12, x + 1.12, -17.2, -17.09, 0.65, 3.6, metal)
        image_panel(link, f"SM_Lightbox_{key}", img, 2.0, 2.85, (x, -17.21, 2.12), 1.3)
        box_span(link, f"SM_LightboxGlow_{key}", x - 1.12, x + 1.12, -17.26, -17.2, 3.6, 3.65, warm)

    # ── neighbouring buildings with lit windows
    for side, (x0, x1), h in ((-1, (-45, -12.3), 8.5), (1, (12.3, 45), 7.0)):
        box_span(link, f"SM_Neighbour_{side}", x0, x1, -17.25, 12, 0, h, nb_wall)
        xs = [x for x in range(int(min(x0, x1)) + 2, int(max(x0, x1)) - 1, 3)]
        for fl, z in enumerate([4.3, 6.3] if h > 7.5 else [4.3]):
            for x in xs:
                on = rnd.random() < 0.55
                box_span(link, f"SM_NWin_{side}_{fl}_{x}", x, x + 1.4, -17.3, -17.24, z, z + 1.3, win_on if on else win_off)
        # dark shop shutter at street level
        sx = -18 if side < 0 else 18
        box_span(link, f"SM_Shutter_{side}", sx - 2.5, sx + 2.5, -17.3, -17.24, 0, 3.0, pbr(f"SM_ShutterMat_{side}", (0.12, 0.12, 0.13), rough=0.5, metal=0.6))

    # ── street lamps
    for x in (-9.0, 9.0, -27.0, 27.0):
        box_span(link, f"SM_LampPole_{x}", x - 0.07, x + 0.07, -21.8, -21.66, 0, 4.7, metal)
        box_span(link, f"SM_LampArm_{x}", x - 0.05, x + 0.05, -21.8, -20.6, 4.6, 4.7, metal)
        box_span(link, f"SM_LampHead_{x}", x - 0.22, x + 0.22, -20.9, -20.45, 4.48, 4.6, lamp)
        light(link, f"SM_LampLight_{x}", "SPOT", (x, -20.7, 4.4), 2200, (1.0, 0.78, 0.52), spot=math.radians(110))
    # warm spill under the canopy, cool moonlight, glow from the windows
    light(link, "SM_CanopyLight", "AREA", (0, -17.9, 3.5), 260, (1.0, 0.85, 0.7), size=2.2)
    light(link, "SM_Moon", "SUN", (0, 0, 20), 0.35, (0.55, 0.65, 1.0), rot=(math.radians(55), 0, math.radians(-30)))
    for x0, x1 in WINDOWS:
        light(link, f"SM_WindowSpill_{x0}", "AREA", ((x0 + x1) / 2, -16.6, 2.0), 180, (1.0, 0.9, 0.75), size=1.8,
              rot=(math.radians(-90), 0, 0))
    light(link, "SM_SignGlow", "AREA", (0, -18.4, 5.0), 400, (1.0, 0.15, 0.2), size=5,
          rot=(math.radians(90), 0, 0))
