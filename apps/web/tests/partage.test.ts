import { describe, expect, it } from 'vitest'

/**
 * Le produit est un lien que l'on partage. Un bouton de partage qui n'envoie
 * pas ce lien ne sert à rien — et c'est exactement ce qui se passait.
 */
function texteWhatsApp(titre: string, lien: string): string {
  return `Une invitation pour vous — ${titre}\n${lien}`
}

describe('le message de partage', () => {
  it('porte le lien, pas seulement une phrase', () => {
    const message = texteWhatsApp('Aminata & Ibrahima', 'https://myday.sn/e/aminata-ibrahima')
    expect(message).toContain('https://myday.sn/e/aminata-ibrahima')
  })

  it('reste lisible une fois encodé pour wa.me', () => {
    const message = texteWhatsApp('Aminata & Ibrahima', 'https://myday.sn/e/aminata-ibrahima')
    const url = `https://wa.me/?text=${encodeURIComponent(message)}`
    expect(decodeURIComponent(new URL(url).searchParams.get('text')!)).toBe(message)
  })

  it('n’ampute pas le titre sur l’esperluette', () => {
    const url = `https://wa.me/?text=${encodeURIComponent(texteWhatsApp('Awa & Moussa', 'https://myday.sn/e/x'))}`
    expect(new URL(url).searchParams.get('text')).toContain('Awa & Moussa')
  })
})
