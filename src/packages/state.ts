import { isVNode, type Component } from 'vue'
import type {
  ExternalToast,
  PromiseData,
  PromiseIExtendedResult,
  PromiseT,
  ToastT,
  ToastToDismiss,
  ToastTypes
} from './types'

let toastsCounter = 1

type titleT = (() => string | Component) | string | Component

class Observer {
  subscribers: Array<(toast: ExternalToast | ToastToDismiss) => void>
  toasts: Array<ToastT | ToastToDismiss>
  dismissedToasts: Set<string | number>

  constructor() {
    this.subscribers = []
    this.toasts = []
    this.dismissedToasts = new Set()
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
    this.subscribers.forEach((subscriber) => subscriber(data))
  }

  addToast = (data: ToastT) => {
    this.publish(data)
    this.toasts = [...this.toasts, data]
  }

  create = (
    data: ExternalToast & {
      message?: titleT
      type?: ToastTypes
      promise?: PromiseT
    }
  ) => {
    const { message, ...rest } = data
    const id =
      typeof data.id === 'number' || (data.id && data.id?.length > 0)
        ? data.id
        : toastsCounter++
    const alreadyExists = this.toasts.find((toast) => {
      return toast.id === id
    })
    const dismissible = data.dismissible === undefined ? true : data.dismissible

    if (this.dismissedToasts.has(id)) {
      this.dismissedToasts.delete(id)
    }

    if (alreadyExists) {
      this.toasts = this.toasts.map((toast) => {
        if (toast.id === id) {
          this.publish({ ...toast, ...data, id, title: message })
          return {
            ...toast,
            ...data,
            id,
            dismissible,
            title: message
          }
        }

        return toast
      })
    } else {
      this.addToast({ title: message, ...rest, dismissible, id })
    }

    return id
  }

  dismiss = (id?: number | string) => {
    if (id) {
      this.dismissedToasts.add(id)
      requestAnimationFrame(() =>
        this.subscribers.forEach((subscriber) =>
          subscriber({ id, dismiss: true })
        )
      )
    } else {
      this.toasts.forEach((toast) => {
        this.subscribers.forEach((subscriber) =>
          subscriber({ id: toast.id, dismiss: true })
        )
      })
    }
    return id
  }

  message = (message: titleT, data?: ExternalToast) => {
    return this.create({ ...data, message, type: 'default' })
  }

  error = (message: titleT, data?: ExternalToast) => {
    return this.create({ ...data, type: 'error', message })
  }

  success = (message: titleT, data?: ExternalToast) => {
    return this.create({ ...data, type: 'success', message })
  }

  info = (message: titleT, data?: ExternalToast) => {
    return this.create({ ...data, type: 'info', message })
  }

  warning = (message: titleT, data?: ExternalToast) => {
    return this.create({ ...data, type: 'warning', message })
  }

  loading = (message: titleT, data?: ExternalToast) => {
    return this.create({ ...data, type: 'loading', message })
  }

