# Troubleshooting Guide

## NPM Configuration Warnings

If you see warnings like:

```
npm warn Unknown env config "verify-deps-before-run". This will stop working in the next major version of npm.
npm warn Unknown env config "_jsr-registry". This will stop working in the next major version of npm.
```

These warnings indicate that you have npm environment variables set that are not recognized by the current version of npm and will be deprecated in future versions.

### How to Fix

1. **Check your shell environment variables:**

   ```bash
   env | grep npm_config
   ```

2. **Remove the problematic environment variables:**

   ```bash
   unset npm_config_verify_deps_before_run
   unset npm_config__jsr_registry
   ```

3. **Make the changes permanent by removing them from your shell profile:**
   - For bash: `~/.bashrc` or `~/.bash_profile`
   - For zsh: `~/.zshrc`
   - For fish: `~/.config/fish/config.fish`

4. **Restart your terminal** or source your profile:
   ```bash
   source ~/.zshrc  # or ~/.bashrc
   ```

### Alternative: Use .npmrc

If you need these configurations, you can move them to a `.npmrc` file in your project root or home directory:

```ini
# .npmrc
verify-deps-before-run=true
_jsr-registry=https://registry.npmjs.org/
```

However, since these are deprecated configurations, it's recommended to remove them entirely unless you have a specific need for them.

## Test Failures

### AudioContext Mock Issues

If you encounter `this.audioContext.close is not a function` errors in tests, this indicates that the AudioContext mock is not properly initialized. This has been fixed in the test setup, but if you encounter similar issues:

1. Ensure the `tests/setup.js` file is properly configured
2. Check that nested `beforeEach` blocks properly mock the audioManager's audioContext
3. Verify that `vi.useFakeTimers()` is called before creating app instances

### Metronome Click Test Failures

If tests expecting metronome clicks fail, ensure:

1. The spy is created with `.mockResolvedValue()`
2. The test properly awaits async calls like `app.toggleTimer()`
3. The metronome is enabled before testing: `app.settings.metronomeEnabled = true`
