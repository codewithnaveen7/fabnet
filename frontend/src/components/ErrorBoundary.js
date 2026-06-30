import React from "react";

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { error: null };
  }

  static getDerivedStateFromError(error) {
    return { error };
  }

  render() {
    if (this.state.error) {
      return (
        <div style={{ padding: "2rem", fontFamily: "system-ui, sans-serif" }}>
          <h1>FabNet failed to load</h1>
          <p style={{ color: "#666" }}>
            The UI library (kdesigns) could not be loaded. Ensure kdesigns is
            running at the remote URL and refresh the page.
          </p>
          <pre
            style={{
              background: "#f5f5f5",
              padding: "1rem",
              overflow: "auto",
              fontSize: "0.85rem",
            }}
          >
            {this.state.error.message}
          </pre>
        </div>
      );
    }
    return this.props.children;
  }
}
