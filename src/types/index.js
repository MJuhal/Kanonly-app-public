/**
 * @typedef {Object} Ticket
 * @property {string} id
 * @property {string} title
 * @property {string} description
 * @property {string[]} links
 * @property {string[]} images
 * @property {string} columnId
 * @property {'low'|'medium'|'high'} [priority]
 * @property {number} createdAt
 */

/**
 * @typedef {Object} Column
 * @property {string} id
 * @property {string} title
 * @property {string} boardId
 * @property {number} order
 * @property {string[]} ticketIds
 */

/**
 * @typedef {Object} Board
 * @property {string} id
 * @property {string} name
 * @property {number} createdAt
 */

/**
 * @typedef {Object} AppData
 * @property {Board[]} boards
 * @property {Column[]} columns
 * @property {Ticket[]} tickets
 */

export {};
