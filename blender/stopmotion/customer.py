"""
Blocky stop-motion customer, same proportions as the website's CharacterMesh.tsx.
Local axes: +Y forward, +Z up. Joints are empties, so every frame is a hand-set pose.
"""
import bpy, math, random
from mathutils import Vector

COLORS = dict(
    hoodie=(0.55, 0.03, 0.04), pants=(0.035, 0.05, 0.1), skin=(0.52, 0.3, 0.17),
    hair=(0.03, 0.02, 0.015), cap=(0.85, 0.85, 0.87), shoe=(0.9, 0.9, 0.92),
    sole=(0.0, 0.9, 1.0), pack=(0.02, 0.12, 0.12), eye=(0.01, 0.01, 0.01),
)


class Customer:
    def __init__(self, link, make_box, pbr):
        self.link = link
        m = {k: pbr(f"SM_Cust_{k}", c, rough=0.8) for k, c in COLORS.items()}
        m["sole"] = pbr("SM_Cust_sole", COLORS["sole"], emit=COLORS["sole"], strength=6)
        m["logo"] = pbr("SM_Cust_logo", COLORS["sole"], emit=COLORS["sole"], strength=4)
        self.meshes = []

        def empty(name, loc, parent):
            e = link(bpy.data.objects.new(name, None))
            e.location = loc; e.parent = parent
            e.empty_display_size = 0.1
            return e

        def part(name, size, loc, mat, parent):
            o = make_box(name, size, loc, m[mat], parent=parent)
            self.meshes.append(o)
            return o

        self.root = empty("SM_Cust", (0, 0, 0), None)
        r = self.root
        # torso, logo strip, backpack
        part("SM_Cust_Body", (0.54, 0.28, 0.72), (0, 0, 1.05), "hoodie", r)
        part("SM_Cust_Logo", (0.35, 0.01, 0.08), (0, 0.145, 1.05), "logo", r)
        part("SM_Cust_Pack", (0.38, 0.15, 0.44), (0, -0.21, 1.08), "pack", r)
        # head on a neck pivot
        self.head = empty("SM_Cust_Neck", (0, 0, 1.40), r)
        part("SM_Cust_Head", (0.3, 0.28, 0.3), (0, 0, 0.15), "skin", self.head)
        part("SM_Cust_Hair", (0.32, 0.3, 0.06), (0, -0.01, 0.31), "hair", self.head)
        part("SM_Cust_Cap", (0.33, 0.31, 0.08), (0, 0, 0.36), "cap", self.head)
        part("SM_Cust_Brim", (0.28, 0.12, 0.025), (0, 0.2, 0.33), "cap", self.head)
        for sx in (-1, 1):
            part(f"SM_Cust_Eye_{sx}", (0.045, 0.01, 0.05), (sx * 0.07, 0.141, 0.17), "eye", self.head)
        # arms on shoulder pivots
        self.sh = {}
        for side, sx in (("L", -1), ("R", 1)):
            p = empty(f"SM_Cust_Shoulder{side}", (sx * 0.36, 0, 1.31), r)
            part(f"SM_Cust_Arm{side}", (0.17, 0.17, 0.62), (0, 0, -0.31), "hoodie", p)
            part(f"SM_Cust_Hand{side}", (0.15, 0.15, 0.1), (0, 0, -0.66), "skin", p)
            self.sh[side] = p
        # legs: hip -> knee pivots
        self.hip, self.knee = {}, {}
        for side, sx in (("L", -1), ("R", 1)):
            h = empty(f"SM_Cust_Hip{side}", (sx * 0.13, 0, 0.875), r)
            part(f"SM_Cust_Thigh{side}", (0.19, 0.19, 0.375), (0, 0, -0.1875), "pants", h)
            k = empty(f"SM_Cust_Knee{side}", (0, 0, -0.375), h)
            part(f"SM_Cust_Shin{side}", (0.19, 0.19, 0.375), (0, 0, -0.1875), "pants", k)
            part(f"SM_Cust_Shoe{side}", (0.18, 0.28, 0.1), (0, 0.04, -0.42), "shoe", k)
            part(f"SM_Cust_Sole{side}", (0.17, 0.27, 0.02), (0, 0.04, -0.47), "sole", k)
            self.hip[side], self.knee[side] = h, k
        self.joints = [self.root, self.head, *self.sh.values(), *self.hip.values(), *self.knee.values()]

    # ── posing ──────────────────────────────────────────────────────────────
    def pose(self, f, loc, yaw, mode="stand", phase=0.0):
        """Set and key one stop-motion pose. mode: walk | stand | look | reach | pay | sit"""
        rng = random.Random(f * 31 + 7)
        boil = lambda a: rng.uniform(-a, a)          # hand-posed imperfection, new every frame
        for j in self.joints:
            j.rotation_euler = (0, 0, 0)
        x, y, z = loc
        hipL = hipR = kneeL = kneeR = shL = shR = 0.0
        head_pitch, head_yaw, bob = 0.0, 0.0, 0.0

        if mode == "walk":
            s, c = math.sin(phase), math.cos(phase)
            hipL, hipR = 0.5 * s, -0.5 * s
            kneeL = -0.95 * max(0.0, c)              # bend while the leg swings through
            kneeR = -0.95 * max(0.0, -c)
            shL, shR = -0.45 * s, 0.45 * s
            bob = 0.035 * (1 - abs(s))
            head_yaw = 0.05 * s
        elif mode == "sit":
            hipL = hipR = math.pi / 2
            kneeL = kneeR = -math.pi / 2
            shL = shR = 0.45
            head_pitch = 0.08
        elif mode == "reach":                         # reaching up to a shelf
            shR = 2.5 + boil(0.08)
            shL = 0.1
            head_pitch = 0.3
        elif mode == "pay":                           # handing over at the counter
            shR = 1.25 + boil(0.06)
            head_pitch = -0.12
        elif mode == "look":                          # checking out a display
            shL, shR = 0.05, 0.6
            head_yaw = 0.25 * math.sin(f * 0.35)
            head_pitch = 0.12
        else:                                         # stand / idle breathing
            bob = 0.01 * math.sin(f * 0.6)

        self.root.location = (x, y, z + bob)
        self.root.rotation_euler = (0, 0, yaw + boil(0.025))
        self.head.rotation_euler = (head_pitch + boil(0.03), 0, head_yaw + boil(0.04))
        self.sh["L"].rotation_euler = (shL + boil(0.04), 0, -0.06)
        self.sh["R"].rotation_euler = (shR + boil(0.04), 0, 0.06)
        self.hip["L"].rotation_euler = (hipL, 0, 0)
        self.hip["R"].rotation_euler = (hipR, 0, 0)
        self.knee["L"].rotation_euler = (kneeL, 0, 0)
        self.knee["R"].rotation_euler = (kneeR, 0, 0)
        self.root.keyframe_insert("location", frame=f)
        for j in self.joints:
            j.keyframe_insert("rotation_euler", frame=f)

    def set_visible(self, visible, f, set_vis):
        for o in self.meshes:
            set_vis(o, visible, f)


def facing(dx, dy):
    """Yaw that turns local +Y toward (dx, dy)."""
    return math.atan2(-dx, dy)
