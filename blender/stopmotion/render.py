"""Render the stop-motion tour straight to an H.264 MP4 (web-friendly)."""
import bpy, os, time
s = bpy.context.scene
here = os.path.dirname(bpy.data.filepath)
s.render.resolution_percentage = 100
s.render.filepath = os.path.join(here, "pixel_vault_stopmotion.mp4")
im = s.render.image_settings
try:
    im.media_type = 'VIDEO'          # Blender 4.5+/5.x
except Exception:
    pass
im.file_format = 'FFMPEG'
ff = s.render.ffmpeg
ff.format = 'MPEG4'
ff.codec = 'H264'
ff.constant_rate_factor = 'HIGH'
ff.ffmpeg_preset = 'GOOD'
ff.gopsize = 12
ff.audio_codec = 'NONE'
t = time.time()
bpy.ops.render.render(animation=True)
print(f"RENDERED {s.frame_end} frames in {time.time()-t:.0f}s -> {s.render.filepath}")
