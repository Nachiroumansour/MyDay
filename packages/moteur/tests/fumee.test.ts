import { describe, expect, it } from 'vitest'
import { versionMoteur } from '../src/index'

describe('paquet moteur', () => {
  it('expose sa version', () => {
    expect(versionMoteur()).toBe('1.0.0')
  })
})
