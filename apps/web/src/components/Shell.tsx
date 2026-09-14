import type { ReactNode } from "react";

interface ShellProps {
  children: ReactNode;
  theme: "kujo-light" | "kujo-dark";
  onThemeChange: () => void;
}

export function Shell({ children, theme, onThemeChange }: ShellProps) {
  return (
    <>
      <a className="skip-link" href="#main-content">Skip to main content</a>
      <header className="topbar">
        <a className="brand" href="/" aria-label="Kujo Foreman home">
          <span className="brand-mark" aria-hidden="true">K</span>
          <span><b>KUJO</b> FOREMAN</span>
        </a>
        <div className="topbar-actions">
          <span className="system-label"><i aria-hidden="true" /> CONTROLLED RELEASE SYSTEM</span>
          <button className="icon-button" type="button" onClick={onThemeChange} aria-label={`Switch to ${theme === "kujo-dark" ? "light" : "dark"} theme`}>
            <span aria-hidden="true">{theme === "kujo-dark" ? "☼" : "◐"}</span>
          </button>
          <a className="sk-button sk-button--sm" href="/new">New run</a>
        </div>
      </header>
      <main id="main-content">{children}</main>
      <footer className="footer">
        <span>STRANDS COGNITION · KUJO CONTROL</span>
        <span>Evidence before release.</span>
      </footer>
    </>
  );
}
