<template>
  <div class="types">
    <h1 class="text-lg font-semibold my-2">Types</h1>
    <p class="text-base my-3">
      You can customize the type of toast you want to render, and pass an
      options object as the second argument.
    </p>
    <div class="mb-4 flex gap-3">
      <button
        v-for="type in allTypes"
        :key="type.name"
        class="btn-default"
        :class="{
          'bg-neutral-200/50 border-neutral-400/50':
            type.name === activeType.name
        }"
        @click="
          () => {
            type.action()
            activeType = type
          }
        "
      >
        {{ type.name }}
      </button>
    </div>
    <CustomDiv />
    <Highlight
      language="javascript"
      class=""
      :autodetect="false"
      :code="activeType.snippet"
    />
  </div>
</template>

<script lang="ts" setup>
import { ref, h, defineComponent, shallowRef } from 'vue'

import { toast } from '../../packages'

const promiseCode = '`${data.name} toast has been added`'

const CustomDiv = defineComponent({
  setup() {
    return () =>
      h('div', {
        innerHTML: 'A custom toast with default styling'
      })
  }
})

const allTypes = [
  {
    name: 'Default',
    snippet: `toast('Event has been created')`,
    action: () => toast('Event has been created')
  },
  {
    name: 'Description',
    snippet: `toast.message('Event has been created', {
  description: 'Monday, January 3rd at 6:00pm',
})`,
    action: () =>
      toast('Event has been created', {
        description: 'Monday, January 3rd at 6:00pm'
      })
  },
  {
    name: 'Success',
    snippet: `toast.success('Event has been created')`,
    action: () => toast.success('Event has been created')
  },
  {
    name: 'Error',
    snippet: `toast.error('Event has not been created')`,
    action: () => toast.error('Event has not been created')
  },
  {
    name: 'Action',
    snippet: `toast('Event has been created', {
  action: {
    label: 'Undo',
    onClick: () => console.log('Undo')
  },
})`,
    action: () =>
      toast.message('Event has been created', {
        action: {
          label: 'Undo',
          onClick: () => console.log('Undo')
        }
      })
  },
  {
    name: 'Promise',
    snippet: `
const promise = () => new Promise((resolve) => setTimeout(resolve, 2000));

toast.promise(promise, {
  loading: 'Loading...',
  success: (data) => {
    return ${promiseCode};
  },
  error: (data: any) => 'Error',
});`,
    action: () =>
      toast.promise(
        () =>
          new Promise((resolve) => {
            setTimeout(() => {
              resolve({ name: 'Vue Sonner' })
            }, 2000)
          }),
        {
          loading: 'Loading...',
          success: (data: any) => {
            return `${data.name} toast has been added`
          },
          error: (data: any) => 'Error'
        }
      )
  },
  {
    name: 'Custom',
    snippet: `
import { defineComponent, h, shallowRef } from 'vue'

const CustomDiv = defineComponent({
  setup() {
    return () =>
      h('div', {
        innerHTML: 'A custom toast with default styling'
      })
  }
})

toast(shallowRef(CustomDiv))
`,
    action: () => toast(shallowRef(CustomDiv))
  }
]

const activeType = ref(allTypes[0])
</script>
