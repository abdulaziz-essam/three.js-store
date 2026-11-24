import { useState } from 'react'
import { DEVICES } from '../../data/devices'
import { useSelectionScreen } from '../../hooks/useSelectionScreen'
import { useMenuNavigation } from '../../hooks/useMenuNavigation'
import { GAMES } from '../../data/games'
import '../../styles/SelectionScreen.css'

type MenuTab = 'enter' | 'profile' | 'options' | 'terms' | 'about'

const MENU_ITEMS: { id: MenuTab; icon: string; label: string; badge?: string }[] = [
  { id: 'enter',   icon: '▶',  label: 'Enter Store' },
  { id: 'profile', icon: '◈',  label: 'Store Profile', badge: 'OPTIONAL' },
  { id: 'options', icon: '⚙',  label: 'Options' },
  { id: 'terms',   icon: '§',  label: 'Terms & Conditions' },
  { id: 'about',   icon: '◉',  label: 'About Us' },
]

const MENU_TAB_IDS = MENU_ITEMS.map(item => item.id)
const PLAYER_NAME_MAX_LENGTH = 16

const OPTIONS_ROWS = [
  { name: 'Graphics',   val: 'ULTRA' },
  { name: 'Resolution', val: '1920 × 1080' },
  { name: 'VSync',      val: 'ON' },
  { name: 'Bloom',      val: 'ON' },
  { name: 'Audio',      val: '100%' },
  { name: 'Music',      val: '80%' },
]

const TERMS_SECTIONS = [
  { title: '1. Acceptance of Terms',   body: 'By accessing or using AEK Store, you agree to be bound by these Terms and Conditions. If you do not agree with any part of these terms, you may not use our service.' },
  { title: '2. Digital Purchases',     body: 'All purchases made through AEK Store are final. Digital game licenses are non-transferable and tied to your account. Refunds are available within 2 hours of purchase if the game has not been launched.' },
  { title: '3. Account Responsibility',body: 'You are responsible for maintaining the security of your account. AEK Store will not be liable for any loss resulting from unauthorised use of your account.' },
  { title: '4. Intellectual Property', body: 'All game titles, artwork, and content available on AEK Store are the property of their respective developers and publishers. AEK Store does not claim ownership over any third-party content.' },
  { title: '5. Limitation of Liability',body: 'AEK Store is provided "as is" without warranties of any kind. We reserve the right to modify, suspend, or discontinue the service at any time without notice.' },
  { title: '6. Changes to Terms',      body: 'We reserve the right to update these terms at any time. Continued use of AEK Store after changes constitutes your acceptance of the new terms.' },
]

function CornerDecor() {
  return (
    <>
      <div className="sel-corner tl" />
      <div className="sel-corner tr" />
      <div className="sel-corner bl" />
      <div className="sel-corner br" />
    </>
  )
}

interface ProfileTabProps {
  device:          string | null
  genre:           string | null
  ALL_GENRES:      string[]
  availableGenres: string[]
  matchCount:      number | null
  canEnter:        boolean
  selectDevice:    (id: string) => void
  setGenre:        (g: string) => void
  handleEnter:     () => void
}

