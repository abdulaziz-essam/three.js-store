"""Re-encode the master render into a light 720p web version via Blender's sequencer."""
import bpy, os, sys
here = os.path.dirname(os.path.abspath(__file__))
src = os.path.join(here, "pixel_vault_stopmotion.mp4")
dst = os.path.join(here, "pixel_vault_stopmotion_web.mp4")
s = bpy.context.scene
s.sequence_editor_create()
ed = s.sequence_editor
strips = ed.strips if hasattr(ed, "strips") else ed.sequences
m = strips.new_movie("tour", src, channel=1, frame_start=1)
s.render.fps = 12; s.render.fps_base = 1
s.frame_start = 1; s.frame_end = m.frame_final_end - 1
s.render.resolution_x, s.render.resolution_y, s.render.resolution_percentage = 1280, 720, 100
try:
    s.render.image_settings.media_type = 'VIDEO'
except Exception:
    pass
s.render.image_settings.file_format = 'FFMPEG'
ff = s.render.ffmpeg
ff.format = 'MPEG4'; ff.codec = 'H264'
ff.constant_rate_factor = 'LOW'; ff.ffmpeg_preset = 'BEST'; ff.gopsize = 24
ff.audio_codec = 'NONE'
s.render.use_sequencer = True
s.render.filepath = dst
bpy.ops.render.render(animation=True)
print("WEB", s.frame_end, "frames ->", dst, os.path.getsize(dst) // 1024, "KB")
