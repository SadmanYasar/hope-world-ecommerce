/**
 * Generates a random height based on the provided index.
 *
 * For even indices, the height is calculated as 500 plus the remainder of the index divided by 7, multiplied by 50.
 * For odd indices, the height is calculated as 450 plus the remainder of the index divided by 5, multiplied by 60.
 *
 * @param {number} index - The index used to determine the height.
 * @returns {number} The calculated height.
 */
const randomHeight = (index: number): number =>
  index % 2 === 0 ? 500 + (index % 7) * 50 : 450 + (index % 5) * 60;

export default randomHeight;
