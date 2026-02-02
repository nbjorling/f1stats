# Track Visualization - Three-Color Sections & Pit Lane Configuration

## Overview

The track visualization system now supports:
1. **Three colored sections** along the track path
2. **Configurable pit lane positions** (entry, exit, and box markers)

## Track Configuration

Each track in the `TrackData` type now includes:

### Sectors Configuration

Define where each of the three sections end (as fractions of the total track length, 0-1):

```typescript
sectors: {
  s1End: 0.33,  // First section ends at 33% of track
  s2End: 0.67,  // Second section ends at 67% of track
  // Third section automatically ends at 1.0 (100%)
}
```

### Pit Lane Configuration

```typescript
pit: {
  entryT: 0.95,    // Pit entry point (typically before start/finish)
  exitT: 0.08,     // Pit exit point (typically after start/finish)
  boxT: 0.01,      // Optional: Pit box marker position
}
```

**Note:** All values are normalized (0-1) representing the fraction around the lap:
- `0` or `1` = Start/Finish line
- `0.5` = Halfway around the track
- Values > 0.95 are before the start line (wrapping around)
- Values < 0.15 are after the start line

## Example Track Definition

```typescript
export const monaco: TrackData = {
  id: "monaco",
  name: "Circuit de Monaco",
  country: "Monaco",
  trackLength: 3337,
  viewBox: "-100 -100 400 700",
  path: `M54.1136 377.561C41.6784...`,  // SVG path data

  sectors: {
    s1End: 0.33,   // Section 1 (Purple): 0% - 33%
    s2End: 0.66,   // Section 2 (Green): 33% - 66%
                   // Section 3 (Blue): 66% - 100%
  },

  pit: {
    entryT: 0.08,  // Pit entry at 8% (before start line wraps to 0.92)
    exitT: 0.12,   // Pit exit at 12%
    boxT: 0.10,    // Pit box at 10%
  },
};
```

## Visual Representation

### Track Colors
- **Section 1** (Purple/#9C27B0): From start to `s1End`
- **Section 2** (Green/#00E676): From `s1End` to `s2End`
- **Section 3** (Blue/#2979FF): From `s2End` to finish

### Pit Lane Markers
- **PIT IN** (Orange/#FFA726): Pit lane entry point
- **PIT OUT** (Green/#66BB6A): Pit lane exit point

## Customizing Colors

To customize section colors, modify the colors in `track-visualization.tsx`:

```typescript
{/* Section 1 - Purple */}
<path stroke="#9C27B0" ... />

{/* Section 2 - Green */}
<path stroke="#00E676" ... />

{/* Section 3 - Blue */}
<path stroke="#2979FF" ... />
```

## Setting Pit Lane Positions

### Finding the Right Values

1. **Pit Entry (`entryT`)**: Usually 5-10% before the start/finish line
   - For values before start: Use 0.90-0.97
   - For values after start: Use 0.05-0.15

2. **Pit Exit (`exitT`)**: Usually 5-15% after the start/finish line
   - Typically: 0.05-0.15

3. **Pit Box (`boxT`)**: Between entry and exit (optional)
   - Wraps around 0: If entry=0.95 and exit=0.10, box might be 0.02

### Example: Typical F1 Pit Lane Setup

```typescript
pit: {
  entryT: 0.94,  // Entry before start/finish
  exitT: 0.10,   // Exit after start/finish
  boxT: 0.02,    // Box between them (wrapping around 0)
}
```

## Migration from Old Format

The old `pitExitPosition` field is now deprecated. It has been replaced by `pit.exitT`:

### Before:
```typescript
pitExitPosition: 0.12,
```

### After:
```typescript
pit: {
  entryT: 0.95,
  exitT: 0.12,  // Same value as old pitExitPosition
  boxT: 0.03,
}
```

## Advanced: Using TrackSections Type

For even more control, you can use the `TrackSections` type to specify individual colors:

```typescript
sections: {
  section1: {
    start: 0,
    end: 0.33,
    color: "#FF1744"
  },
  section2: {
    start: 0.33,
    end: 0.66,
    color: "#00E676"
  },
  section3: {
    start: 0.66,
    end: 1.0,
    color: "#2979FF"
  }
}
```

**Note:** This feature is available in the type definitions but not yet implemented in the rendering component.
