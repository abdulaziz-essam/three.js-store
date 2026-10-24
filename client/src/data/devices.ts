export interface Device {
  id: string
  label: string
  icon: string
}

export const DEVICES: Device[] = [
  { id: 'pc',       label: 'PC',          icon: '🖥️' },
  { id: 'ps5',      label: 'PlayStation', icon: '🎮' },
  { id: 'xbox',     label: 'Xbox',        icon: '🟢' },
  { id: 'nintendo', label: 'Nintendo',    icon: '🔴' },
]
