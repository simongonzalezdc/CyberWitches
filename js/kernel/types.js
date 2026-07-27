/**
 * @typedef {Object} KernelState
 * @property {number} version
 * @property {number} ab
 * @property {Record<string, number>} inventory
 * @property {Record<string, number>} workstations
 * @property {Record<string, number>} upgradesOwned
 * @property {Record<string, number>} prestigeBonuses
 * @property {number} prestigeCount
 * @property {number} prestigeLifetimeEarned
 * @property {number} totalTaps
 * @property {string|null} elementSpecialization
 * @property {Record<string, number>} specializationBonuses
 * @property {number} storageCap
 * @property {Record<string, number>} resourceCaps
 * @property {{ reached: string[], qualities: Record<string, number|string|boolean> }} chapters
 * @property {{ fire: number, water: number, air: number, crystal: number }} affinity
 * @property {string[]} contractsCompleted
 * @property {number} rngSeed
 * @property {number} tick
 * @property {number} designTier
 * @property {number[]} unlockedTiers
 */

/**
 * @typedef {{ type: string, [k: string]: unknown }} KernelCommand
 */

/**
 * @typedef {{ type: string, [k: string]: unknown }} DomainEvent
 */

/**
 * @typedef {{ state: KernelState, events: DomainEvent[] }} DispatchResult
 */

export {};