  promise = <ToastData>(
    promise: PromiseT<ToastData>,
    data?: PromiseData<ToastData>
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
          typeof data.description !== 'function' ? data.description : undefined
      })
    }

    const p = Promise.resolve(promise instanceof Function ? promise() : promise)

    let shouldDismiss = id !== undefined
    let result: ['resolve', ToastData] | ['reject', unknown]

    const originalPromise = p
      .then(async (response) => {
        result = ['resolve', response]
        const isVueComponent = isVNode(response)
        if (isVueComponent) {
          shouldDismiss = false
          this.create({ id, type: 'default', message: response })
        } else if (isHttpResponse(response) && !response.ok) {
          shouldDismiss = false
          const promiseData =
            typeof data.error === 'function'
              ? await (
                  data.error as (error: string) => Promise<string | Component>
                )(`HTTP error! status: ${response.status}`)
              : data.error
          const description =
            typeof data.description === 'function'
              ? await (
                  data.description as (
                    error: string
                  ) => Promise<string | Component>
                )(`HTTP error! status: ${response.status}`)
              : data.description

          const isExtendedResult =
            typeof promiseData === 'object' && !isVNode(promiseData)

          const toastSettings: PromiseIExtendedResult = isExtendedResult
            ? (promiseData as PromiseIExtendedResult)
            : { message: promiseData || '', id: id || '' }

          this.create({ id, type: 'error', description, ...toastSettings })
        } else if (response instanceof Error) {
          shouldDismiss = false
          const promiseData =
            typeof data.error === 'function'
              ? await (
                  data.error as (error: Error) => Promise<string | Component>
                )(response)
              : data.error
          const description =
            typeof data.description === 'function'
              ? await (
                  data.description as (
                    error: Error
                  ) => Promise<string | Component>
                )(response)
              : data.description

          const isExtendedResult =
            typeof promiseData === 'object' && !isVNode(promiseData)

          const toastSettings: PromiseIExtendedResult = isExtendedResult
            ? (promiseData as PromiseIExtendedResult)
            : { message: promiseData || '', id: id || '' }

          this.create({ id, type: 'error', description, ...toastSettings })
        } else if (data.success !== undefined) {
          shouldDismiss = false
          const promiseData =
            typeof data.success === 'function'
              ? await (
                  data.success as (
                    response: ToastData
                  ) => Promise<string | Component>
                )(response)
              : data.success
          const description =
            typeof data.description === 'function'
              ? await (
                  data.description as (
                    response: ToastData
                  ) => Promise<string | Component>
                )(response)
              : data.description

          const isExtendedResult =
            typeof promiseData === 'object' && !isVNode(promiseData)

          const toastSettings: PromiseIExtendedResult = isExtendedResult
            ? (promiseData as PromiseIExtendedResult)
            : { message: promiseData || '', id: id || '' }

          this.create({ id, type: 'success', description, ...toastSettings })
        }
      })
      .catch(async (error) => {
        result = ['reject', error]
        if (data.error !== undefined) {
          shouldDismiss = false
          const promiseData =
            typeof data.error === 'function'
              ? await (
                  data.error as (error: unknown) => Promise<string | Component>
                )(error)
              : data.error
          const description =
            typeof data.description === 'function'
              ? await (
                  data.description as (
                    error: unknown
                  ) => Promise<string | Component>
                )(error)
              : data.description

          const isExtendedResult =
            typeof promiseData === 'object' && !isVNode(promiseData)

          const toastSettings: PromiseIExtendedResult = isExtendedResult
            ? (promiseData as PromiseIExtendedResult)
            : { message: promiseData || '', id: id || '' }

          this.create({ id, type: 'error', description, ...toastSettings })
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

    const unwrap = () =>
      new Promise<ToastData>((resolve, reject) =>
        originalPromise
          .then(() =>
            result[0] === 'reject' ? reject(result[1]) : resolve(result[1])
          )
          .catch(reject)
      )

    if (typeof id !== 'string' && typeof id !== 'number') {
      // cannot Object.assign on undefined
      return { unwrap }
    } else {
      return Object.assign(id, { unwrap })
    }
  }

  // We can't provide the toast we just created as a prop as we didn't create it yet, so we can create a default toast object, I just don't know how to use function in argument when calling()?
  custom = (component: Component, data?: ExternalToast) => {
    const id = data?.id || toastsCounter++
    const alreadyExists = this.toasts.find((toast) => {
      return toast.id === id
    })
    const dismissible =
      data?.dismissible === undefined ? true : data.dismissible

    if (this.dismissedToasts.has(id)) {
      this.dismissedToasts.delete(id)
    }

    if (alreadyExists) {
      this.toasts = this.toasts.map((toast) => {
        if (toast.id === id) {
          this.publish({ ...toast, component, dismissible, id, ...data })
          return { ...toast, component, dismissible, id, ...data }
        }

        return toast
      })
    } else {
      this.addToast({ component, dismissible, id, ...data })
    }
    return id
  }

  getActiveToasts = () => {
    return this.toasts.filter((toast) => !this.dismissedToasts.has(toast.id))
  }
}

export const ToastState = new Observer()

// bind this to the toast function
function toastFunction(message: titleT, data?: ExternalToast) {
  const id = data?.id || toastsCounter++

  ToastState.create({
    message,
    id,
    type: 'default',
    ...data
  })

  return id
}

const isHttpResponse = (data: any): data is Response => {
  return (
    data &&
    typeof data === 'object' &&
    'ok' in data &&
    typeof data.ok === 'boolean' &&
    'status' in data &&
    typeof data.status === 'number'
  )
}

const basicToast = toastFunction

const getHistory = () => ToastState.toasts
const getToasts = () => ToastState.getActiveToasts()

// We use `Object.assign` to maintain the correct types as we would lose them otherwise
export const toast = Object.assign(
  basicToast,
  {
    success: ToastState.success,
    info: ToastState.info,
    warning: ToastState.warning,
    error: ToastState.error,
    custom: ToastState.custom,
    message: ToastState.message,
    promise: ToastState.promise,
    dismiss: ToastState.dismiss,
    loading: ToastState.loading
  },
  {
    getHistory,
    getToasts
  }
)
