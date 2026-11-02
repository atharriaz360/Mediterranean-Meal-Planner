# Video v2 QA

- VERIFIED: 16 preview checkpoints inspected, including the corrected opening and Backup/Restore scene. Text reviewed at 480 px preview width. Detailed app labels require the larger video view.
- VERIFIED: Real grocery list: 12 → 47 items; bought: 3 → 4. Capture page errors: none recorded. All feature scenes share the same capture session after these actions.
- VERIFIED: Maximum two device mockups per scene. The overview grid consists of actual app captures, not extra device mockups. No demo bar, reviews, stars or medical-result claims appear.
- VERIFIED: All 444 encoded frames decoded; 14.8 s; 1440×1080; 30 fps; H.264; yuv420p; no audio; faststart; 6,365,287 bytes.
- VERIFIED: Decoded final-frame mean absolute pixel difference from the browser-rendered final hero reference: 3.0206 / 255. Pass threshold: <5 / 255, allowing lossy encoding.
- VERIFIED: The exact listing hero image is the end-card source. It is held at scale 1 for 1.7 seconds. It depicts the earlier listing sample snapshot; the feature demonstration shows the real updated grocery count.
- INFERENCE: Shorter secondary scenes give more feature coverage. Their speed may require replay for small UI details.
- UNKNOWN: Actual sales lift, a three-second winner result, or best-ever ranking. This QA checks the artifact, not Etsy policy or comparative market performance.
