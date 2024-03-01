<template>
  <div class="types">
    <h1 class="text-lg font-semibold my-2">Types</h1>
    <p class="text-base my-3">
      You can customize the type of toast you want to render, and pass an
      options object as the second argument.
    </p>
    <div class="mb-4 flex flex-wrap gap-3 overflow-auto">
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
    <div class="code-block relative group">
      <Highlight
        language="javascript"
        className="rounded-md text-xs"
        :autodetect="false"
        :code="activeType.snippet"
      />
      <button
        aria-label="Copy code"
        title="Copy code"
        class="absolute right-2 top-2 btn-border p-1 hidden group-hover:block"
        @click="handleCopyCode"
      >
        <CheckIcon v-if="showCheckIcon" />
        <CopyIcon v-else />
      </button>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref, h, defineComponent, markRaw } from 'vue'
import { toast } from '../../packages'
import { useCopyCode } from '~/composables/useCopyCode'
import CopyIcon from '~/components/icons/CopyIcon.vue'
import CheckIcon from '~/components/icons/CheckIcon.vue'

const promiseCode = '`${data.name} toast has been added`'

const CustomDiv = defineComponent({
  setup() {
    return () =>
      h('div', {
        innerHTML: 'A custom toast with unstyling'
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
    name: 'Info',
    snippet: `toast.info('Event has been created')`,
    action: () => toast.info('Event has been created')
  },
  {
    name: 'Warning',
    snippet: `toast.warning('Event has been created')`,
    action: () => toast.warning('Event has been created')
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
        },
        duration: 10000000
      })
  },
  {
    name: 'Promise',
    snippet: `const promise = () => new Promise((resolve) => setTimeout(resolve, 2000));

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
          error: (data: any) => 'Error',
          duration: 10000000
        }
      )
  },
  {
    name: 'Custom',
    snippet: `import { defineComponent, h, markRaw } from 'vue'

const CustomDiv = defineComponent({
  setup() {
    return () =>
      h('div', {
        innerHTML: 'A custom toast with unstyling'
      })
  }
})

toast(markRaw(CustomDiv))
`,
    action: () => toast(markRaw(CustomDiv))
  }
]

const activeType = ref(allTypes[0])
const showCheckIcon = ref(false)

const handleCopyCode = async () => {
  await useCopyCode({
    code: activeType.value.snippet,
    checkIconRef: showCheckIcon
  })
  toast('Copied to your clipboard!!!')
}
</script>
