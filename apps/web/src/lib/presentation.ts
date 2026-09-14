export function repositoryLabel(repository: string): string {
  const parts = repository.split(/[\\/]+/).filter(Boolean);
  const name = parts.at(-1) ?? repository;
  return /^demo-frm-[a-z0-9]+$/i.test(name) ? "payment-retry-demo" : name;
}

export function scopeLabel(scope: string): string {
  if (!scope.startsWith("/") && !/^[A-Za-z]:[\\/]/.test(scope)) return scope;
  const parts = scope.split(/[\\/]+/).filter(Boolean);
  return parts.length > 1 ? `…/${parts.slice(-2).join("/")}` : scope;
}
