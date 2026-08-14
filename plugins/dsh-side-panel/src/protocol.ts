export const FILE_BROWSER_ROUTE = '/side-panel/api'

export interface BrowserEntry {
  name: string
  path: string
  kind: 'directory' | 'file'
  size?: number
}

export type ReviewMode = 'unstaged' | 'staged' | 'commits' | 'branches' | 'last-session'

export interface ReviewCommit {
  hash: string
  shortHash: string
  subject: string
  author: string
  relativeDate: string
  refs: string
}

export interface ReviewBranch {
  name: string
  current: boolean
  upstream: string
  ahead: number
  behind: number
  subject: string
}

export interface ReviewSnapshot {
  status: string
  diff: string
  branch: string
  mode: ReviewMode
  counts: { unstaged: number; staged: number }
  commits: ReviewCommit[]
  branches: ReviewBranch[]
  message?: string
}

export type Preview =
  | { kind: 'text'; path: string; name: string; extension: string; content: string; size: number }
  | { kind: 'image'; path: string; name: string; mime: string; dataUrl: string; size: number }
  | { kind: 'empty'; path: string; name: string; size: 0 }
  | { kind: 'binary'; path: string; name: string; size: number }
  | { kind: 'too-large'; path: string; name: string; size: number }

export type ApiResponse =
  | { ok: true; root: string; entries: BrowserEntry[] }
  | { ok: true; matches: BrowserEntry[]; truncated: boolean }
  | { ok: true; preview: Preview }
  | { ok: true; saved: string }
  | { ok: true; review: ReviewSnapshot }
  | { ok: true; terminal: { output: string; exitCode: number } }
  | { ok: true; pty: { id: string; output: string; exited: boolean } }
  | { ok: true; accepted: true }
  | { ok: true; path: string; parentPath: string; platform: NodeJS.Platform; distro?: string }
  | { ok: false; error: string }
