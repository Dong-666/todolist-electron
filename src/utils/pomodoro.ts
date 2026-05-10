export const DEFAULT_FOCUS_DURATION = 25 * 60 // seconds
export const DEFAULT_BREAK_DURATION = 5 * 60 // seconds

let _focusDuration = DEFAULT_FOCUS_DURATION
let _breakDuration = DEFAULT_BREAK_DURATION

export const getFocusDuration = () => _focusDuration
export const getBreakDuration = () => _breakDuration

export const setFocusDuration = (minutes: number) => {
  _focusDuration = minutes * 60
}

export const setBreakDuration = (minutes: number) => {
  _breakDuration = minutes * 60
}