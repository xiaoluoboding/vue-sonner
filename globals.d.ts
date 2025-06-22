// globals.d.ts

// Import the type of the toast object from the toast state module
import type { toast } from './src/packages/state'

// Ensure this file is treated as a module
export {}

/**
 * Global window interface augmentation
 *
 * Adds the `toast` object to the `window` global scope
 * to enable usage of `window.toast` in non-Vue contexts
 * such as plain JavaScript or legacy code.
 *
 * This is particularly useful in UMD builds where Composition API
 * and dependency injection are not available.
 */
declare global {
  interface Window {
    /**
     * Globally accessible toast object (e.g. window.toast.success('...'))
     */
    toast: typeof toast
  }
}