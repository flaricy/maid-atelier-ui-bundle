# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).

## [Unreleased]

### Added

- Added a security reporting policy.
- Added complete third-party notices for the production dependency closure used by the browser bundle.

### Changed

- Refined the side-panel entry, file workspace, preview, and sub-agent surfaces with clearer hierarchy, stronger text contrast, consistent icons, and more reliable layout behavior.
- Removed the obsolete interface screenshot from the release documentation.
- Removed the Git-install `prepare` hook from the prebuilt bundle copy so installation does not require build-script approval.

### Security

- Hardened workspace path validation against symbolic-link escapes before file reads and writes.
