import type { CSSProperties, Component } from 'vue'

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

export interface PromiseIExtendedResult extends ExternalToast {
  message: string | Component
}

export type PromiseTExtendedResult<Data = any> =
  | PromiseIExtendedResult
  | ((data: Data) => PromiseIExtendedResult | Promise<PromiseIExtendedResult>)

export type PromiseTResult<Data = any> =
  | string
  | Component
  | ((data: Data) => Component | string | Promise<Component | string>)

export type PromiseExternalToast = Omit<ExternalToast, 'description'>

export type PromiseData<ToastData = any> = PromiseExternalToast & {
  loading?: string | Component
  success?: PromiseTResult<ToastData> | PromiseTExtendedResult<ToastData>
  error?: PromiseTResult | PromiseTExtendedResult
  description?: PromiseTResult
  finally?: () => void | Promise<void>
}

export interface ToastClasses {
  toast?: string
  title?: string
  description?: string
  loader?: string
  closeButton?: string
  cancelButton?: string
  actionButton?: string
  success?: string
  error?: string
  info?: string
  warning?: string
  loading?: string
  default?: string
  content?: string
  icon?: string
}

export interface ToastIcons {
  success?: Component
  info?: Component
  warning?: Component
  error?: Component
  loading?: Component
  close?: Component
}

export interface Action {
  label: Component | string
  onClick: (event: MouseEvent) => void
  actionButtonStyle?: CSSProperties
}

export interface ToastT<T extends Component = Component> {
  id: number | string
  toasterId?: string
  title?: (() => string | Component) | string | Component
  type?: ToastTypes
  icon?: Component
  component?: T
  componentProps?: any
  richColors?: boolean
  invert?: boolean
  closeButton?: boolean
  dismissible?: boolean
  description?: (() => string | Component) | string | Component
  duration?: number
  delete?: boolean
  important?: boolean
  action?: Action | Component
  cancel?: Action | Component
  onDismiss?: (toast: ToastT) => void
  onAutoClose?: (toast: ToastT) => void
  promise?: PromiseT
  cancelButtonStyle?: CSSProperties
  actionButtonStyle?: CSSProperties
  style?: CSSProperties
  unstyled?: boolean
  class?: string
  classes?: ToastClasses
  descriptionClass?: string
  position?: Position
  closeButtonPosition?: CloseButtonPosition
  testId?: string
}

export function isAction(action: Action | Component): action is Action {
  return (action as Action).label !== undefined
}

export type Position =
  | 'top-left'
  | 'top-right'
  | 'bottom-left'
  | 'bottom-right'
  | 'top-center'
  | 'bottom-center'

export type CloseButtonPosition = Exclude<Position, 'top-center' | 'bottom-center'>

export interface HeightT {
  height: number
  toastId: number | string
  position: Position
}

export interface ToastOptions {
  class?: string
  closeButton?: boolean
  descriptionClass?: string
  style?: CSSProperties
  cancelButtonStyle?: CSSProperties
  actionButtonStyle?: CSSProperties
  duration?: number
  unstyled?: boolean
  classes?: ToastClasses
  closeButtonAriaLabel?: string
  toasterId?: string
  closeButtonPosition?: CloseButtonPosition
}

type Offset =
  | {
      top?: string | number
      right?: string | number
      bottom?: string | number
      left?: string | number
    }
  | string
  | number

export interface ToasterProps {
  id?: string
  invert?: boolean
  theme?: Theme
  position?: Position
  closeButtonPosition?: CloseButtonPosition
  hotkey?: string[]
  richColors?: boolean
  expand?: boolean
  duration?: number
  gap?: number
  visibleToasts?: number
  closeButton?: boolean
  toastOptions?: ToastOptions
  class?: string
  style?: CSSProperties
  offset?: Offset
  mobileOffset?: Offset
  dir?: 'rtl' | 'ltr' | 'auto'
  swipeDirections?: SwipeDirection[]
  icons?: ToastIcons
  containerAriaLabel?: string
}

export type SwipeDirection = 'top' | 'right' | 'bottom' | 'left'

export interface ToastProps {
  toast: ToastT
  toasts: ToastT[]
  index: number
  swipeDirections?: SwipeDirection[]
  expanded: boolean
  invert: boolean
  heights: HeightT[]
  gap?: number
  position: Position
  closeButtonPosition?: CloseButtonPosition
  visibleToasts: number
  expandByDefault: boolean
  closeButton: boolean
  interacting: boolean
  style?: CSSProperties
  cancelButtonStyle?: CSSProperties
  actionButtonStyle?: CSSProperties
  duration?: number
  class: string
  unstyled?: boolean
  descriptionClass?: string
  loadingIcon?: Component
  classes?: ToastClasses
  icons?: ToastIcons
  closeButtonAriaLabel?: string
  defaultRichColors?: boolean
}

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

export type ExternalToast<T extends Component = Component> = Omit<
  ToastT<T>,
  'id' | 'type' | 'title' | 'promise' | 'delete'
> & {
  id?: number | string
  toasterId?: string
}
