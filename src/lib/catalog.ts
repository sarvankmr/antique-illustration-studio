export type CollectionId = "birds" | "dogs" | "fish" | "botanical" | string;
export type ItemPreset = { commonName: string; scientificName: string; origin: string; appearance?: string };
export type Collection = {
  id: CollectionId; title: string; version: string; singular: string;
  originLabel: string; accent: string; description: string;
  baseNumber: number; icon: "bird" | "dog" | "fish" | "flower" | "sparkle";
  presets: ItemPreset[];
};
export type Plate = {
  id: string; collectionId: string; number: number; commonName: string;
  scientificName: string; origin: string; notes: string;
  image: string; imageScale: number; createdAt: number; revision: number;
};
export const COLLECTIONS: Collection[] = [
  {
    id: "birds", title: "Birds", version: "1.0", singular: "Bird", originLabel: "Native to", accent: "#A8414E",
    description: "Ornithological studies in fine-line colour engraving", baseNumber: 1, icon: "bird",
    presets: [
      { commonName: "Vermilion Flycatcher", scientificName: "Pyrocephalus rubinus", origin: "Southwestern U.S., Mexico, Central and South America", appearance: "scarlet crown and underside, charcoal back and wings, slender black bill" },
      { commonName: "Indian Roller", scientificName: "Coracias benghalensis", origin: "Indian subcontinent and parts of West Asia", appearance: "bright turquoise and cobalt flight feathers, brownish breast" },
      { commonName: "Resplendent Quetzal", scientificName: "Pharomachrus mocinno", origin: "Southern Mexico and Central America", appearance: "emerald green head and back, crimson breast and exceptionally long green tail streamers" },
      { commonName: "Scarlet Macaw", scientificName: "Ara macao", origin: "Southern Mexico, Central and northern South America", appearance: "scarlet plumage with yellow and blue wing feathers, long tail" },
      { commonName: "Greater Flamingo", scientificName: "Phoenicopterus roseus", origin: "Africa, southern Europe, the Middle East and South Asia", appearance: "pale rose plumage, curved dark-tipped bill and very long pink legs" },
      { commonName: "Snowy Owl", scientificName: "Bubo scandiacus", origin: "Arctic North America and Eurasia", appearance: "white plumage with subtle black barring; feathered feet" },
      { commonName: "King Penguin", scientificName: "Aptenodytes patagonicus", origin: "Subantarctic islands", appearance: "black back, pale chest, golden-orange ear and neck markings" },
      { commonName: "Blue-footed Booby", scientificName: "Sula nebouxii", origin: "Eastern tropical Pacific, including the Galápagos", appearance: "brown and white seabird with vivid azure-blue webbed feet" },
      { commonName: "Eurasian Hoopoe", scientificName: "Upupa epops", origin: "Europe, Asia and North Africa", appearance: "orange-buff body, tall fan crest, black and white striped wings" },
      { commonName: "Blue Jay", scientificName: "Cyanocitta cristata", origin: "Eastern and central North America", appearance: "electric blue crest, back and wings, white underside and black collar" },
      { commonName: "Ruby-throated Hummingbird", scientificName: "Archilochus colubris", origin: "Eastern North America and Central America", appearance: "emerald back, ruby throat and delicate hovering wings" },
      { commonName: "European Goldfinch", scientificName: "Carduelis carduelis", origin: "Europe, North Africa and western Asia", appearance: "red face, black-and-white head, yellow wing bar" },
    ]
  },
  {
    id: "dogs", title: "Dogs", version: "1.0", singular: "Dog", originLabel: "Origin", accent: "#B18558",
    description: "Historic canine breed portraits with full-body anatomy", baseNumber: 0, icon: "dog",
    presets: [
      { commonName: "German Shepherd", scientificName: "Canis lupus familiaris", origin: "Germany", appearance: "tan and black saddle coat, erect ears, bushy tail" },
      { commonName: "Golden Retriever", scientificName: "Canis lupus familiaris", origin: "Scotland, United Kingdom", appearance: "golden long feathered fur, soft drop ears, broad expressive face" },
      { commonName: "Siberian Husky", scientificName: "Canis lupus familiaris", origin: "Siberia, Russia", appearance: "dense gray-white coat, erect ears, curled bushy tail" },
      { commonName: "Border Collie", scientificName: "Canis lupus familiaris", origin: "Anglo-Scottish border region", appearance: "black-white long coat, semi-erect ears, long tail" },
      { commonName: "Labrador Retriever", scientificName: "Canis lupus familiaris", origin: "Newfoundland, Canada; developed in Britain", appearance: "short yellow coat, athletic build, thick otter tail" },
      { commonName: "Beagle", scientificName: "Canis lupus familiaris", origin: "England, United Kingdom", appearance: "short tri-colour coat, drooping ears and upright tail" },
      { commonName: "Rottweiler", scientificName: "Canis lupus familiaris", origin: "Germany", appearance: "robust black body with tan points, natural long tail" },
      { commonName: "Doberman Pinscher", scientificName: "Canis lupus familiaris", origin: "Germany", appearance: "athletic black-and-tan body, natural ears and tail" },
      { commonName: "Dalmatian", scientificName: "Canis lupus familiaris", origin: "Dalmatia, Croatia", appearance: "white short coat with distinct black spots, long tail" },
      { commonName: "Indian Pariah Dog", scientificName: "Canis lupus familiaris", origin: "Indian subcontinent", appearance: "medium-sized tan dog with wedge face, erect ears, curved tail" },
    ]
  },
  {
    id: "fish", title: "Fish", version: "1.0", singular: "Fish", originLabel: "Native to", accent: "#CC7838",
    description: "Marine specimens with every fin and tail preserved", baseNumber: 1, icon: "fish",
    presets: [
      { commonName: "Clown Anemonefish", scientificName: "Amphiprion ocellaris", origin: "Eastern Indian Ocean and western Pacific", appearance: "orange body with three white black-bordered bands and rounded fins" },
      { commonName: "Yellowfin Tuna", scientificName: "Thunnus albacares", origin: "Tropical and subtropical oceans worldwide", appearance: "metallic blue back, silver underside, elongated yellow dorsal and anal fins" },
      { commonName: "Bluefin Tuna", scientificName: "Thunnus thynnus", origin: "Atlantic Ocean and Mediterranean Sea", appearance: "dark blue-black back, silver flanks, crescent tail" },
      { commonName: "Mandarinfish", scientificName: "Synchiropus splendidus", origin: "Western Pacific Ocean", appearance: "intricate swirling blue, green and orange patterns" },
      { commonName: "Lionfish", scientificName: "Pterois volitans", origin: "Indo-Pacific", appearance: "striped body, dramatic long venomous fin rays" },
      { commonName: "Moorish Idol", scientificName: "Zanclus cornutus", origin: "Indo-Pacific", appearance: "vertical black and yellow bands, very long trailing white dorsal filament" },
      { commonName: "Sailfish", scientificName: "Istiophorus platypterus", origin: "Indian and Pacific Oceans", appearance: "elongated bill, enormous cobalt dorsal sail, slender tail" },
      { commonName: "Emperor Angelfish", scientificName: "Pomacanthus imperator", origin: "Indo-Pacific reefs", appearance: "yellow-blue horizontal stripes, dark eye mask, bright yellow tail" },
    ]
  },
  {
    id: "botanical", title: "Botanicals", version: "1.0", singular: "Flower", originLabel: "Native to", accent: "#B56D82",
    description: "Botanical specimens with stems, blooms and foliage intact", baseNumber: 1, icon: "flower",
    presets: [
      { commonName: "Sacred Lotus", scientificName: "Nelumbo nucifera", origin: "Asia and northern Australia", appearance: "large pink petals, golden seed pod, round lotus leaves and single bud" },
      { commonName: "Hibiscus", scientificName: "Hibiscus rosa-sinensis", origin: "Tropical Asia; exact wild origin uncertain", appearance: "large red trumpet-shaped flower with long pollen-bearing staminal column" },
      { commonName: "Blue Water Lily", scientificName: "Nymphaea nouchali", origin: "South and Southeast Asia", appearance: "star-shaped blue-purple petals, golden stamens, floating leaves" },
      { commonName: "Jacaranda", scientificName: "Jacaranda mimosifolia", origin: "South America", appearance: "violet-blue tubular flowers, fine fernlike leaves" },
      { commonName: "Plumeria", scientificName: "Plumeria rubra", origin: "Mexico, Central America and northern South America", appearance: "five waxy white-pink petals with yellow center, leathery leaves" },
      { commonName: "Bird of Paradise", scientificName: "Strelitzia reginae", origin: "South Africa", appearance: "orange and blue pointed floral forms, banana-like leaves" },
      { commonName: "Passionflower", scientificName: "Passiflora caerulea", origin: "South America", appearance: "complex radial petals with blue-purple filaments, lobed leaves" },
      { commonName: "Red Ginger", scientificName: "Alpinia purpurata", origin: "Melanesia and the southwestern Pacific", appearance: "tall vibrant red bracts, glossy lance-shaped leaves" },
    ]
  }
];
export const SEED_PLATES: Plate[] = [
 { id: "seed-bird", collectionId: "birds", number: 1, commonName: "Vermilion Flycatcher", scientificName: "Pyrocephalus rubinus", origin: "Southwestern U.S., Mexico, Central and South America", notes: "", image: "/samples/vermilion.webp", imageScale: 68, createdAt: 1730000000000, revision: 1 },
 { id: "seed-fish", collectionId: "fish", number: 1, commonName: "Clown Anemonefish", scientificName: "Amphiprion ocellaris", origin: "Eastern Indian Ocean and western Pacific", notes: "", image: "/samples/clownfish.webp", imageScale: 71, createdAt: 1730000000000, revision: 1 },
 { id: "seed-botanical", collectionId: "botanical", number: 1, commonName: "Sacred Lotus", scientificName: "Nelumbo nucifera", origin: "Asia and northern Australia", notes: "", image: "/samples/lotus.webp", imageScale: 75, createdAt: 1730000000000, revision: 1 }
];
export const pad = (n: number) => String(n).padStart(2, "0");
