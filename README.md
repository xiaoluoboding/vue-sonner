# Sonner for Vue

![vue-sonner minzip package size](https://img.shields.io/bundlephobia/minzip/vue-sonner)
![vue-sonner package version](https://img.shields.io/npm/v/vue-sonner.svg?colorB=green)

> An opinionated toast component for Vue. It's a Vue port of Sonner

## Preview

https://user-images.githubusercontent.com/6118824/228208185-be5aefd4-7fa8-4f95-a41c-88a60c0e2800.mp4

## Introduction

`Vue Sonner` is an opinionated toast component for Vue. It's customizable, but styled by default. Comes with a swipe to dismiss animation.

## Installation

To start using the library, install it in your project:

```bash
pnpm install vue-sonner
or
yarn add vue-sonner
```

## Usage

### For Vue 3

```html
<!-- App.vue -->
<template>
  <Toaster />
  <button @click="() => toast('My first toast')">Render a toast</button>
</template>

<script lang="ts" setup>
  import { Toaster, toast } from 'vue-sonner'
</script>
```

### For Nuxt 3

Define a nuxt plugin

```ts
// plugins/sonner.client.ts
import { Toaster, toast } from 'vue-sonner'

export default defineNuxtPlugin((nuxtApp) => {
  nuxtApp.vueApp.component('Toaster', Toaster)

  return {
    provide: {
      toast
    }
  }
})
```

Use `Toaster` component and `$toast` function anywhere in the Vue SFC

```html
<!-- app.vue -->
<template>
  <div>
    <NuxtPage />
    <ClientOnly>
      <Toaster position="top-right" />
    </ClientOnly>
    <button @click="() => $toast('My first toast')">Render a toast</button>
  </div>
</template>

<script setup lang="ts">
// alternatively, you can also use it here
const { $toast } = useNuxtApp()
</script>
```

Add the build transpile for `vue-sonner`

```ts
// nuxt.config.ts
import { defineNuxtConfig } from 'nuxt/config'

export default defineNuxtConfig({
  ...
  build: {
    transpile: ['vue-sonner']
  }
})
```

### CDN Link

**EMS version**

```ts
https://cdn.jsdelivr.net/npm/vue-sonner/+esm
```

**UMD version**

```ts
https://www.unpkg.com/vue-sonner@0.3.1/lib/vue-sonner.umd.cjs
```

## Types

### Default

Most basic toast. You can customize it (and any other type) by passing an options object as the second argument.

```ts
toast('Event has been created')
```

With custom description:

```ts
toast('Event has been created', {
  description: 'Monday, January 3rd at 6:00pm'
})
```

### Success

Renders a checkmark icon in front of the message.

```ts
toast.success('Event has been created')
```

### Error

Renders an error icon in front of the message.

```ts
toast.error('Event has not been created')
```

### Action

Renders a button.

```ts
toast('Event has been created', {
  action: {
    label: 'Undo',
    onClick: () => console.log('Undo')
  }
})
```

### Promise

Starts in a loading state and will update automatically after the promise resolves or fails.

You can pass a function to the success/error messages to incorporate the result/error of the promise.

```ts
toast.promise(() => new Promise((resolve) => setTimeout(resolve, 2000)), {
  loading: 'Loading',
  success: (data: any) => 'Success',
  error: (data: any) => 'Error'
})
```

### Custom Component

You can pass a Vue Component as the first argument instead of a string to render custom Component while maintaining default styling. You can use the headless version below for a custom, unstyled toast.

```html
<script lang="ts" setup>
  import { defineComponent, h, shallowRef } from 'vue'

  const CustomDiv = defineComponent({
    setup() {
      return () =>
        h('div', {
          innerHTML: 'A custom toast with unstyling'
        })
    }
  })

  toast(shallowRef(CustomDiv))
</script>
```

## Customization

### Headless

You can use `toast.custom` to render an unstyled toast with custom jsx while maintaining the functionality.

```vue
<script lang="ts" setup>
import HeadlessToast from './HeadlessToast.vue'

toast.custom(shallowRef(HeadlessToast), { duration: 999999 })
</script>
```

### Theme

You can change the theme using the `theme` prop. Default theme is light.

```html
<Toaster theme="dark" />
```

### Position

You can change the position through the `position` prop on the `<Toaster />` component. Default is `top-right`.

```html
<!-- Available positions -->
<!-- top-left, top-center, top-right, bottom-left, bottom-center, bottom-right -->

<Toaster position="top-center" />
```

### Expanded

Toasts can also be expanded by default through the `expand` prop. You can also change the amount of visible toasts which is 3 by default.

```html
<Toaster expand :visibleToasts="9" />
```

### Styling for all toasts

You can style your toasts globally with the `toastOptions` prop in the `Toaster` component.

```html
<Toaster
  toastOptions="{
    style: { background: 'red' },
    className: 'my-toast',
    descriptionClassName: 'my-toast-description'
  }"
/>
```

### Styling for individual toast

```ts
toast('Event has been created', {
  style: {
    background: 'red'
  },
  className: 'my-toast',
  descriptionClassName: 'my-toast-description'
})
```

### Close button

Add a close button to all toasts that shows on hover by adding the `closeButton` prop.

```html
<Toaster closeButton />
```

### Rich colors

You can make error and success state more colorful by adding the `richColors` prop.

```html
<Toaster richColors />
```

### Custom offset

Offset from the edges of the screen.

```html
<Toaster offset="80px" />
```

### Programmatically remove toast

To remove a toast programmatically use `toast.dismiss(id)`.

```ts
const toastId = toast('Event has been created')

toast.dismiss(toastId)
```

You can also use the dismiss method without the id to dismiss all toasts.

```ts
toast.dismiss()
```

### Programmatically remove toast

You can change the duration of each toast by using the duration property, or change the duration of all toasts like this:

```html
<Toaster :duration="10000" />
```

```ts
toast('Event has been created', {
  duration: 10000
})

// Persisent toast
toast('Event has been created', {
  duration: Infinity
})
```

### On Close Callback

You can pass `onDismiss` and `onAutoClose` callbacks. `onDismiss` gets fired when either the close button gets clicked or the toast is swiped. `onAutoClose` fires when the toast disappears automatically after it's timeout (`duration` prop).

```ts
toast('Event has been created', {
  onDismiss: (t) => console.log(`Toast with id ${t.id} has been dismissed`),
  onAutoClose: (t) =>
    console.log(`Toast with id ${t.id} has been closed automatically`)
})
```

### Keyboard focus

You can focus on the toast area by pressing ⌥/alt + T. You can override it by providing an array of event.code values for each key.

```html
<Toaster hotkey="['KeyC']" />
```

## Inspiration

- [sonner](https://github.com/emilkowalski/sonner) - An opinionated toast component for React.

## License

MIT [@xiaoluoboding](https://github.com/xiaoluoboding)
