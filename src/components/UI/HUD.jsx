import { useStore } from '../../hooks/useStore'

export default function HUD() {
  const { balance, owned, nearbyGame, shopOpen, toast } = useStore()

  return (
    <>
      <div className="hud-top">
        <div className="hud-logo">🎮 PIXEL VAULT</div>
        <div className="hud-balance">
          <span className="balance-icon">$</span>
          <span className="balance-val">{balance.toFixed(2)}</span>
        </div>
        <div className="hud-library">LIBRARY: {owned.size}</div>
      </div>

      {!shopOpen && (
        <div className="hud-controls">
          <span>WASD — Move</span>
          <span>Mouse — Look</span>
          {nearbyGame && <span className="hud-interact pulse">[ E ] View {nearbyGame.title}</span>}
        </div>
      )}

      {toast && <div className={`hud-toast ${toast.type}`}>{toast.msg}</div>}
    </>
  )
}
