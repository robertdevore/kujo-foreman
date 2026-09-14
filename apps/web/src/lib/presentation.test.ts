import { repositoryLabel, scopeLabel } from "./presentation";

describe("operator labels", () => {
  it("shows a repository name instead of an absolute host path", () => {
    expect(repositoryLabel("/workspace/repos/payment-service")).toBe("payment-service");
    expect(repositoryLabel("demo/payment-service")).toBe("payment-service");
    expect(repositoryLabel("/tmp/kujo-foreman/demo-frm-1234abcd")).toBe("payment-retry-demo");
  });

  it("compacts absolute capability scopes without changing logical scopes", () => {
    expect(scopeLabel("/workspace/.foreman/demo-123")).toBe("…/.foreman/demo-123");
    expect(scopeLabel("HEAD~1..HEAD")).toBe("HEAD~1..HEAD");
  });
});