function ProfileTab({
  device, genre, ALL_GENRES, availableGenres,
  matchCount, canEnter, selectDevice, setGenre, handleEnter,
}: ProfileTabProps) {
  const [playerName, setPlayerName] = useState('PLAYER_01')

  return (
    <div className="sel-profile-card">
      <CornerDecor />

      <div className="sel-profile-header">
        <div className="sel-avatar">🎮</div>
        <div className="sel-profile-info">
          <p className="sel-profile-label">Gamer Tag</p>
          <input
            className="sel-profile-name-input"
            value={playerName}
            onChange={e => setPlayerName(e.target.value.toUpperCase().slice(0, PLAYER_NAME_MAX_LENGTH))}
            placeholder="PLAYER_01"
            maxLength={PLAYER_NAME_MAX_LENGTH}
            spellCheck={false}
          />
        </div>
      </div>

      <div className="sel-profile-section">
        <p className="sel-section-label">Platform</p>
        <div className="sel-device-row">
          {DEVICES.map(d => {
            const hasGames = GAMES.some(g => g.platform.includes(d.id))
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

      <div className="sel-profile-section">
        <p className="sel-section-label">Favourite Genre</p>
        <div className="sel-genre-row">
          {ALL_GENRES.map(g => {
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
  )
}

function OptionsTab() {
  return (
    <div className="sel-options-card">
      <p className="sel-options-title">Options</p>
      {OPTIONS_ROWS.map(opt => (
        <div className="sel-option-row" key={opt.name}>
          <span className="sel-option-name">{opt.name}</span>
          <span className="sel-option-val">{opt.val}</span>
        </div>
      ))}
    </div>
  )
}

function DocTab({ eyebrow, title, children }: {
  eyebrow: string
  title:   string
  children: React.ReactNode
}) {
  return (
    <div className="sel-doc-card">
      <CornerDecor />
      <p className="sel-doc-eyebrow">{eyebrow}</p>
      <h2 className="sel-doc-title">{title}</h2>
      <div className="sel-doc-body">{children}</div>
    </div>
  )
}

function DocSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="sel-doc-section">
      <p className="sel-doc-section-title">{title}</p>
      {children}
    </div>
  )
}

export default function SelectionScreen() {
  const {
    device, genre, setGenre, selectDevice,
    availableGenres, ALL_GENRES, matchCount,
    handleEnter, quickEnter, canEnter,
  } = useSelectionScreen()

  const { activeItem: activeTab, navigateTo } = useMenuNavigation({
    items: MENU_TAB_IDS,
    onConfirm: quickEnter,
  })

  const [panelKey, setPanelKey] = useState(0)

  function switchTab(tab: MenuTab) {
    navigateTo(tab)
    setPanelKey(k => k + 1)
  }

  return (
    <div className="sel-overlay">
      <div className="sel-bg">
        <div className="sel-bg-grid" />
        <div className="sel-bg-glow-left" />
        <div className="sel-bg-glow-right" />
        <div className="sel-scanlines" />
      </div>

      <div className="sel-layout">
        <aside className="sel-sidebar">
          <div className="sel-logo-wrap">
            <p className="sel-logo-eyebrow">Est. 2025 · Digital Storefront</p>
            <div className="sel-logo">AEK <span>STORE</span></div>
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
                {item.badge && <span className="sel-menu-badge">{item.badge}</span>}
                <span className="sel-menu-arrow">›</span>
              </button>
            ))}
          </nav>

          <p className="sel-version">v1.0.0 · AEK STORE ENGINE</p>
        </aside>

        <main className="sel-panel">
          {activeTab === 'enter' && (
            <div className="sel-panel-enter" key={panelKey}>
              <div className="sel-panel-enter-title">AEK<br />STORE</div>
              <p className="sel-panel-enter-sub">Your digital game collection awaits</p>
              <button className="sel-enter-btn" onClick={quickEnter}>
                <span>ENTER STORE</span>
              </button>
              <p className="sel-enter-hint">Press ENTER or click to start</p>
              {!canEnter && (
                <p className="sel-enter-hint">
                  ◈ Optional: set up STORE PROFILE to show only your platform &amp; genre
                </p>
              )}
            </div>
          )}

          {activeTab === 'profile' && (
            <ProfileTab
              key={panelKey}
              device={device}
              genre={genre}
              ALL_GENRES={ALL_GENRES}
              availableGenres={availableGenres}
              matchCount={matchCount}
              canEnter={canEnter}
              selectDevice={selectDevice}
              setGenre={setGenre}
              handleEnter={handleEnter}
            />
          )}

          {activeTab === 'options' && <OptionsTab key={panelKey} />}

          {activeTab === 'terms' && (
            <DocTab key={panelKey} eyebrow="Legal · Last updated 2025" title="Terms & Conditions">
              {TERMS_SECTIONS.map(s => (
                <DocSection key={s.title} title={s.title}><p>{s.body}</p></DocSection>
              ))}
            </DocTab>
          )}

          {activeTab === 'about' && (
            <DocTab key={panelKey} eyebrow="Est. 2025 · Digital Storefront" title="About Us">
              <DocSection title="Who We Are">
                <p>AEK Store is a next-generation digital game store built for gamers, by gamers. We believe buying games should feel as good as playing them — so we built a store you can actually walk through.</p>
              </DocSection>
              <DocSection title="Our Mission">
                <p>We're on a mission to reimagine digital retail. No endless scrolling, no cluttered storefronts — just you, a beautifully crafted 3D space, and the games you love.</p>
              </DocSection>
              <DocSection title="The Technology">
                <p>AEK Store is powered by React, Three.js, and WebGL. Every shelf, every cover, every neon light is rendered in real time in your browser — no downloads, no installs.</p>
              </DocSection>
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
              <DocSection title="Contact">
                <p>Questions? Reach us at <span className="sel-doc-highlight">support@aekstore.gg</span></p>
              </DocSection>
            </DocTab>
          )}
        </main>
      </div>
    </div>
  )
}
