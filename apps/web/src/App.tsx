import { useEffect, useState } from "react";
import { NewRun } from "./components/NewRun";
import { RunDashboard } from "./components/RunDashboard";
import { Shell } from "./components/Shell";

type Route = { kind: "new" } | { kind: "run"; id: string; evidence: boolean } | { kind: "preview"; evidence: boolean };

export function matchRoute(pathname: string): Route {
  if (pathname === "/preview" || pathname === "/preview/") return { kind: "preview", evidence: false };
  if (pathname === "/preview/evidence") return { kind: "preview", evidence: true };
  const run = pathname.match(/^\/runs\/([^/]+)(\/evidence)?\/?$/);
  if (run) return { kind: "run", id: decodeURIComponent(run[1]), evidence: Boolean(run[2]) };
  return { kind: "new" };
}

function initialTheme(): "kujo-light" | "kujo-dark" {
  const saved = window.localStorage.getItem("foreman-theme");
  if (saved === "kujo-light" || saved === "kujo-dark") return saved;
  return window.matchMedia("(prefers-color-scheme: light)").matches ? "kujo-light" : "kujo-dark";
}

export default function App() {
  const [route, setRoute] = useState(() => matchRoute(window.location.pathname));
  const [theme, setTheme] = useState(initialTheme);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    window.localStorage.setItem("foreman-theme", theme);
  }, [theme]);

  useEffect(() => {
    const navigate = (event: MouseEvent) => {
      const link = (event.target as HTMLElement).closest<HTMLAnchorElement>("a[href]");
      if (!link || link.target || link.origin !== window.location.origin || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      event.preventDefault();
      window.history.pushState({}, "", link.href);
      setRoute(matchRoute(window.location.pathname));
      window.scrollTo({ top: 0, behavior: "instant" });
    };
    const pop = () => setRoute(matchRoute(window.location.pathname));
    document.addEventListener("click", navigate);
    window.addEventListener("popstate", pop);
    return () => { document.removeEventListener("click", navigate); window.removeEventListener("popstate", pop); };
  }, []);

  return (
    <Shell theme={theme} onThemeChange={() => setTheme(theme === "kujo-dark" ? "kujo-light" : "kujo-dark")}>
      {route.kind === "new" && <NewRun />}
      {route.kind === "run" && <RunDashboard id={route.id} preview={false} evidence={route.evidence} />}
      {route.kind === "preview" && <RunDashboard id="PREVIEW-84FD31" preview evidence={route.evidence} />}
    </Shell>
  );
}
