'use client';

import React from 'react';

interface ModelErrorBoundaryProps {
  readonly resetKeys: React.Key[];
  readonly onError: () => void;
  readonly children: React.ReactNode;
}

interface ModelErrorBoundaryState {
  readonly hasError: boolean;
}

export class ModelErrorBoundary extends React.Component<
  ModelErrorBoundaryProps,
  ModelErrorBoundaryState
> {
  constructor(props: ModelErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(): ModelErrorBoundaryState {
    return { hasError: true };
  }

  componentDidCatch(): void {
    this.props.onError();
  }

  componentDidUpdate(prevProps: ModelErrorBoundaryProps): void {
    if (prevProps.resetKeys.join(',') !== this.props.resetKeys.join(',')) {
      this.setState({ hasError: false });
    }
  }

  render(): React.ReactNode {
    if (this.state.hasError) {
      return null;
    }

    return this.props.children;
  }
}
