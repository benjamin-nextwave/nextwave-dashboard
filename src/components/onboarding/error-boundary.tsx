'use client'

import { Component, type ReactNode } from 'react'

type Props = { children: ReactNode }
type State = { error: Error | null }

export class OnboardingErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { error: null }
  }

  static getDerivedStateFromError(error: Error) {
    return { error }
  }

  render() {
    if (this.state.error) {
      return (
        <div className="p-6 rounded-xl border-2 border-red-400 bg-red-50 dark:bg-red-950/30 space-y-4">
          <h2 className="text-2xl font-bold text-red-700 dark:text-red-300">Er ging iets mis</h2>
          <pre className="text-sm whitespace-pre-wrap bg-red-100 dark:bg-red-900/50 p-4 rounded-lg overflow-auto">
            {this.state.error.message}
          </pre>
          <pre className="text-xs whitespace-pre-wrap text-muted-foreground overflow-auto">
            {this.state.error.stack}
          </pre>
        </div>
      )
    }
    return this.props.children
  }
}
