import React, { Component } from "react";
import Typography from "../../Typography/Typography";

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI.
    return { hasError: true, error: error };
  }

  componentDidCatch(error, errorInfo) {
    this.setState({ error: error, errorInfo: errorInfo });
    console.error("ErrorBoundary caught an error", error, errorInfo);
  }

  handleRetry = () => {
    // Reset error state to try rendering again
    this.setState({ hasError: false, error: null, errorInfo: null });
    if (this.props?.onRetry) this.props.onRetry(); // Call the passed onRetry function if provided
  };

  render() {
    if (this.state.hasError) {
      // fallback UI
      return (
        <div>
          <Typography variant={"h3"}>
            Something went wrong.{" "}
            {this.props?.onRetry ? (
              <span
                onClick={this.handleRetry}
                className="pi pi-refresh cursor-pointer"
              />
            ) : null}
          </Typography>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
