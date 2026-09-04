#!/usr/bin/env bash
# Generates the three project illustrations that have no photograph.
#
# Needs OPENROUTER_API_KEY in .env (which is gitignored).
# Objects and places only, never people: an image of a person on a
# development record implies a real beneficiary, and these are illustrations.
set -euo pipefail

GEN="$HOME/.claude/skills/generate-image/scripts/generate_image.py"
OUT="public/img"
STYLE="Photographic, natural daylight, muted earthy palette, shallow depth of field, documentary still life, no people, no text, no logos, no watermarks."

echo "→ street lights"
python3 "$GEN" \
  "A single solar powered street lamp standing beside a red laterite road in rural Ghana at dusk, low warm light, green bush behind, wide quiet composition. $STYLE" \
  --output "$OUT/project-streetlights.png"

echo "→ scholarships"
python3 "$GEN" \
  "A neat stack of school exercise books, a wooden ruler and a folded school uniform resting on a worn wooden desk in a classroom in rural Ghana, soft window light. $STYLE" \
  --output "$OUT/project-scholarships.png"

echo "→ tree planting"
python3 "$GEN" \
  "Rows of young tree seedlings in black nursery bags on red earth, ready for planting, a watering can beside them, rural Ghana, morning light. $STYLE" \
  --output "$OUT/project-trees.png"

echo
echo "Converting to jpg and trimming weight:"
for n in streetlights scholarships trees; do
  if [ -f "$OUT/project-$n.png" ]; then
    sips -s format jpeg -s formatOptions 82 -Z 1600 "$OUT/project-$n.png" --out "$OUT/project-$n.jpg" >/dev/null
    rm -f "$OUT/project-$n.png"
    printf "  %-32s %s\n" "project-$n.jpg" "$(du -h "$OUT/project-$n.jpg" | cut -f1)"
  fi
done
echo
echo "Done. Now wire them in lib/content.ts with illustration: true."
