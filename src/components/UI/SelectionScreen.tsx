import { useState, useEffect } from 'react'
import { DEVICES } from '../../data/devices'
import { useSelectionScreen } from '../../hooks/useSelectionScreen'
import { GAMES } from '../../data/games'
import '../../styles/SelectionScreen.css'

type MenuTab = 'enter' | 'profile' | 'options' | 'terms' | 'about'

const MENU_ITEMS: { id: MenuTab; icon: string; label: string; badge?: string }[] = [
  { id: 'enter',   icon: '▶',  label: 'Enter Store' },
  { id: 'profile', icon: '◈',  label: 'Store Profile', badge: 'SETUP' },
  { id: 'options', icon: '⚙',  label: 'Options' },
  { id: 'terms',   icon: '§',  label: 'Terms & Conditions' },
  { id: 'about',   icon: '◉',  label: 'About Us' },
]

export default function SelectionScreen() {
  const {
    device,
    genre,
    setGenre,
    selectDevice,
    availableGenres,
    ALL_GENRES,
    matchCount,
    handleEnter,
    canEnter,
  } = useSelectionScreen()

  const [activeTab, setActiveTab] = useState<MenuTab>('enter')
  const [playerName, setPlayerName] = useState('PLAYER_01')
  const [panelKey, setPanelKey] = useState(0)

  // Keyboard navigation: left/right or up/down to switch tabs
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const tabs = MENU_ITEMS.map(m => m.id)
      const idx = tabs.indexOf(activeTab)
      if (e.key === 'ArrowDown') {
        setActiveTab(tabs[(idx + 1) % tabs.length])
      } else if (e.key === 'ArrowUp') {
        setActiveTab(tabs[(idx - 1 + tabs.length) % tabs.length])
      } else if (e.key === 'Enter' && activeTab === 'enter' && canEnter) {
        handleEnter()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [activeTab, canEnter, handleEnter])

  function switchTab(tab: MenuTab) {
    setActiveTab(tab)
    setPanelKey(k => k + 1)
  }

  return (
    <div className="sel-overlay">
      {/* Background */}
      <div className="sel-bg">
        <div className="sel-bg-grid" />
        <div className="sel-bg-glow-left" />
        <div className="sel-bg-glow-right" />
        <div className="sel-scanlines" />
      </div>

      {/* Layout */}
      <div className="sel-layout">

        {/* ── Left sidebar ── */}
        <aside className="sel-sidebar">
          <div className="sel-logo-wrap">
            <p className="sel-logo-eyebrow">Est. 2025 · Digital Storefront</p>
            <div className="sel-logo">PIXEL <span>VAULT</span></div>
            <p className="sel-logo-sub">Next-Gen Game Store</p>
          </div>

          <nav className="sel-menu">
            {MENU_ITEMS.map(item => (
              <button
                key={item.id}
                className={`sel-menu-item ${activeTab === item.id ? 'active' : ''}`}
                onClick={() => switchTab(item.id)}
                style={{ color: activeTab === item.id ? '#00eeff' : undefined }}
              >
                <span className="sel-menu-icon">{item.icon}</span>
                <span className="sel-menu-label">{item.label}</span>
                {item.badge && (
                  <span className="sel-menu-badge">{item.badge}</span>
                )}
                <span className="sel-menu-arrow">›</span>
              </button>
            ))}
          </nav>

          <p className="sel-version">v1.0.0 · PIXEL VAULT ENGINE</p>
        </aside>

        {/* ── Right panel ── */}
        <main className="sel-panel">

          {/* ENTER STORE */}
          {activeTab === 'enter' && (
            <div className="sel-panel-enter" key={panelKey}>
              <div className="sel-panel-enter-title">
                PIXEL<br />VAULT
              </div>
              <p className="sel-panel-enter-sub">Your digital game collection awaits</p>

              <button
                className={`sel-enter-btn ${canEnter ? '' : 'disabled'}`}
                onClick={canEnter ? handleEnter : undefined}
                disabled={!canEnter}
              >
                <span>{canEnter ? 'ENTER STORE' : 'SET UP PROFILE FIRST'}</span>
              </button>

              {!canEnter && (
                <p className="sel-enter-hint">
                  ◈ Go to STORE PROFILE to choose your platform &amp; genre
                </p>
              )}
              {canEnter && (
                <p className="sel-enter-hint">Press ENTER or click to start</p>
              )}
            </div>
          )}

          {/* STORE PROFILE */}
          {activeTab === 'profile' && (
            <div className="sel-profile-card" key={panelKey}>
              <div className="sel-corner tl" />
              <div className="sel-corner tr" />
              <div className="sel-corner bl" />
              <div className="sel-corner br" />

              {/* Avatar + Name */}
              <div className="sel-profile-header">
                <div className="sel-avatar">🎮</div>
                <div className="sel-profile-info">
                  <p className="sel-profile-label">Gamer Tag</p>
                  <input
                    className="sel-profile-name-input"
                    value={playerName}
                    onChange={e => setPlayerName(e.target.value.toUpperCase().slice(0, 16))}
                    placeholder="PLAYER_01"
                    maxLength={16}
                    spellCheck={false}
                  />
                </div>
              </div>

              {/* Platform */}
              <div className="sel-profile-section">
                <p className="sel-section-label">Platform</p>
                <div className="sel-device-row">
                  {DEVICES.map((d) => {
                    const hasGames = GAMES.some((g) => g.platform.includes(d.id))
                    return (
                      <button
                        key={d.id}
                        className={`sel-device-btn ${device === d.id ? 'active' : ''} ${!hasGames ? 'disabled' : ''}`}
                        onClick={() => hasGames && selectDevice(d.id)}
                      >
                        <span className="sel-device-icon">{d.icon}</span>
                        <span>{d.label}</span>
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* Genre */}
              <div className="sel-profile-section">
                <p className="sel-section-label">Favourite Genre</p>
                <div className="sel-genre-row">
                  {ALL_GENRES.map((g) => {
                    const available = availableGenres.includes(g)
                    return (
                      <button
                        key={g}
                        className={`sel-genre-btn ${genre === g ? 'active' : ''} ${!available ? 'disabled' : ''}`}
                        onClick={() => available && setGenre(g)}
                      >
                        {g}
                      </button>
                    )
                  })}
                </div>

                {matchCount !== null && (
                  <p className="sel-match-text">
                    {matchCount === 0
                      ? '— No games match this selection —'
                      : `${matchCount} game${matchCount > 1 ? 's' : ''} available in store`}
                  </p>
                )}
              </div>

              <button
                className={`sel-save-btn ${canEnter ? '' : 'disabled'}`}
                onClick={canEnter ? handleEnter : undefined}
                disabled={!canEnter}
              >
                <span>{canEnter ? '▶  ENTER STORE' : 'SELECT PLATFORM & GENRE TO CONTINUE'}</span>
              </button>
            </div>
          )}

          {/* OPTIONS */}
          {activeTab === 'options' && (
            <div className="sel-options-card" key={panelKey}>
              <p className="sel-options-title">Options</p>

              {[
                { name: 'Graphics',    val: 'ULTRA' },
                { name: 'Resolution',  val: '1920 × 1080' },
                { name: 'VSync',       val: 'ON' },
                { name: 'Bloom',       val: 'ON' },
                { name: 'Audio',       val: '100%' },
                { name: 'Music',       val: '80%' },
              ].map(opt => (
                <div className="sel-option-row" key={opt.name}>
                  <span className="sel-option-name">{opt.name}</span>
                  <span className="sel-option-val">{opt.val}</span>
                </div>
              ))}
            </div>
          )}

          {/* TERMS & CONDITIONS */}
          {activeTab === 'terms' && (
            <div className="sel-doc-card" key={panelKey}>
              <div className="sel-corner tl" />
              <div className="sel-corner tr" />
              <div className="sel-corner bl" />
              <div className="sel-corner br" />
              <p className="sel-doc-eyebrow">Legal · Last updated 2025</p>
              <h2 className="sel-doc-title">Terms &amp; Conditions</h2>
              <div className="sel-doc-body">
                <div className="sel-doc-section">
                  <p className="sel-doc-section-title">1. Acceptance of Terms</p>
                  <p>By accessing or using Pixel Vault, you agree to be bound by these Terms and Conditions. If you do not agree with any part of these terms, you may not use our service.</p>
                </div>
                <div className="sel-doc-section">
                  <p className="sel-doc-section-title">2. Digital Purchases</p>
                  <p>All purchases made through Pixel Vault are final. Digital game licenses are non-transferable and tied to your account. Refunds are available within 2 hours of purchase if the game has not been launched.</p>
                </div>
                <div className="sel-doc-section">
                  <p className="sel-doc-section-title">3. Account Responsibility</p>
                  <p>You are responsible for maintaining the security of your account. Pixel Vault will not be liable for any loss resulting from unauthorised use of your account.</p>
                </div>
                <div className="sel-doc-section">
                  <p className="sel-doc-section-title">4. Intellectual Property</p>
                  <p>All game titles, artwork, and content available on Pixel Vault are the property of their respective developers and publishers. Pixel Vault does not claim ownership over any third-party content.</p>
                </div>
                <div className="sel-doc-section">
                  <p className="sel-doc-section-title">5. Limitation of Liability</p>
                  <p>Pixel Vault is provided "as is" without warranties of any kind. We reserve the right to modify, suspend, or discontinue the service at any time without notice.</p>
                </div>
                <div className="sel-doc-section">
                  <p className="sel-doc-section-title">6. Changes to Terms</p>
                  <p>We reserve the right to update these terms at any time. Continued use of Pixel Vault after changes constitutes your acceptance of the new terms.</p>
                </div>
              </div>
            </div>
          )}

          {/* ABOUT US */}
          {activeTab === 'about' && (
            <div className="sel-doc-card" key={panelKey}>
              <div className="sel-corner tl" />
              <div className="sel-corner tr" />
              <div className="sel-corner bl" />
              <div className="sel-corner br" />
              <p className="sel-doc-eyebrow">Est. 2025 · Digital Storefront</p>
              <h2 className="sel-doc-title">About Us</h2>
              <div className="sel-doc-body">
                <div className="sel-doc-section">
                  <p className="sel-doc-section-title">Who We Are</p>
                  <p>Pixel Vault is a next-generation digital game store built for gamers, by gamers. We believe buying games should feel as good as playing them — so we built a store you can actually walk through.</p>
                </div>
                <div className="sel-doc-section">
                  <p className="sel-doc-section-title">Our Mission</p>
                  <p>We're on a mission to reimagine digital retail. No endless scrolling, no cluttered storefronts — just you, a beautifully crafted 3D space, and the games you love.</p>
                </div>
                <div className="sel-doc-section">
                  <p className="sel-doc-section-title">The Technology</p>
                  <p>Pixel Vault is powered by React, Three.js, and WebGL. Every shelf, every cover, every neon light is rendered in real time in your browser — no downloads, no installs.</p>
                </div>
                <div className="sel-doc-stats">
                  <div className="sel-doc-stat">
                    <span className="sel-doc-stat-val">12+</span>
                    <span className="sel-doc-stat-label">Games in Store</span>
                  </div>
                  <div className="sel-doc-stat">
                    <span className="sel-doc-stat-val">4</span>
                    <span className="sel-doc-stat-label">Platforms</span>
                  </div>
                  <div className="sel-doc-stat">
                    <span className="sel-doc-stat-val">100%</span>
                    <span className="sel-doc-stat-label">WebGL Powered</span>
                  </div>
                </div>
                <div className="sel-doc-section">
                  <p className="sel-doc-section-title">Contact</p>
                  <p>Questions? Reach us at <span className="sel-doc-highlight">support@pixelvault.gg</span></p>
                </div>
              </div>
            </div>
          )}

        </main>
      </div>
    </div>
  )
}
