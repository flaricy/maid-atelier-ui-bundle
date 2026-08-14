import { mkdtemp, mkdir, readFile, symlink, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'
import { inside, insideExisting, list, preview, search, writeWorkspaceFile } from '../src/index.ts'

describe('workspace file browser', () => {
  it('rejects traversal outside the configured root', async () => {
    const root = await mkdtemp(join(tmpdir(), 'dsh-file-browser-'))
    expect(() => inside(root, '../secret')).toThrow('outside')
  })

  it('lists directories first and hides dependency internals', async () => {
    const root = await mkdtemp(join(tmpdir(), 'dsh-file-browser-'))
    await mkdir(join(root, 'src'))
    await mkdir(join(root, 'node_modules'))
    await writeFile(join(root, 'README.md'), '# Hello\n')
    expect(await list(root, '')).toEqual([
      { name: 'src', path: 'src', kind: 'directory' },
      { name: 'README.md', path: 'README.md', kind: 'file', size: 8 },
    ])
  })

  it('classifies UTF-8 text, images, empty, binary, and oversized files', async () => {
    const root = await mkdtemp(join(tmpdir(), 'dsh-file-browser-'))
    await writeFile(join(root, 'a.ts'), 'export {}\n')
    await writeFile(join(root, 'pixel.png'), Buffer.from([1, 2, 3]))
    await writeFile(join(root, 'raw.bin'), Buffer.from([1, 0, 2]))
    await writeFile(join(root, 'empty.txt'), '')
    expect((await preview(root, 'a.ts', 100, 100)).kind).toBe('text')
    expect((await preview(root, 'pixel.png', 100, 100)).kind).toBe('image')
    expect((await preview(root, 'raw.bin', 100, 100)).kind).toBe('binary')
    expect((await preview(root, 'empty.txt', 100, 100)).kind).toBe('empty')
    expect((await preview(root, 'a.ts', 2, 100)).kind).toBe('too-large')
  })

  it('searches nested files without requiring directories to be loaded first', async () => {
    const root = await mkdtemp(join(tmpdir(), 'dsh-file-browser-'))
    await mkdir(join(root, 'app', 'services'), { recursive: true })
    await writeFile(join(root, 'app', 'services', 'detection_service.py'), '')
    await writeFile(join(root, 'app', 'main.py'), '')
    const result = await search(root, 'detection', 20)
    expect(result).toEqual({
      matches: [{ name: 'detection_service.py', path: 'app/services/detection_service.py', kind: 'file' }],
      truncated: false,
    })
  })

  it('does not follow a directory symlink outside the workspace', async () => {
    const root = await mkdtemp(join(tmpdir(), 'dsh-file-browser-'))
    const external = await mkdtemp(join(tmpdir(), 'dsh-file-browser-external-'))
    await writeFile(join(external, 'secret.txt'), 'secret\n')
    await symlink(external, join(root, 'escape'), 'dir')

    await expect(list(root, 'escape')).rejects.toThrow('outside')
    await expect(insideExisting(root, 'escape/secret.txt')).rejects.toThrow('outside')
    await expect(writeWorkspaceFile(root, 'escape/new.txt', 'escaped\n')).rejects.toThrow('outside')
    await expect(readFile(join(external, 'new.txt'), 'utf8')).rejects.toMatchObject({ code: 'ENOENT' })
    expect(await search(root, 'secret', 20)).toEqual({ matches: [], truncated: false })
  })

  it('rejects preview, write, and path resolution through an external file symlink', async () => {
    const root = await mkdtemp(join(tmpdir(), 'dsh-file-browser-'))
    const external = await mkdtemp(join(tmpdir(), 'dsh-file-browser-external-'))
    const externalFile = join(external, 'secret.txt')
    await writeFile(externalFile, 'secret\n')
    await symlink(externalFile, join(root, 'secret.txt'), 'file')

    await expect(preview(root, 'secret.txt', 100, 100)).rejects.toThrow('outside')
    await expect(insideExisting(root, 'secret.txt')).rejects.toThrow('outside')
    await expect(writeWorkspaceFile(root, 'secret.txt', 'changed\n')).rejects.toThrow('outside')
    expect(await readFile(externalFile, 'utf8')).toBe('secret\n')
  })
})
