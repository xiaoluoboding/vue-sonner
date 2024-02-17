import type { Component, CSSProperties } from 'vue'

export type ToastTypes =
  | 'normal'
  | 'action'
  | 'success'
  | 'info'
  | 'warning'
  | 'error'
  | 'loading'
  | 'default'

export type PromiseT<Data = any> = Promise<Data> | (() => Promise<Data>)

export type PromiseExternalToast = Omit<ExternalToast, 'description'>

export type PromiseData<ToastData = any> = ExternalToast & {
  loading?: string | Component
  success?: (data: ToastData) => string | Component
  error?: (data: ToastData) => string | Component
  description?: string | Component | ((data: any) => Component | string)
  finally?: () => void | Promise<void>
}

export interface ToastClassnames {
  toast?: string
  title?: string
  description?: string
  loader?: string
  closeButton?: string
  cancelButton?: string
  actionButton?: string
  normal?: string
  action?: string
  success?: string
  error?: string
  info?: string
  warning?: string
  loading?: string
  default?: string
}

export interface ToastIcons {
  success?: Component
  info?: Component
  warning?: Component
  error?: Component
  loading?: Component
}

export interface ToastT {
  id: number | string
  title?: string | Component
  type?: ToastTypes
  icon?: Component
  invert?: boolean
  closeButton?: boolean
  dismissible?: boolean
  description?: string
  duration?: number
  delete?: boolean
  important?: boolean
  action?: {
    label: string | Component
    onClick: () => void
  }
  cancel?: {
    label: string | Component
    onClick?: () => void
  }
  onDismiss?: (toast: ToastT) => void
  onAutoClose?: (toast: ToastT) => void
  promise?: PromiseT
  cancelButtonStyle?: CSSProperties
  actionButtonStyle?: CSSProperties
  style?: CSSProperties
  unstyled?: boolean
  className?: string
  classNames?: ToastClassnames
  descriptionClassName?: string
  position?: Position
}

export type Position =
  | 'top-left'
  | 'top-right'
  | 'bottom-left'
  | 'bottom-right'
  | 'top-center'
  | 'bottom-center'

export interface HeightT {
  height: number
  toastId: number | string
  position: Position
}

export interface ToastOptions {
  className?: string
  closeButton?: boolean
  descriptionClassName?: string
  style?: CSSProperties
  cancelButtonStyle?: CSSProperties
  actionButtonStyle?: CSSProperties
  duration?: number
  unstyled?: boolean
  classNames?: ToastClassnames
}

export type CnFunction = (...classes: Array<string | undefined>) => string

export enum SwipeStateTypes {
  SwipedOut = 'SwipedOut',
  SwipedBack = 'SwipedBack',
  NotSwiped = 'NotSwiped'
}

export type Theme = 'light' | 'dark' | 'system'

export interface ToastToDismiss {
  id: number | string
  dismiss: boolean
}

export type ExternalToast = Omit<
  ToastT,
  'id' | 'type' | 'title' | 'delete' | 'promise'
> & {
  id?: number | string
}
