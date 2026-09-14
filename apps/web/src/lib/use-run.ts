import { useEffect, useReducer } from "react";
import { foremanApi, parseForemanEvent } from "./api";
import { previewRun } from "./preview-fixture";
import { initialRunState, runReducer } from "./run-reducer";

export function useRun(id: string, preview: boolean) {
  const [state, dispatch] = useReducer(runReducer, preview ? { ...initialRunState, run: previewRun, connection: "closed" } : initialRunState);

  useEffect(() => {
    if (preview) return;
    let disposed = false;
    let source: EventSource | undefined;

    dispatch({ type: "connect" });
    foremanApi
      .getRun(id)
      .then((run) => {
        if (disposed) return;
        dispatch({ type: "hydrate", run });
        source = new EventSource(foremanApi.eventUrl(id));
        source.onopen = () => dispatch({ type: "connected" });
        source.onmessage = (message) => {
          const event = parseForemanEvent(message.data);
          if (event) dispatch({ type: "event", event });
        };
        source.onerror = () => {
          if (source?.readyState === EventSource.CLOSED) dispatch({ type: "closed" });
          else dispatch({ type: "reconnecting" });
        };
      })
      .catch((error: unknown) => {
        if (!disposed) dispatch({ type: "error", message: error instanceof Error ? error.message : "Unable to load run" });
      });

    return () => {
      disposed = true;
      source?.close();
    };
  }, [id, preview]);

  return { state, dispatch };
}
