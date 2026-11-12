import type { Collection } from "./catalog";

type Details = { commonName: string; scientificName: string; origin: string; notes?: string; appearance?: string; scale: number; colorMode?: string };
export function buildPrompt(collection: Collection, details: Details) {
  const subjectInstructions = collection.id === "birds" ? "Full bird visible from beak to every tail feather, all wings and both feet included; one light botanical perch." :
  collection.id === "dogs" ? "Full dog visible in a natural standing or sitting three-quarter pose; both ears, all four paws and complete tail within frame; tiny grounding grasses only." :
  collection.id === "fish" ? "Single complete fish in clean side profile, with its entire tail, mouth, dorsal/ventral/pectoral fins fully visible; at most a tiny understated coral/anemone sketch below." :
  collection.id === "botanical" ? "Complete botanical study with flower heads, stamens, buds, leaves and stems visible in anatomically coherent arrangement. No cut stalks at canvas edges." :
  "Show one complete subject and preserve its important anatomical features.";
  const colorInstructions = details.colorMode === "monochrome" ? "Strictly black ink linework on ivory; no colours." : details.colorMode === "single" ? "Black ink plus exactly one crimson accent #A8414E applied only via engraved hatching; all other areas monochrome." : collection.id === "dogs" ? "Mostly charcoal / sepia hatching with muted natural fur colors only." :
  "Use subtle but clear selective natural colours ONLY where they describe real anatomy or species-specific markings; implement these colours as tinted ink hatching, not flat digital paint.";
  return `Produce ONE isolated, scientifically faithful antique natural history engraving specimen illustration.
SUBJECT: ${details.commonName}${details.scientificName ? ` (${details.scientificName})` : ""}.
ANATOMY: ${details.appearance || "Use authentic and accurate species markings, proportions, anatomy, color, and posture."}
SCENE: ${subjectInstructions}
STYLE: Antique Editorial Engraving V1.0 / Birds 1.0: razor-sharp, fine 19th century copperplate burin strokes, organic parallel linework following every form, fine stipple, restrained deepest-shadow crosshatching, deliberate untouched highlights; sophisticated natural history plate, not cartoon, not photo, not digital painting. ${colorInstructions}
COMPOSITION: Single complete subject centered in a roomy square canvas, subject occupies about 55-65 percent of total canvas width and 52-65 percent of height, with CLEAR empty margins around every extremity. NO cropping, NO cut tails, NO blurred extremities, NO shallow-focus blur. Clean neutral flat off-white background #F1EEE9. Very soft disappearing hatching only at base of tiny perch, otherwise absolutely no scenic background. Maximum clarity at original size. Crisp print-quality edges.
FORBIDDEN: No text, no letters, no labels, no badges, no plate numbers, no borders, no typography, no sun, no sunburst, no halos, no decorative medallion, no gradient, no paper texture, no shadows, no landscape, no clutter.
ADDITIONAL ART DIRECTION: ${details.notes || "Elegant museum specimen plate. Preserve anatomical fidelity."}
This image is ARTWORK ONLY; the app adds precise editorial text separately.`;
}
