# Plan: Agregar drums al Melody Maker

## Resumen
Agregar 4 filas de drums al final del grid (debajo de las notas melódicas), usando los mismos sonidos del Drum Box (Kick, Snare, Hi-hat, Clap) sintetizados con Web Audio API.

## Cambios

### sounds.js
- Agregar funciones de síntesis de drums: playKick, playSnare, playHihat, playClap (copiadas del drum box)
- Agregar array `drums` con la misma estructura que `notes`: { name, play, emoji, color, isDrum: true }
- Exportar `drums` junto con `notes`
- Los drums usan colores más cálidos/distintos para diferenciarse: tonos más hacia el naranja-rosado

### app.js
- Importar `drums` desde sounds.js
- Crear array combinado: `allRows = [...notes, ...drums]`
- ROWS ahora es `allRows.length` (8 + 4 = 12)
- buildGrid usa `allRows` en vez de `notes`
- step() usa `allRows[row].play()` en vez de `notes[row].play()`
- El grid guardado en save/load ahora tiene 12 filas (backward compatible: si se carga un save viejo con 8 filas, las 4 drum rows quedan vacías)
- loadState() debe manejar saves con 8 o 12 filas

### style.css
- Agregar clase `.cell.drum` con border-style diferente (e.g., dashed o con un pattern distinto)
- Las celdas drum activas usan un estilo ligeramente diferente: un inner shape cuadrado en vez de circular
- Agregar un separador visual (línea divisoria) entre notas y drums

### Tests
- Actualizar test de grid: ahora 12 filas, 192 celdas (12 x 16)
- Agregar test: las últimas 4 filas tienen clase "drum"
- Agregar test: hay un separador visual entre notas y drums
