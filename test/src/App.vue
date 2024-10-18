<script setup lang="ts">
import { ref, defineComponent, h, markRaw, onMounted } from 'vue'
import { Toaster, toast, type ToasterProps } from 'vue-sonner';

const showAutoClose = ref(false);
const showDismiss = ref(false);
const theme = ref <ToasterProps['theme']>('light');
const dir = ref <ToasterProps['dir']>('auto');

const CustomDiv = defineComponent({
  setup() {
    return () =>
      h('div', {}, [
        h('h1', 'A custom toast with unstyling'),
        h('button', {
          '^data-testid': 'dismiss-button',
          onClick: () => toast.dismiss(),
          innerHTML: 'Dismiss'
        })
      ])
  }
})

const promise = () => new Promise((resolve) => setTimeout(resolve, 2000));

const setTheme = (newTheme: ToasterProps['theme']) => {
  theme.value = newTheme;
};

const setDir = (newDir: ToasterProps['dir']) => {
  dir.value = newDir;
};

const updateToast = () => {
  const toastId = toast('My Unupdated Toast', {
    duration: 10000,
  });
  toast('My Updated Toast', {
    id: toastId,
    duration: 10000,
  });
};

const dismissToastProgrammatically = () => {
  const toastId = toast('My super toast', {
    duration: Infinity,
  });

  setTimeout(() => {
    toast.dismiss(toastId)
  }, 500)
}

onMounted(() => {
  const queryString = window.location.search;
  const theme = new URLSearchParams(queryString).get('theme')
  const dir = new URLSearchParams(queryString).get('dir')

  if (theme) setTheme(theme)
  if (dir) setDir(dir)
})

</script>

<template>
  <div class="container">
    <button data-testid="theme-button" class="button" @click="setTheme('dark')">
      Change theme
    </button>
    <button data-testid="dismiss-toast" class="button" @click="dismissToastProgrammatically()">
      Dismiss programmatically Toast
    </button>
    <button data-testid="default-button" class="button" @click="toast('My Toast')">
      Render Toast
    </button>
    <button data-testid="success" class="button" @click="toast.success('My Success Toast')">
      Render Success Toast
    </button>
    <button data-testid="error" class="button" @click="toast.error('My Error Toast')">
      Render Error Toast
    </button>
    <button data-testid="action" class="button"
      @click="toast('My Message', { action: { label: 'Action', onClick: () => console.log('Action') } })">
      Render Action Toast
    </button>
    <button data-testid="action-prevent" className="button" @click="toast('My Message', {
        action: {
          label: 'Action',
          onClick: (event: any) => {
            event.preventDefault();
            console.log('Action');
          },
        },
      })">
      Render Action Toast
    </button>
    <button data-testid="promise" class="button"
      @click="toast.promise(promise, { loading: 'Loading...', success: 'Loaded', error: 'Error' })">
      Render Promise Toast
    </button>
    <button data-testid="custom" class="button" @click="toast(markRaw(CustomDiv))">
      Render Custom Toast
    </button>
    <button data-testid="custom-cancel-button-toast" class="button"
      @click="toast('My Custom Cancel Button', { cancel: { label: 'Cancel', onClick: () => console.log('Cancel') } })">
      Render Custom Cancel Button
    </button>
    <button data-testid="infinity-toast" class="button" @click="toast('My Toast', { duration: Infinity })">
      Render Infinity Toast
    </button>
    <button data-testid="auto-close-toast-callback" class="button"
      @click="toast('My Toast', { onAutoClose: () => showAutoClose = true })">
      Render Toast With onAutoClose callback
    </button>
    <button data-testid="dismiss-toast-callback" class="button"
      @click="toast('My Toast', { onDismiss: () => showDismiss = true })">
      Render Toast With onAutoClose callback
    </button>
    <button data-testid="non-dismissible-toast" class="button" @click="toast('My Toast', { dismissible: false })">
      Non-dismissible Toast
    </button>
    <button data-testid="update-toast" class="button" @click="updateToast">
      Updated Toast
    </button>
    <button data-testid="string-description" class="button"
      @click="toast('Custom Description', { description: 'string description' })">
      String Description
    </button>
    <button data-testid="react-node-description" class="button"
      @click="toast('Custom Description', { description: 'This is my custom ReactNode description' })">
      ReactNode Description
    </button>
    <button data-testid="close-button" class="button" @click="toast('Toast with close button', { closeButton: true })">
      Render close button
    </button>
    <div v-if="showAutoClose" data-testid="auto-close-el" />
    <div v-if="showDismiss" data-testid="dismiss-el" />
    <Toaster position="bottom-right"
      :toastOptions="{ actionButtonStyle: { backgroundColor: 'rgb(219, 239, 255)' }, cancelButtonStyle: { backgroundColor: 'rgb(254, 226, 226)' } }"
      :theme="theme"
      :dir="dir"
    />
  </div>
</template>

<style lang="css" scoped>
.container {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
}

.button {
  padding: 6px 12px;
  font-size: 16px;
}
</style>

<style>
*:focus {
  border: 10px solid red !important;
}
</style>