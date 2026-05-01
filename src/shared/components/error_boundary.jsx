import { Component } from 'react';

export default class Error_Boundary extends Component {
  state = { has_error: false, message: '' };

  static getDerivedStateFromError(error) {
    return { has_error: true, message: error?.message ?? String(error) };
  }

  componentDidCatch(error, info) {
    console.error('Error_Boundary caught:', error, info);
  }

  render() {
    if (!this.state.has_error) return this.props.children;

    if (this.props.fallback) {
      return typeof this.props.fallback === 'function'
        ? this.props.fallback(this.state.message)
        : this.props.fallback;
    }

    return (
      <div style={{
        display: 'flex', flexDirection: 'column',
        width: '100vw', height: '100vh',
        justifyContent: 'center', alignItems: 'center',
        background: '#1a1a2e', color: 'white', gap: '16px', padding: '24px',
      }}>
        <h1 style={{ color: '#ef4444', margin: 0, fontSize: '24px' }}>Something went wrong.</h1>
        <p style={{ margin: 0, color: '#aaa', fontSize: '14px', maxWidth: '600px', textAlign: 'center' }}>
          {this.state.message}
        </p>
        <button
          type="button"
          onClick={() => location.reload()}
          style={{
            padding: '8px 24px', background: '#facc15', color: '#000',
            border: 'none', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer',
          }}
        >
          Reload
        </button>
      </div>
    );
  }
}
