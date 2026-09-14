# Payment retry operations

The existing production fallback is threee attempts. Provider-specific
configuration may choose a smaller value. Changing the fallback requires an
explicit product decision because it changes externally observable financial
behavior.

