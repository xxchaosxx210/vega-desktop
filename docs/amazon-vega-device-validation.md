# Amazon Vega Fire TV validation

This branch addresses startup, text input and public HLS playback on a
32-bit Fire TV Stick HD running Vega OS 2.0.

## Changes

- Enable WebView DOM storage so settings can initialize.
- Allow playback after the app finishes resolving a selected stream.
- Give dialog content DOM focus before selecting its spatial-navigation child.
- Focus text inputs during activation and restore navigation if a typing input unmounts.
- Select the existing HTML video engine for Amazon Vega. The Libmedia playback
  test terminated the WebView renderer. The precise renderer failure is unresolved.
- Initialize the desktop HLS proxy only when custom request headers require it.

## Verified on a physical device

- App starts and displays the welcome screen.
- Example provider installation and catalog browsing.
- Big Buck Bunny HLS video at 1920x1080 with audible sound.
- Physical remote navigation, pause/resume, forward/backward seeking and return to Home.
- Provider/catalog persistence after closing and reopening the app.
- Stored UI-scale setting remains present after reopening.

## Limitations

This is an experimental device-tested patch, not a claim of complete Vega
feature parity. Provider streams requiring custom HTTP headers still use the
desktop proxy path in the HTML engine and are not supported by this patch.
Other formats/codecs, subtitles, DRM, torrents, VPN routing and reboot persistence
have not been verified. The cleaned release was installed and its Home screen and saved provider were
verified with a device screenshot. Physical dialog-focus behavior needs a final
check on the cleaned release.

The default test stream is Big Buck Bunny from the Vega example provider:
https://github.com/vega-org/providers-template
https://test-streams.mux.dev/

## Build

Use a native Ubuntu or macOS host supported by Amazon. The development session
used Ubuntu 24.04 under WSL2, which Amazon does not officially support.

Install the official Vega SDK and Rust toolchain, including ARMv7, AArch64 and
x86_64 Linux targets, before running:

```bash
source ~/vega/env
source ~/.cargo/env
npm ci --ignore-scripts
npm run package:amazon-vega
```

Install and launch the ARMv7 release:

```bash
vega device install-app --packagePath dist-tv/amazon-vega/app/build/armv7-release/vegatv_armv7.vpkg
vega device launch-app --appName in.vegaapp.tv.main
```

For a network connection, use the connection identifier from the device list
with the CLI's device selector. Keep signing keys, account credentials, device
codes, logs and diagnostic screenshots outside source control.
