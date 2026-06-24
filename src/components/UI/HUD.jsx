import { useStore } from '../../hooks/useStore'

export default function HUD() {
  const { gold, owned, nearbyGame, shopOpen, toast } = useStore()

  return (
    <>
      {/* Top bar */}
      <div className="hud-top">
        <div className="hud-title">⚔ ARCANE EMPORIUM</div>
        <div className="hud-gold">
          <span className="hud-gold-icon">◈</span>
          <span className="hud-gold-val">{gold.toFixed(2)}</span>
        </div>
        <div className="hud-owned">OWNED: {owned.size}</div>
      </div>

      {/* Controls hint */}
      {!shopOpen && (
        <div className="hud-controls">
          <span>WASD — Move</span>
          <span>Mouse — Look</span>
          {nearbyGame && <span className="hud-interact">[ E ] Inspect {nearbyGame.title}</span>}
        </div>
      )}

      {/* Toast */}
      {toast && (
        <div className={`hud-toast ${toast.type}`}>{toast.msg}</div>
      )}
    </>
  )
}
