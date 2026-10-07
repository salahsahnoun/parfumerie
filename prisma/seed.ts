import "dotenv/config";
import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

// ─── Helpers ─────────────────────────────────────────────────────────────────

function slug(str: string) {
  return str
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

// ─── Données ─────────────────────────────────────────────────────────────────

const ACCORDS = [
  { name: "Boisé",      color: "#8B6914" },
  { name: "Floral",     color: "#E91E8C" },
  { name: "Oriental",   color: "#C4720A" },
  { name: "Frais",      color: "#4FC3F7" },
  { name: "Cuiré",      color: "#6D4C41" },
  { name: "Gourmand",   color: "#7B1FA2" },
  { name: "Aromatique", color: "#2E7D32" },
  { name: "Aquatique",  color: "#0277BD" },
  { name: "Musqué",     color: "#9E9E9E" },
  { name: "Fruité",     color: "#E64A19" },
  { name: "Épicé",      color: "#BF360C" },
  { name: "Poudré",     color: "#F8BBD9" },
];

const NOTES = [
  // Tête
  { name: "Bergamote",   family: "Agrumes" },
  { name: "Citron",      family: "Agrumes" },
  { name: "Mandarine",   family: "Agrumes" },
  { name: "Pamplemousse",family: "Agrumes" },
  { name: "Orange",      family: "Agrumes" },
  { name: "Cardamome",   family: "Épices" },
  { name: "Poivre rose", family: "Épices" },
  { name: "Gingembre",   family: "Épices" },
  { name: "Ananas",      family: "Fruité" },
  // Cœur
  { name: "Rose",        family: "Floral" },
  { name: "Jasmin",      family: "Floral" },
  { name: "Iris",        family: "Floral" },
  { name: "Violette",    family: "Floral" },
  { name: "Pivoine",     family: "Floral" },
  { name: "Géranium",    family: "Floral" },
  { name: "Néroli",      family: "Floral" },
  { name: "Muguet",      family: "Floral" },
  { name: "Lavande",     family: "Aromatique" },
  { name: "Magnolia",    family: "Floral" },
  // Fond
  { name: "Vétiver",     family: "Boisé" },
  { name: "Cèdre",       family: "Boisé" },
  { name: "Santal",      family: "Boisé" },
  { name: "Patchouli",   family: "Boisé" },
  { name: "Musc blanc",  family: "Musqué" },
  { name: "Ambre",       family: "Oriental" },
  { name: "Vanille",     family: "Gourmand" },
  { name: "Oud",         family: "Oriental" },
  { name: "Encens",      family: "Oriental" },
  { name: "Fève tonka",  family: "Gourmand" },
  { name: "Bouleau fumé",family: "Boisé" },
  { name: "Figuier",     family: "Boisé" },
  { name: "Chêne",       family: "Boisé" },
  { name: "Ambrette",    family: "Musqué" },
  { name: "Papyrus",     family: "Boisé" },
];

const MAISONS = [
  { name: "Chanel",   country: "France",     website: "https://www.chanel.com" },
  { name: "Hermès",   country: "France",     website: "https://www.hermes.com" },
  { name: "Byredo",   country: "Suède",      website: "https://www.byredo.com" },
  { name: "Le Labo",  country: "États-Unis", website: "https://www.lelabofragrances.com" },
  { name: "Creed",    country: "Royaume-Uni",website: "https://www.creedperfume.com" },
  { name: "Diptyque", country: "France",     website: "https://www.diptyqueparis.com" },
];

const PARFUMEURS = [
  { name: "Olivier Polge",      bio: "Parfumeur en chef de Chanel depuis 2015, fils de Jacques Polge." },
  { name: "Christine Nagel",    bio: "Parfumeure en chef d'Hermès depuis 2016, successeure de Jean-Claude Ellena." },
  { name: "Jean-Claude Ellena", bio: "Ancien parfumeur exclusif d'Hermès (2004–2016), connu pour son style minimaliste." },
  { name: "Nathalie Feisthauer",bio: "Créatrice de nombreuses fragrances niche, notamment pour Byredo." },
  { name: "Mark Buxton",        bio: "Parfumeur indépendant, co-créateur de plusieurs fragrances Byredo." },
];

// ─── Parfums avec leur pyramide complète ─────────────────────────────────────

type PerfumeData = {
  name: string;
  house: string;
  year: number;
  concentration: string;
  gender: "MASCULINE" | "FEMININE" | "UNISEX";
  description: string;
  imageUrl: string;
  perfumers: string[];
  topNotes: string[];
  heartNotes: string[];
  baseNotes: string[];
  accords: { name: string; strength: number }[];
};

const PARFUMS: PerfumeData[] = [
  {
    name: "Chanel N°5",
    house: "Chanel",
    year: 1921,
    concentration: "EDP",
    gender: "FEMININE",
    description: "L'iconique fragrance florale aldéhydée de Chanel, créée par Ernest Beaux pour Gabrielle Chanel. Un monument de la parfumerie moderne.",
    imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/7/7c/CHANEL_N%C2%B05.jpg/600px-CHANEL_N%C2%B05.jpg",
    perfumers: ["Olivier Polge"],
    topNotes: ["Aldéhydes", "Néroli", "Bergamote", "Citron"],
    heartNotes: ["Rose", "Jasmin", "Iris", "Muguet", "Ylang-ylang"],
    baseNotes: ["Santal", "Vétiver", "Cèdre", "Vanille", "Musc blanc", "Ambre"],
    accords: [
      { name: "Floral", strength: 90 },
      { name: "Poudré", strength: 70 },
      { name: "Musqué", strength: 50 },
    ],
  },
  {
    name: "Bleu de Chanel",
    house: "Chanel",
    year: 2010,
    concentration: "EDP",
    gender: "MASCULINE",
    description: "Un boisé aromatique frais et moderne, expression de la liberté masculine selon Chanel.",
    imageUrl: "https://images.pexels.com/photos/4735908/pexels-photo-4735908.jpeg?auto=compress&cs=tinysrgb&w=600",
    perfumers: ["Olivier Polge"],
    topNotes: ["Citron", "Bergamote", "Orange", "Pamplemousse", "Menthe"],
    heartNotes: ["Jasmin", "Gingembre", "Géranium", "Noix de muscade", "Iso E Super"],
    baseNotes: ["Santal", "Cèdre", "Encens", "Vétiver", "Patchouli", "Ambre gris"],
    accords: [
      { name: "Boisé", strength: 80 },
      { name: "Frais", strength: 65 },
      { name: "Aromatique", strength: 60 },
    ],
  },
  {
    name: "Terre d'Hermès",
    house: "Hermès",
    year: 2006,
    concentration: "EDT",
    gender: "MASCULINE",
    description: "Un voyage sensoriel entre ciel et terre. Notes minérales de silex, fraîcheur des agrumes, chaleur des bois. La signature d'Hermès par Jean-Claude Ellena.",
    imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/5/59/Terre_d%E2%80%99Herm%C3%A8s_%28cropped%29.JPG/600px-Terre_d%E2%80%99Herm%C3%A8s_%28cropped%29.JPG",
    perfumers: ["Jean-Claude Ellena"],
    topNotes: ["Orange", "Pamplemousse"],
    heartNotes: ["Poivre rose", "Géranium", "Silex"],
    baseNotes: ["Vétiver", "Cèdre", "Patchouli", "Fève tonka", "Encens"],
    accords: [
      { name: "Boisé", strength: 85 },
      { name: "Fruité", strength: 50 },
      { name: "Épicé", strength: 45 },
      { name: "Aromatique", strength: 40 },
    ],
  },
  {
    name: "Twilly d'Hermès",
    house: "Hermès",
    year: 2017,
    concentration: "EDP",
    gender: "FEMININE",
    description: "Espiègle et sensuelle, Twilly capture l'énergie des jeunes femmes Hermès avec un accord gingembre-iris-musc inoubliable.",
    imageUrl: "https://images.pexels.com/photos/1666405/pexels-photo-1666405.jpeg?auto=compress&cs=tinysrgb&w=600",
    perfumers: ["Christine Nagel"],
    topNotes: ["Gingembre"],
    heartNotes: ["Iris", "Tubéreuse"],
    baseNotes: ["Santal", "Musc blanc", "Vanille"],
    accords: [
      { name: "Floral", strength: 70 },
      { name: "Épicé", strength: 65 },
      { name: "Boisé", strength: 45 },
      { name: "Poudré", strength: 40 },
    ],
  },
  {
    name: "Gypsy Water",
    house: "Byredo",
    year: 2008,
    concentration: "EDP",
    gender: "UNISEX",
    description: "Inspiré du mode de vie nomade des Roms, Gypsy Water évoque la liberté, la forêt, et les feux de camp. Bergamote fraîche, pin mystérieux, fond boisé chaleureux.",
    imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/5/56/Picture_of_Byredo_perfume.jpg/600px-Picture_of_Byredo_perfume.jpg",
    perfumers: ["Nathalie Feisthauer"],
    topNotes: ["Bergamote", "Citron", "Pin", "Poivre"],
    heartNotes: ["Néroli", "Orris", "Genévrier"],
    baseNotes: ["Santal", "Vanille", "Ambre", "Musc blanc"],
    accords: [
      { name: "Boisé", strength: 75 },
      { name: "Frais", strength: 60 },
      { name: "Aromatique", strength: 50 },
      { name: "Musqué", strength: 45 },
    ],
  },
  {
    name: "Mojave Ghost",
    house: "Byredo",
    year: 2014,
    concentration: "EDP",
    gender: "UNISEX",
    description: "Inspiré par une fleur du désert de Mojave qui survit sans eau, une fragrance fantomatique et enveloppante sur un fond de santal et ambrette.",
    imageUrl: "https://images.pexels.com/photos/7703038/pexels-photo-7703038.jpeg?auto=compress&cs=tinysrgb&w=600",
    perfumers: ["Mark Buxton"],
    topNotes: ["Magnolia", "Ambrette"],
    heartNotes: ["Néroli", "Violet", "Jasmin"],
    baseNotes: ["Santal", "Musc blanc", "Ambre"],
    accords: [
      { name: "Floral", strength: 70 },
      { name: "Boisé", strength: 65 },
      { name: "Musqué", strength: 55 },
    ],
  },
  {
    name: "Santal 33",
    house: "Le Labo",
    year: 2011,
    concentration: "EDP",
    gender: "UNISEX",
    description: "Le parfum cult de Le Labo. Un accord santal-cardamome-iris devenu la signature olfactive de toute une génération urbaine. Impossible à ignorer.",
    imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/8/86/Le_Labo_Santal_33_in_a_50_milliliter_bottle_%28cropped%29.jpg/600px-Le_Labo_Santal_33_in_a_50_milliliter_bottle_%28cropped%29.jpg",
    perfumers: ["Frank Voelkl"],
    topNotes: ["Cardamome", "Iris", "Violette"],
    heartNotes: ["Amyris", "Papyrus"],
    baseNotes: ["Santal", "Cèdre", "Musc blanc", "Cuir"],
    accords: [
      { name: "Boisé", strength: 90 },
      { name: "Cuiré", strength: 60 },
      { name: "Aromatique", strength: 50 },
    ],
  },
  {
    name: "Rose 31",
    house: "Le Labo",
    year: 2006,
    concentration: "EDP",
    gender: "UNISEX",
    description: "Une rose désaccordée, presque masculine. Cumin et cèdre viennent tordre le floral classique pour donner quelque chose d'unique et de perturbant.",
    imageUrl: "https://images.pexels.com/photos/32630380/pexels-photo-32630380.jpeg?auto=compress&cs=tinysrgb&w=600",
    perfumers: ["Daphné Bugey"],
    topNotes: ["Rose", "Cardamome"],
    heartNotes: ["Cumin", "Géranium", "Ciste"],
    baseNotes: ["Cèdre", "Musc blanc", "Ambre", "Vétiver"],
    accords: [
      { name: "Floral", strength: 75 },
      { name: "Boisé", strength: 65 },
      { name: "Épicé", strength: 55 },
      { name: "Cuiré", strength: 30 },
    ],
  },
  {
    name: "Aventus",
    house: "Creed",
    year: 2010,
    concentration: "EDP",
    gender: "MASCULINE",
    description: "Inspiré de la vie de Napoléon, Aventus est devenu la fragrance masculine la plus copiée au monde. Ananas fumé, bouleau, fond musqué et boisé. Un monument.",
    imageUrl: "https://images.pexels.com/photos/15096784/pexels-photo-15096784.jpeg?auto=compress&cs=tinysrgb&w=600",
    perfumers: ["Olivier Creed", "Erwin Creed"],
    topNotes: ["Ananas", "Bergamote", "Pomme", "Cassis"],
    heartNotes: ["Bouleau fumé", "Jasmin", "Rose", "Patchouli"],
    baseNotes: ["Musc blanc", "Chêne", "Ambre gris", "Vétiver"],
    accords: [
      { name: "Fruité", strength: 80 },
      { name: "Boisé", strength: 75 },
      { name: "Musqué", strength: 60 },
      { name: "Frais", strength: 45 },
    ],
  },
  {
    name: "Silver Mountain Water",
    house: "Creed",
    year: 1995,
    concentration: "EDT",
    gender: "UNISEX",
    description: "Inspiré par la fonte des neiges dans les Alpes suisses, Silver Mountain Water allie thé vert, bergamote et muscs aquatiques pour une fraîcheur incomparable.",
    imageUrl: "https://images.pexels.com/photos/32645088/pexels-photo-32645088.jpeg?auto=compress&cs=tinysrgb&w=600",
    perfumers: ["Olivier Creed"],
    topNotes: ["Bergamote", "Mandarine", "Cassis"],
    heartNotes: ["Thé vert", "Gingembre"],
    baseNotes: ["Santal", "Musc blanc", "Patchouli"],
    accords: [
      { name: "Frais", strength: 85 },
      { name: "Aquatique", strength: 70 },
      { name: "Boisé", strength: 40 },
    ],
  },
  {
    name: "Philosykos",
    house: "Diptyque",
    year: 2000,
    concentration: "EDT",
    gender: "UNISEX",
    description: "Une ode au figuier sous le soleil de Grèce. Feuilles fraîches, lait de figuier, bois sec. L'une des plus belles évocations végétales de la parfumerie.",
    imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/0/03/Diptyque_Parfum_%284242455874%29.jpg/600px-Diptyque_Parfum_%284242455874%29.jpg",
    perfumers: ["Olivia Giacobetti"],
    topNotes: ["Figue", "Figuier", "Cèdre"],
    heartNotes: ["Figuier"],
    baseNotes: ["Figuier", "Musc blanc", "Cèdre"],
    accords: [
      { name: "Boisé", strength: 80 },
      { name: "Frais", strength: 60 },
      { name: "Aromatique", strength: 50 },
    ],
  },
  {
    name: "Eau des Sens",
    house: "Diptyque",
    year: 2016,
    concentration: "EDT",
    gender: "UNISEX",
    description: "Un paradoxe olfactif : fraîcheur des agrumes méditerranéens et profondeur terreuse du patchouli, réunis par le genévrier. Moderne et séduisant.",
    imageUrl: "https://images.pexels.com/photos/36389336/pexels-photo-36389336.jpeg?auto=compress&cs=tinysrgb&w=600",
    perfumers: ["Fabrice Pellegrin"],
    topNotes: ["Orange", "Bergamote", "Pamplemousse", "Genévrier"],
    heartNotes: ["Géranium", "Angélique"],
    baseNotes: ["Patchouli", "Ambre"],
    accords: [
      { name: "Fruité", strength: 70 },
      { name: "Aromatique", strength: 65 },
      { name: "Boisé", strength: 55 },
      { name: "Frais", strength: 50 },
    ],
  },
];

// ─── Utilisateurs de test ─────────────────────────────────────────────────────

const UTILISATEURS = [
  {
    username: "marie_delacroix",
    name: "Marie Delacroix",
    email: "marie@parfumerie.test",
    bio: "Passionnée de floraux et d'orientaux. Je chase les éditions limitées Chanel.",
  },
  {
    username: "thomas_bergmann",
    name: "Thomas Bergmann",
    email: "thomas@parfumerie.test",
    bio: "Amateur de niche depuis 10 ans. Santal 33 dans ma poche depuis toujours.",
  },
  {
    username: "sofia_antar",
    name: "Sofia Antar",
    email: "sofia@parfumerie.test",
    bio: "Minimaliste. Je ne porte que trois parfums. Mais je les connais par cœur.",
  },
];

// ─── Seed ─────────────────────────────────────────────────────────────────────

async function main() {
  console.log("🌱 Démarrage du seed...\n");

  // Nettoyage dans l'ordre des dépendances
  await prisma.follow.deleteMany();
  await prisma.listItem.deleteMany();
  await prisma.list.deleteMany();
  await prisma.review.deleteMany();
  await prisma.collection.deleteMany();
  await prisma.accordOnPerfume.deleteMany();
  await prisma.noteOnPerfume.deleteMany();
  await prisma.perfumerOnPerfume.deleteMany();
  await prisma.perfume.deleteMany();
  await prisma.perfumer.deleteMany();
  await prisma.house.deleteMany();
  await prisma.accord.deleteMany();
  await prisma.note.deleteMany();
  await prisma.session.deleteMany();
  await prisma.account.deleteMany();
  await prisma.verification.deleteMany();
  await prisma.user.deleteMany();
  console.log("  ✓ Base nettoyée");

  // ── Accords ───────────────────────────────────────────────────────────────
  const accordMap = new Map<string, string>();
  for (const a of ACCORDS) {
    const accord = await prisma.accord.create({
      data: { name: a.name, slug: slug(a.name), color: a.color },
    });
    accordMap.set(a.name, accord.id);
  }
  console.log(`  ✓ ${ACCORDS.length} accords créés`);

  // ── Notes ─────────────────────────────────────────────────────────────────
  const noteMap = new Map<string, string>();
  // Notes des parfums + notes supplémentaires du tableau NOTES
  const allNoteNames = new Set<string>([
    ...NOTES.map((n) => n.name),
    ...PARFUMS.flatMap((p) => [...p.topNotes, ...p.heartNotes, ...p.baseNotes]),
  ]);
  for (const noteName of allNoteNames) {
    const family = NOTES.find((n) => n.name === noteName)?.family;
    const note = await prisma.note.create({
      data: { name: noteName, slug: slug(noteName), family },
    });
    noteMap.set(noteName, note.id);
  }
  console.log(`  ✓ ${allNoteNames.size} notes créées`);

  // ── Maisons ───────────────────────────────────────────────────────────────
  const maisonMap = new Map<string, string>();
  for (const m of MAISONS) {
    const maison = await prisma.house.create({
      data: { name: m.name, slug: slug(m.name), country: m.country, website: m.website },
    });
    maisonMap.set(m.name, maison.id);
  }
  console.log(`  ✓ ${MAISONS.length} maisons créées`);

  // ── Parfumeurs ────────────────────────────────────────────────────────────
  const parfumeurMap = new Map<string, string>();
  // Parfumeurs du tableau + ceux référencés dans les parfums
  const allPerfumerNames = new Set<string>([
    ...PARFUMEURS.map((p) => p.name),
    ...PARFUMS.flatMap((p) => p.perfumers),
  ]);
  for (const nom of allPerfumerNames) {
    const bio = PARFUMEURS.find((p) => p.name === nom)?.bio;
    const parfumeur = await prisma.perfumer.create({
      data: { name: nom, slug: slug(nom), bio },
    });
    parfumeurMap.set(nom, parfumeur.id);
  }
  console.log(`  ✓ ${allPerfumerNames.size} parfumeurs créés`);

  // ── Parfums ───────────────────────────────────────────────────────────────
  const parfumMap = new Map<string, string>();
  for (const p of PARFUMS) {
    const houseId = maisonMap.get(p.house)!;

    const parfum = await prisma.perfume.create({
      data: {
        name: p.name,
        slug: slug(p.name),
        houseId,
        year: p.year,
        concentration: p.concentration,
        gender: p.gender,
        description: p.description,
        imageUrl: p.imageUrl,
      },
    });
    parfumMap.set(p.name, parfum.id);

    // Parfumeurs
    for (const nomParfumeur of p.perfumers) {
      const perfumerId = parfumeurMap.get(nomParfumeur);
      if (perfumerId) {
        await prisma.perfumerOnPerfume.create({
          data: { perfumeId: parfum.id, perfumerId },
        });
      }
    }

    // Notes de tête
    for (const noteName of p.topNotes) {
      const noteId = noteMap.get(noteName);
      if (noteId) {
        await prisma.noteOnPerfume.create({
          data: { perfumeId: parfum.id, noteId, position: "TOP" },
        });
      }
    }

    // Notes de cœur
    for (const noteName of p.heartNotes) {
      const noteId = noteMap.get(noteName);
      if (noteId) {
        await prisma.noteOnPerfume.create({
          data: { perfumeId: parfum.id, noteId, position: "HEART" },
        });
      }
    }

    // Notes de fond
    for (const noteName of p.baseNotes) {
      const noteId = noteMap.get(noteName);
      if (noteId) {
        await prisma.noteOnPerfume.create({
          data: { perfumeId: parfum.id, noteId, position: "BASE" },
        });
      }
    }

    // Accords
    for (const a of p.accords) {
      const accordId = accordMap.get(a.name);
      if (accordId) {
        await prisma.accordOnPerfume.create({
          data: { perfumeId: parfum.id, accordId, strength: a.strength },
        });
      }
    }
  }
  console.log(`  ✓ ${PARFUMS.length} parfums créés`);

  // ── Utilisateurs ──────────────────────────────────────────────────────────
  const userMap = new Map<string, string>();
  for (const u of UTILISATEURS) {
    const user = await prisma.user.create({
      data: {
        username: u.username,
        name: u.name,
        email: u.email,
        bio: u.bio,
      },
    });
    userMap.set(u.username, user.id);
  }
  console.log(`  ✓ ${UTILISATEURS.length} utilisateurs créés`);

  // ── Follows ───────────────────────────────────────────────────────────────
  const marieId  = userMap.get("marie_delacroix")!;
  const thomasId = userMap.get("thomas_bergmann")!;
  const sofiaId  = userMap.get("sofia_antar")!;

  await prisma.follow.createMany({
    data: [
      { followerId: marieId,  followingId: thomasId },
      { followerId: marieId,  followingId: sofiaId  },
      { followerId: thomasId, followingId: marieId  },
      { followerId: sofiaId,  followingId: thomasId },
    ],
  });
  console.log("  ✓ Follows créés");

  // ── Collections ───────────────────────────────────────────────────────────
  const collections: { username: string; parfum: string; status: "OWNED" | "TRIED" | "WISHLIST" | "DECANT_WANTED" }[] = [
    { username: "marie_delacroix", parfum: "Chanel N°5",          status: "OWNED" },
    { username: "marie_delacroix", parfum: "Twilly d'Hermès",     status: "OWNED" },
    { username: "marie_delacroix", parfum: "Gypsy Water",         status: "TRIED" },
    { username: "marie_delacroix", parfum: "Santal 33",           status: "WISHLIST" },
    { username: "marie_delacroix", parfum: "Rose 31",             status: "WISHLIST" },
    { username: "thomas_bergmann", parfum: "Santal 33",           status: "OWNED" },
    { username: "thomas_bergmann", parfum: "Aventus",             status: "OWNED" },
    { username: "thomas_bergmann", parfum: "Gypsy Water",         status: "OWNED" },
    { username: "thomas_bergmann", parfum: "Mojave Ghost",        status: "OWNED" },
    { username: "thomas_bergmann", parfum: "Chanel N°5",          status: "TRIED" },
    { username: "thomas_bergmann", parfum: "Bleu de Chanel",      status: "TRIED" },
    { username: "sofia_antar",     parfum: "Terre d'Hermès",      status: "OWNED" },
    { username: "sofia_antar",     parfum: "Philosykos",          status: "OWNED" },
    { username: "sofia_antar",     parfum: "Silver Mountain Water",status: "OWNED" },
    { username: "sofia_antar",     parfum: "Aventus",             status: "TRIED" },
    { username: "sofia_antar",     parfum: "Eau des Sens",        status: "WISHLIST" },
  ];
  for (const c of collections) {
    const userId   = userMap.get(c.username)!;
    const perfumeId = parfumMap.get(c.parfum)!;
    if (userId && perfumeId) {
      await prisma.collection.create({ data: { userId, perfumeId, status: c.status } });
    }
  }
  console.log(`  ✓ ${collections.length} entrées de collection créées`);

  // ── Reviews ───────────────────────────────────────────────────────────────
  type ReviewData = {
    username: string;
    parfum: string;
    rating: number;
    longevity: number;
    sillage: number;
    valueForMoney: number;
    seasons: ("SPRING" | "SUMMER" | "AUTUMN" | "WINTER")[];
    occasions: ("OFFICE" | "EVENING" | "SPORT" | "DATE" | "CASUAL")[];
    blindBuy: boolean;
    text: string;
  };

  const reviews: ReviewData[] = [
    {
      username: "marie_delacroix",
      parfum: "Chanel N°5",
      rating: 5,
      longevity: 5,
      sillage: 4,
      valueForMoney: 3,
      seasons: ["AUTUMN", "WINTER"],
      occasions: ["EVENING", "DATE"],
      blindBuy: false,
      text: "La perfection absolue. Chaque fois que je le porte, je me sens invincible. La pyramide florale-aldéhydée est intemporelle. Rien à redire, c'est un chef-d'œuvre.",
    },
    {
      username: "marie_delacroix",
      parfum: "Twilly d'Hermès",
      rating: 4.5,
      longevity: 4,
      sillage: 3,
      valueForMoney: 4,
      seasons: ["SPRING", "SUMMER"],
      occasions: ["CASUAL", "OFFICE"],
      blindBuy: false,
      text: "Le gingembre en tête est une gifle (dans le bon sens). L'iris qui suit est d'une douceur... Le fond musqué-santal est parfait pour les beaux jours. Mon quotidien de printemps.",
    },
    {
      username: "thomas_bergmann",
      parfum: "Santal 33",
      rating: 4,
      longevity: 4,
      sillage: 3,
      valueForMoney: 2,
      seasons: ["AUTUMN", "WINTER", "SPRING"],
      occasions: ["CASUAL", "OFFICE", "DATE"],
      blindBuy: false,
      text: "Oui, tout le monde le porte. Oui, c'est overrated. Mais non, je ne peux pas m'en passer. L'accord cardamome-iris-santal est trop bien trouvé. Prix indécent pour ce que c'est, mais je paie.",
    },
    {
      username: "thomas_bergmann",
      parfum: "Aventus",
      rating: 5,
      longevity: 5,
      sillage: 5,
      valueForMoney: 3,
      seasons: ["SPRING", "SUMMER", "AUTUMN"],
      occasions: ["DATE", "EVENING", "CASUAL"],
      blindBuy: false,
      text: "Mon parfum du quotidien depuis 4 ans. L'ananas fumé du début est juste bluffant. La longevité est criminelle. Les retours que j'ai sont constants. Creed a réussi quelque chose d'unique ici.",
    },
    {
      username: "thomas_bergmann",
      parfum: "Gypsy Water",
      rating: 4.5,
      longevity: 3,
      sillage: 3,
      valueForMoney: 3,
      seasons: ["SPRING", "SUMMER"],
      occasions: ["CASUAL", "DATE"],
      blindBuy: true,
      text: "Blind buy validé à 100%. Le pin et la bergamote en tête donnent quelque chose d'incroyablement frais et naturel. Le fond vanillé-boisé est discret mais là. Manque un peu de projection.",
    },
    {
      username: "sofia_antar",
      parfum: "Terre d'Hermès",
      rating: 5,
      longevity: 5,
      sillage: 4,
      valueForMoney: 5,
      seasons: ["AUTUMN", "WINTER", "SPRING"],
      occasions: ["OFFICE", "CASUAL", "DATE"],
      blindBuy: false,
      text: "Le parfum parfait. Sobre, minimaliste, élégant. L'accord silex-orange-vétiver est une évidence. Jean-Claude Ellena a signé ici quelque chose d'indépassable. Je ne changerai jamais.",
    },
    {
      username: "sofia_antar",
      parfum: "Philosykos",
      rating: 4.5,
      longevity: 4,
      sillage: 3,
      valueForMoney: 4,
      seasons: ["SPRING", "SUMMER"],
      occasions: ["CASUAL"],
      blindBuy: false,
      text: "La Grèce dans un flacon. Le figuier est rendu avec une précision photographique. Notes de lait, de bois sec, de feuilles froissées. On croirait être sous un arbre par une chaude après-midi.",
    },
    {
      username: "sofia_antar",
      parfum: "Silver Mountain Water",
      rating: 4,
      longevity: 3,
      sillage: 3,
      valueForMoney: 3,
      seasons: ["SPRING", "SUMMER"],
      occasions: ["SPORT", "CASUAL"],
      blindBuy: false,
      text: "La fraîcheur à l'état pur. Le thé vert au cœur est une masterclass. Parfait pour les activités outdoor. Seul bémol : la tenue pourrait être meilleure pour le prix.",
    },
  ];

  for (const r of reviews) {
    const userId    = userMap.get(r.username)!;
    const perfumeId = parfumMap.get(r.parfum)!;
    if (userId && perfumeId) {
      await prisma.review.create({
        data: {
          userId,
          perfumeId,
          rating: r.rating,
          longevity: r.longevity,
          sillage: r.sillage,
          valueForMoney: r.valueForMoney,
          seasons: r.seasons,
          occasions: r.occasions,
          blindBuy: r.blindBuy,
          text: r.text,
        },
      });
    }
  }
  console.log(`  ✓ ${reviews.length} reviews créées`);

  // ── Listes ────────────────────────────────────────────────────────────────
  const listHiver = await prisma.list.create({
    data: {
      userId: marieId,
      title: "Mes incontournables d'hiver",
      description: "Les fragrances chaudes et enveloppantes qui m'accompagnent de novembre à mars.",
      isPublic: true,
    },
  });
  await prisma.listItem.createMany({
    data: [
      { listId: listHiver.id, perfumeId: parfumMap.get("Chanel N°5")!,      order: 1 },
      { listId: listHiver.id, perfumeId: parfumMap.get("Twilly d'Hermès")!, order: 2 },
      { listId: listHiver.id, perfumeId: parfumMap.get("Aventus")!,          order: 3 },
    ],
  });

  const listNiche = await prisma.list.create({
    data: {
      userId: thomasId,
      title: "Top niche sous les 300€",
      description: "La crème de la crème accessible. Pas besoin de vendre un rein.",
      isPublic: true,
    },
  });
  await prisma.listItem.createMany({
    data: [
      { listId: listNiche.id, perfumeId: parfumMap.get("Santal 33")!,   order: 1 },
      { listId: listNiche.id, perfumeId: parfumMap.get("Gypsy Water")!, order: 2 },
      { listId: listNiche.id, perfumeId: parfumMap.get("Mojave Ghost")!,order: 3 },
      { listId: listNiche.id, perfumeId: parfumMap.get("Rose 31")!,     order: 4 },
    ],
  });

  const listUnisex = await prisma.list.create({
    data: {
      userId: sofiaId,
      title: "Unisexes qui déchirent",
      description: "Des fragrances qui ne se soucient pas du genre. Juste du beau.",
      isPublic: true,
    },
  });
  await prisma.listItem.createMany({
    data: [
      { listId: listUnisex.id, perfumeId: parfumMap.get("Terre d'Hermès")!,       order: 1 },
      { listId: listUnisex.id, perfumeId: parfumMap.get("Philosykos")!,            order: 2 },
      { listId: listUnisex.id, perfumeId: parfumMap.get("Silver Mountain Water")!, order: 3 },
      { listId: listUnisex.id, perfumeId: parfumMap.get("Gypsy Water")!,           order: 4 },
    ],
  });
  console.log("  ✓ 3 listes créées");

  // ── Résumé ────────────────────────────────────────────────────────────────
  console.log("\n✅ Seed terminé avec succès !\n");
  console.log("  Accords      :", ACCORDS.length);
  console.log("  Notes        :", allNoteNames.size);
  console.log("  Maisons      :", MAISONS.length);
  console.log("  Parfumeurs   :", allPerfumerNames.size);
  console.log("  Parfums      :", PARFUMS.length);
  console.log("  Utilisateurs :", UTILISATEURS.length);
  console.log("  Collections  :", collections.length);
  console.log("  Reviews      :", reviews.length);
  console.log("  Listes       : 3");
}

main()
  .catch((e) => {
    console.error("❌ Erreur seed :", e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
