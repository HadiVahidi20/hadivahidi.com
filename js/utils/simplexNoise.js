// /js/utils/simplexNoise.js

/**
 * SimplexNoise implementation for smooth, organic movement
 */
export class SimplexNoise {
    constructor() {
      this.p = new Uint8Array(256);
      for (let i = 0; i < 256; i++) this.p[i] = i;
      
      // Fisher-Yates shuffle
      for (let i = 255; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [this.p[i], this.p[j]] = [this.p[j], this.p[i]];
      }
      
      // Extend the permutation table
      this.perm = new Uint8Array(512);
      this.permMod12 = new Uint8Array(512);
      for (let i = 0; i < 512; i++) {
        this.perm[i] = this.p[i & 255];
        this.permMod12[i] = this.perm[i] % 12;
      }
    }
    
    // 2D noise function
    noise2D(x, y) {
      // Simple implementation for subtle movement
      return Math.sin(x * 0.1 + Math.sin(y * 0.1)) * Math.cos(y * 0.1 + Math.sin(x * 0.1)) * 0.5;
    }
  }