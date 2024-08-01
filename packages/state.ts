import type { Component } from 'vue'
import type {
  ExternalToast,
  PromiseData,
  PromiseT,
  ToastT,
  ToastToDismiss,
  ToastTypes,
} from './types'

let toastsCounter = 0

class Observer {
  subscribers: Array<(toast: ExternalToast | ToastToDismiss) => void>
  toasts: Array<ToastT | ToastToDismiss>

  constructor() {
    this.subscribers = []
    this.toasts = []
  }

  // We use arrow functions to maintain the correct `this` reference
  subscribe = (subscriber: (toast: ToastT | ToastToDismiss) => void) => {
    this.subscribers.push(subscriber as any)

    return () => {
      const index = this.subscribers.indexOf(subscriber as any)
      this.subscribers.splice(index, 1)
    }
  }

  publish = (data: ToastT) => {
    this.subscribers.forEach(subscriber => subscriber(data))
  }

  addToast = (data: ToastT) => {
    this.publish(data)
    this.toasts = [...this.toasts, data]
  }

  create = (
    data: ExternalToast & {
      message?: string | Component
      type?: ToastTypes
      promise?: PromiseT
    },
  ) => {
    const { message, ...rest } = data
    const id
      = typeof data.id === 'number' || (data.id && data.id?.length > 0)
        ? data.id
        : toastsCounter++
    const alreadyExists = this.toasts.find((toast) => {
      return toast.id === id
    })
    const dismissible = data.dismissible === undefined ? true : data.dismissible

    if (alreadyExists) {
      this.toasts = this.toasts.map((toast) => {
        if (toast.id === id) {
          this.publish({ ...toast, ...data, id, title: message })
          return {
            ...toast,
            ...data,
            id,
            dismissible,
            title: message,
          }
        }

        return toast
      })
    }
    else {
      this.addToast({ title: message, ...rest, dismissible, id })
    }

    return id
  }

  dismiss = (id?: number | string) => {
    if (!id) {
      this.toasts.forEach((toast) => {
        this.subscribers.forEach(subscriber =>
          subscriber({ id: toast.id, dismiss: true }),
        )
      })
    }

    this.subscribers.forEach(subscriber => subscriber({ id, dismiss: true }))
    return id
  }

  message = (message: string | Component, data?: ExternalToast) => {
    return this.create({ ...data, message, type: 'default' })
  }

  error = (message: string | Component, data?: ExternalToast) => {
    return this.create({ ...data, type: 'error', message })
  }

  success = (message: string | Component, data?: ExternalToast) => {
    return this.create({ ...data, type: 'success', message })
  }

  info = (message: string | Component, data?: ExternalToast) => {
    return this.create({ ...data, type: 'info', message })
  }

  warning = (message: string | Component, data?: ExternalToast) => {
    return this.create({ ...data, type: 'warning', message })
  }

  loading = (message: string | Component, data?: ExternalToast) => {
    return this.create({ ...data, type: 'loading', message })
  }

  promise = <ToastData>(
    promise: PromiseT<ToastData>,
    data?: PromiseData<ToastData>,
  ) => {
    if (!data) {
      // Nothing to show
      return
    }

    let id: string | number | undefined
    if (data.loading !== undefined) {
      id = this.create({
        ...data,
        promise,
        type: 'loading',
        message: data.loading,
        description:
          typeof data.description !== 'function' ? data.description : undefined,
      })
    }

    const p = promise instanceof Promise ? promise : promise()

    let shouldDismiss = id !== undefined

    p.then(async (response) => {
      if (isHttpResponse(response) && !response.ok) {
        shouldDismiss = false
        const message
        // @ts-expect-error union type error
          = typeof data.error === 'function' ? await data.error(`HTTP error! status: ${response.status}`) : data.error
        const description
          = typeof data.description === 'function' // @ts-expect-error union type error
            ? await data.description(`HTTP error! status: ${response.status}`)
            : data.description
        this.create({ id, type: 'error', message, description })
      }
      else if (data.success !== undefined) {
        shouldDismiss = false
        // @ts-expect-error union type error
        const message = typeof data.success === 'function' ? await data.success(response) : data.success
        const description
          // @ts-expect-error union type error
          = typeof data.description === 'function' ? await data.description(response) : data.description
        this.create({ id, type: 'success', message, description })
      }
    })
      .catch(async (error) => {
        if (data.error !== undefined) {
          shouldDismiss = false
          // @ts-expect-error union type error
          const message = typeof data.error === 'function' ? await data.error(error) : data.error
          // @ts-expect-error union type error
          const description = typeof data.description === 'function' ? await data.description(error) : data.description
          this.create({ id, type: 'error', message, description })
        }
      })
      .finally(() => {
        if (shouldDismiss) {
          // Toast is still in load state (and will be indefinitely — dismiss it)
          this.dismiss(id)
          id = undefined
        }

        data.finally?.()
      })

    return id
  }

  // We can't provide the toast we just created as a prop as we didn't create it yet, so we can create a default toast object, I just don't know how to use function in argument when calling()?
  custom = (component: Component, data?: ExternalToast) => {
    const id = data?.id || toastsCounter++
    this.publish({ component, id, ...data })
    return id
  }
}

export const ToastState = new Observer()

// bind this to the toast function
function toastFunction(message: string | Component, data?: ExternalToast) {
  const id = data?.id || toastsCounter++

  ToastState.create({
    message,
    id,
    type: 'default',
    ...data,
  })

  return id
}

function isHttpResponse(data: any): data is Response {
  return (
    data
    && typeof data === 'object'
    && 'ok' in data
    && typeof data.ok === 'boolean'
    && 'status' in data
    && typeof data.status === 'number'
  )
}

const basicToast = toastFunction

const getHistory = () => ToastState.toasts

// We use `Object.assign` to maintain the correct types as we would lose them otherwise
export const toast = Object.assign(basicToast, {
  success: ToastState.success,
  info: ToastState.info,
  warning: ToastState.warning,
  error: ToastState.error,
  custom: ToastState.custom,
  message: ToastState.message,
  promise: ToastState.promise,
  dismiss: ToastState.dismiss,
  loading: ToastState.loading,
}, {
  getHistory,
})
