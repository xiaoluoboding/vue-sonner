import { Component } from 'vue'

export type ToastTypes = 'normal' | 'action' | 'success' | 'error' | 'loading'

export type PromiseT = Promise<any> | (() => Promise<any>)

export type PromiseData = ExternalToast & {
  loading: string | Component
  // success: string | Component | ((data: any) => Component | string)
  // error: string | Component | ((error: any) => Component | string)
  success: (data: any) => Component | string
  error: (error: any) => Component | string
}

export interface ToastT {
  extraProps?: Record<string, any>
  id: number | string
  title?: string | Component
  type?: ToastTypes
  icon?: Component
  invert?: boolean
  description?: string
  duration?: number
  delete?: boolean
  important?: boolean
  action?: {
    label: string
    onClick: () => void
  }
  cancel?: {
    label: string
    onClick?: () => void
  }
  onDismiss?: (toast: ToastT) => void
  onAutoClose?: (toast: ToastT) => void
  promise?: PromiseT
  style?: Record<string, any>
  className?: string
  descriptionClassName?: string
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
}

export interface ToastOptions {
  className?: string
  descriptionClassName?: string
  style?: Record<string, any>
}

export enum SwipeStateTypes {
  SwipedOut = 'SwipedOut',
  SwipedBack = 'SwipedBack',
  NotSwiped = 'NotSwiped'
}

export type Theme = 'light' | 'dark'

export interface ToastToDismiss {
  id: number | string
  dismiss: boolean
}

export type ExternalToast = Omit<ToastT, 'id' | 'type' | 'title'> & {
  id?: number | string
}
