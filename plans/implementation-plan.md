# Anto Melody Maker - Implementation Plan

## Overview
A grid-based melody composer (like Mario Paint Composer) for Anto. Sister project to Anto Drum Box, sharing the same visual design language.

## Architecture

### Files
- `index.html` - Main page structure
- `style.css` - All styles (Fredoka font, pink/purple palette, animated backgrounds)
- `app.js` - Main logic: grid state, sequencer loop, UI controls
- `sounds.js` - Web Audio API synthesis (sine/triangle oscillators for musical notes)
- `visual.js` - Canvas 2D visual effects (particles, stars, musical notes)
- `playwright.config.js` - Test configuration (port 3335)
- `test.spec.js` - Playwright tests

### Grid
- 8 rows: C4, D4, E4, F4, G4, A4, B4, C5
- 16 columns: time steps
- Each row has a unique color from the pink-purple gradient

### Sequencer
- Play/Stop toggle
- BPM slider (60-200, default 120)
- Playhead highlights current column
- Plays active notes using Web Audio API oscillators

### Sound Synthesis
- Each note maps to a frequency (C4=261.63Hz, D4=293.66Hz, etc.)
- Triangle wave oscillator with ADSR envelope
- Short sustain for melodic sound

### Visual Effects
- Canvas with animated background stars
- Particles spawn when notes play
- Expanding rings on beat
- Musical note symbols float up
- Wave lines reactive to playback

### Design
- Identical to Anto Drum Box: Fredoka font, pink/purple palette, animated gradient title, floating stars/hearts, blurred background bubbles
- Spanish UI text
- Footer: "Hecho con amor para Anto"

## Test Plan
1. Page loads with title "Anto Melody Maker"
2. Grid renders 8 rows x 16 columns (128 cells)
3. Cells toggle active/inactive on click
4. Play button toggles play/stop state
5. BPM slider updates displayed value
6. Clear button resets all cells
7. Visual canvas exists with dimensions
8. Sequencer highlights current column during playback
