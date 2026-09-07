export * from './types.js'
export { analyserDocument, serialiserDocument } from './dom.js'
export { analyserGabarit, ErreurGabarit } from './gabarit/analyse.js'

export function versionMoteur(): string {
  return '1.0.0'
}
export { remplirTextes } from './gabarit/remplissage.js'
