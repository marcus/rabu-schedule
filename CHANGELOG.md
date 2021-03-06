Rabu Schedule Change Log
========================

Release 0.5 (14 July 2011)
===
* ADDED: Feature ordering and "in/out" status may be changed by dragging and dropping features (or divider), and the schedule and burn-up chart will update accordingly.
* ADDED: Projection page uses two-column landscape layout when there's enough space, but falls back to portrait layout when there's not.
* ADDED: Input file format documentation in the readme file.
* FIXED: License and changelog are now included in release package.

Release 0.4 (14 June 2011)
===
* ADDED: Minification of Javascript.
* ADDED: Explanatory text in projection page.

Release 0.4.1 (14 June 2011)
---
* FIXED (cosmetic): Corrected version number in rabu.jar.

Release 0.3 (30 May 2011)
===
* BREAKING CHANGE: Migrated command-line interface from Ruby to Java
* FIXED: Burn-up chart renders properly in Internet Explorer 7 & 8
* CHANGED: Release is packaged as .zip file
* FIXED: "Invalid byte sequence" error no longer occurs in command-line interface
* ADDED: Command-line interface displays version and usage information

Release 0.2 (15 May 2011)
===
* ADDED: Risk-adjusted burn-up chart
* BREAKING CHANGE: Changed configuration file format to support iteration history
* CHANGED: Wording in HTML page
* CHANGED: 90% projection rounds up to next iteration
* FIXED (cosmetic): HTML page background renders properly when window is smaller than page height
* FIXED (cosmetic): HTML scroll bar no longer appears when window is larger than page height

Release 0.2.1 (18 May 2011)
---
* FIXED: Non-ASCII characters supported in configuration file, which must use the UTF-8 encoding

Release 0.1 (17 Apr 2011)
===
* Initial release
* Command-line interface
* Schedule projection
* List of features
* Divider showing which features are included and excluded

Release 0.1.1 (17 Apr 2011)
---
* Pre-compiled release files

Release 0.1.2 (18 Apr 2011)
---
* Added dependencies to build documentation (in README)

Release 0.1.3 (18 Apr 2011)
---
* Automatically installs dependencies during build
* Automatically re-captures test browser when needed during build

Release 0.1.4 (20 Apr 2011)
---
* Updated README to link to new Rabu website (http://www.teamrabu.com)
* Added change log