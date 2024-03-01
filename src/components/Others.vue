<template>
  <div class="types">
    <h1 class="text-lg font-semibold my-2">Others</h1>
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
import { markRaw, ref } from 'vue'

import { toast } from '../../packages'
import HeadlessToast from './HeadlessToast.vue'
import HeadlessToastWithProps from './HeadlessToastWithProps.vue'
import { useCopyCode } from '~/composables/useCopyCode'
import CopyIcon from '~/components/icons/CopyIcon.vue'
import CheckIcon from '~/components/icons/CheckIcon.vue'

const emit = defineEmits(['setRichColors', 'setCloseButton'])

const allTypes = [
  {
    name: 'Rich Colors Success',
    snippet: `toast.success('Event has been created')

// ...

<Toaster richColors  />
`,
    action: () => {
      toast.success('Event has been created')
      emit('setRichColors', true)
    }
  },
  {
    name: 'Rich Colors Info',
    snippet: `toast.info('Event has been created')

// ...

<Toaster richColors  />
`,
    action: () => {
      toast.info('Event has been created')
      emit('setRichColors', true)
    }
  },
  {
    name: 'Rich Colors Warning',
    snippet: `toast.Warning('Event has been created')

// ...

<Toaster richColors  />
`,
    action: () => {
      toast.warning('Event has been created')
      emit('setRichColors', true)
    }
  },
  {
    name: 'Rich Colors Error',
    snippet: `toast.error('Event has not been created')

// ...

<Toaster richColors  />
`,
    action: () => {
      toast.error('Event has not been created')
      emit('setRichColors', true)
    }
  },
  {
    name: 'Close Button',
    snippet: `toast('Event has been created', {
  description: 'Monday, January 3rd at 6:00pm',
})

// ...

<Toaster closeButton  />
`,
    action: () => {
      toast('Event has been created', {
        description: 'Monday, January 3rd at 6:00pm'
      })
      emit('setCloseButton')
    }
  },
  {
    name: 'Headless',
    snippet: `import { markRaw } from 'vue'

import HeadlessToast from './HeadlessToast.vue'

toast.custom(markRaw(HeadlessToast));
`,
    action: () => {
      toast.custom(markRaw(HeadlessToast), { duration: 999999 })
      emit('setCloseButton')
    }
  },
  {
    name: 'Custom with props',
    snippet: `import { markRaw } from 'vue'

import HeadlessToastWithProps from './HeadlessToastWithProps.vue'

toast.warning(markRaw(HeadlessToastWithProps), {
  componentProps: {
    message: 'This is <br />multiline message'
  }
});
`,
    action: () => {
      toast.warning(markRaw(HeadlessToastWithProps), {
        componentProps: {
          message: 'This is <br />multiline message'
        }
      })
    }
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
