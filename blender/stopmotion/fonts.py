import bpy
for o in bpy.data.objects:
    if o.type == 'FONT' and ('VAULT' in o.data.body.upper() or 'PIXEL' in o.data.body.upper()):
        print("FONT", o.name, repr(o.data.body), [c.name for c in o.users_collection])
