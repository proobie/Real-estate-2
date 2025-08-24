declare module '*.png' {
  const value: string;
  export default value;
}



/**
 * TypeScript doesn't natively understand non-code assets like .png, .css, .svg, fonts, etc.
 * 
 * So when we import an image like:
 *    import LotliteLogo from '../../assets/lotlite-logo.png';
 * 
 * TypeScript throws an error:
 *    "Cannot find module '../../assets/lotlite-logo.png' or its corresponding type declarations.ts(2307)"
 * 
 * 🔍 Why this happens:
 * - TypeScript is a type-safe language.
 * - It expects to know the type of everything at compile-time.
 * - By default, it only understands .ts, .tsx, .js, and .jsx files.
 * 
 * ✅ Solution:
 * We need to create a `.d.ts` (declaration file) that tells TypeScript how to handle such imports.
 * For example, create a file like `images.d.ts` with:
 *    declare module "*.png" {
 *      const value: string;
 *      export default value;
 *    }
 * 
 * This tells TypeScript:
 *    "Whenever you import a .png file, treat it as a string (the bundled image path)."
 * 
 * This resolves the error and allows importing image files in TS/TSX files.
 */
