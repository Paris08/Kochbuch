import { useState } from "react";

// ─── SMART SEARCH ────────────────────────────────────────────────────────────
function normalize(s) {
  return s.toLowerCase()
    .replace(/ä/g,"ae").replace(/ö/g,"oe").replace(/ü/g,"ue").replace(/ß/g,"ss")
    .replace(/[^a-z0-9 ]/g," ").trim();
}

function score(query, recipe) {
  const q = normalize(query);
  const words = q.split(/\s+/).filter(w => w.length > 2);
  let pts = 0;

  // Exakter Namens-Match
  const rname = normalize(recipe.name);
  if (rname === q) return 1000;
  if (rname.includes(q) || q.includes(rname.split(" ")[0])) pts += 200;

  // Keywords des Rezepts
  for (const kw of recipe.keywords) {
    const nkw = normalize(kw);
    if (q.includes(nkw) || nkw.includes(q)) pts += 80;
    for (const w of words) if (nkw.includes(w) || w.includes(nkw)) pts += 40;
  }

  // Zutaten-Match
  for (const z of recipe.zutaten) {
    const nz = normalize(z);
    for (const w of words) {
      if (nz.includes(w) && w.length > 3) pts += 30;
    }
  }

  // Einzelwort gegen Namen
  for (const w of words) {
    if (rname.includes(w) && w.length > 3) pts += 50;
  }

  return pts;
}

function findBest(query, category) {
  const all = RECIPES.filter(r => category === "alle" || r.kategorie === category);
  const scored = all.map(r => ({ r, s: score(query, r) })).filter(x => x.s > 20);
  scored.sort((a, b) => b.s - a.s);
  return scored.length > 0 ? scored[0].r : null;
}

// ─── REZEPTE ─────────────────────────────────────────────────────────────────
const RECIPES = [
  {
    name: "Fetakäse mit Zwiebeln, Peperoni & Oliven", emoji: "🧀",
    kategorie: "griechisch", portionen: "2 Portionen",
    keywords: ["feta","schafskaese","schafskäse","käse","peperoni","oliven","zwiebeln","feta-pfanne","bouyiourdi","baked feta"],
    zutaten: ["200g Feta (ganzer Block)", "1 rote Zwiebel (in Ringe)", "2-3 Peperoni (in Scheiben)", "10-12 Kalamata-Oliven", "2 EL Olivenöl", "1 TL Oregano", "½ TL Chiliflocken", "Pfeffer"],
    airfryer: { temp: "190°C", vor: "5 Min", koch: "12 Min", gesamt: "17 Min",
      ninja: "Fach 1: Alles in eine kleine Auflaufform – Feta, Zwiebeln, Peperoni, Oliven drauf, Olivenöl drüber. Bei 190°C 12 Min bis der Feta weich und leicht gebräunt ist. Fach 2: Pita-Brot letzte 3 Min aufknuspern." },
    backofen: { temp: "200°C Ober-/Unterhitze", vor: "5 Min", koch: "18 Min", gesamt: "23 Min" },
    topf: { vor: "5 Min", koch: "8 Min", gesamt: "13 Min", hinweis: "In einer kleinen Pfanne mit Deckel bei mittlerer Hitze 8 Min schmoren lassen." },
    schritte: {
      airfryer: ["Feta-Block in eine kleine hitzebeständige Form legen.", "Zwiebeln, Peperoni und Oliven drumherum verteilen.", "Mit Olivenöl beträufeln, Oregano, Chiliflocken und Pfeffer drüber.", "Bei 190°C 12 Min garen bis Feta weich ist.", "Direkt aus der Form mit Pita-Brot servieren."],
      backofen: ["Feta in eine kleine Auflaufform legen.", "Zwiebeln, Peperoni, Oliven rundherum.", "Mit Olivenöl und Gewürzen bestreuen.", "Bei 200°C 18 Min bis der Feta goldbraun ist."],
      topf: ["Olivenöl in einer kleinen Pfanne erhitzen.", "Zwiebeln und Peperoni 3 Min anbraten.", "Feta drauflegen, Oliven und Gewürze dazu.", "Deckel drauf, 8 Min bei mittlerer Hitze."]
    },
    tipp: "Dieses Gericht heißt auf Griechisch 'Bouyiourdi' – serviere es direkt in der Form mit Pita-Brot zum Dippen."
  },
  {
    name: "Gyros", emoji: "🥙",
    kategorie: "griechisch", portionen: "3-4 Portionen",
    keywords: ["gyros","gyro","fleisch","schwein","hähnchen","pita","tzatziki"],
    zutaten: ["600g Schweinehals oder Hähnchen", "3 EL Olivenöl", "1 TL Oregano", "1 TL Paprika", "½ TL Kreuzkümmel", "½ TL Knoblauchpulver", "Salz & Pfeffer", "1 Zitrone (Saft)", "Pita-Brot"],
    airfryer: { temp: "200°C", vor: "10 Min", koch: "18 Min", gesamt: "28 Min",
      ninja: "Fach 1: Fleischstreifen bei 200°C 18 Min, nach 9 Min wenden. Fach 2: Pita-Brote letzte 3 Min aufwärmen. Perfektes Timing!" },
    backofen: { temp: "220°C", vor: "10 Min", koch: "25 Min", gesamt: "35 Min" },
    topf: { vor: "10 Min", koch: "15 Min", gesamt: "25 Min", hinweis: "Pfanne sehr heiß, Fleisch portionsweise scharf anbraten." },
    schritte: {
      airfryer: ["Fleisch in dünne Streifen schneiden.", "Mit allen Gewürzen und Zitronensaft marinieren (mind. 30 Min).", "Air Fryer auf 200°C vorheizen.", "18 Min garen, nach 9 Min wenden.", "Mit Tzatziki und Pita servieren."],
      backofen: ["Fleisch marinieren.", "Auf Backblech bei 220°C 25 Min, nach der Hälfte wenden."],
      topf: ["Fleisch marinieren.", "Öl sehr stark erhitzen, portionsweise scharf anbraten, 15 Min gesamt."]
    },
    tipp: "Über Nacht marinieren für maximalen Geschmack."
  },
  {
    name: "Souvlaki", emoji: "🍢",
    kategorie: "griechisch", portionen: "2-3 Portionen",
    keywords: ["souvlaki","spieß","spieße","grill","hähnchen","schwein","lamm"],
    zutaten: ["500g Fleisch (Schwein oder Hähnchen)", "3 EL Olivenöl", "1 Zitrone", "2 Knoblauchzehen", "1 TL Oregano", "Salz & Pfeffer", "Holzspieße"],
    airfryer: { temp: "200°C", vor: "10 Min", koch: "15 Min", gesamt: "25 Min",
      ninja: "Spieße auf beide Fächer verteilen – doppelte Menge gleichzeitig! Beide bei 200°C 15 Min, nach 7 Min wenden." },
    backofen: { temp: "220°C Grill", vor: "10 Min", koch: "20 Min", gesamt: "30 Min" },
    topf: { vor: "10 Min", koch: "12 Min", gesamt: "22 Min", hinweis: "Grillpfanne für schöne Röststreifen." },
    schritte: {
      airfryer: ["Fleisch in 3cm Würfel schneiden und marinieren.", "Auf gewässerte Holzspieße stecken.", "Bei 200°C 15 Min, nach 7 Min wenden."],
      backofen: ["Spieße auf dem Rost bei 220°C Grill 20 Min, mehrmals wenden."],
      topf: ["Grillpfanne stark erhitzen, Spieße je Seite 3 Min braten."]
    },
    tipp: "Holzspieße 30 Min wässern damit sie nicht verbrennen."
  },
  {
    name: "Moussaka", emoji: "🍆",
    kategorie: "griechisch", portionen: "4-6 Portionen",
    keywords: ["moussaka","aubergine","auberginen","hackfleisch","bechamel","béchamel","überbacken"],
    zutaten: ["2 große Auberginen", "500g Rinderhack", "1 Zwiebel", "2 Knoblauchzehen", "400g Tomaten (Dose)", "1 TL Zimt", "1 TL Oregano", "50g Butter", "50g Mehl", "500ml Milch", "2 Eier", "Salz, Pfeffer, Olivenöl"],
    airfryer: { temp: "180°C", vor: "20 Min", koch: "30 Min", gesamt: "50 Min",
      ninja: "Fach 1: Auberginenscheiben bei 190°C 10 Min vorbraten. Dann alles schichten und bei 180°C 30 Min überbacken." },
    backofen: { temp: "180°C Umluft", vor: "20 Min", koch: "45 Min", gesamt: "65 Min" },
    topf: { vor: "20 Min", koch: "40 Min", gesamt: "60 Min", hinweis: "Als Auberginen-Hack-Eintopf ohne Überbacken." },
    schritte: {
      airfryer: ["Auberginen salzen, 10 Min ziehen lassen, abtrocknen.", "Bei 190°C 10 Min vorbraten.", "Hack mit Zwiebeln, Tomaten, Zimt anbraten.", "Béchamel kochen.", "Alles schichten, bei 180°C 30 Min backen."],
      backofen: ["Auberginen vorbacken bei 200°C 15 Min.", "Hack-Sauce und Béchamel kochen.", "Schichten, bei 180°C 45 Min backen."],
      topf: ["Auberginen anbraten.", "Hack mit Sauce 20 Min köcheln.", "Auberginen zugeben, weitere 10 Min."]
    },
    tipp: "Schmeckt am nächsten Tag aufgewärmt noch besser!"
  },
  {
    name: "Spanakopita", emoji: "🥬",
    kategorie: "griechisch", portionen: "4 Portionen",
    keywords: ["spanakopita","spinat","spinatkuchen","filoteig","filo","spinatpie","pie"],
    zutaten: ["500g Spinat (TK)", "250g Feta", "2 Eier", "1 Zwiebel", "Dill & Petersilie", "8 Blätter Filoteig", "Olivenöl", "Salz & Pfeffer"],
    airfryer: { temp: "175°C", vor: "15 Min", koch: "20 Min", gesamt: "35 Min",
      ninja: "Fach 1 & 2: Dreiecke gleichzeitig bei 175°C 20 Min – extra knusprig!" },
    backofen: { temp: "180°C Umluft", vor: "15 Min", koch: "35 Min", gesamt: "50 Min" },
    topf: { vor: "15 Min", koch: "10 Min", gesamt: "25 Min", hinweis: "Als Spinat-Käse-Pfannkuchen ohne Teig." },
    schritte: {
      airfryer: ["Spinat ausdrücken, Zwiebel anbraten.", "Mit Feta, Eiern, Kräutern mischen.", "Filoteig einpinseln, füllen, zu Dreiecken falten.", "Bei 175°C 20 Min goldbraun backen."],
      backofen: ["Füllung vorbereiten.", "In Auflaufform mit Filoteig auskleiden.", "Bei 180°C 35 Min backen."],
      topf: ["Füllung mischen, kleine Taler formen.", "Je Seite 3-4 Min in der Pfanne braten."]
    },
    tipp: "Filoteig immer mit feuchtem Tuch abdecken – trocknet sonst aus."
  },
  {
    name: "Kleftiko (Lammkeule)", emoji: "🍖",
    kategorie: "griechisch", portionen: "4 Portionen",
    keywords: ["kleftiko","lamm","lammkeule","lammschulter","schmoren"],
    zutaten: ["1,2kg Lammkeule", "6 Knoblauchzehen", "2 Zitronen", "4 EL Olivenöl", "2 TL Oregano", "500g Kartoffeln", "2 Tomaten", "Salz & Pfeffer"],
    airfryer: { temp: "160°C", vor: "15 Min", koch: "60 Min", gesamt: "75 Min",
      ninja: "Fach 1: Lamm in Folie bei 160°C 60 Min. Fach 2: Kartoffeln letzte 25 Min bei 190°C – alles gleichzeitig fertig!" },
    backofen: { temp: "150°C", vor: "15 Min", koch: "180 Min", gesamt: "195 Min" },
    topf: { vor: "15 Min", koch: "120 Min", gesamt: "135 Min", hinweis: "Schmortopf bei niedriger Hitze 2 Std." },
    schritte: {
      airfryer: ["Lamm mit Knoblauch spicken, marinieren.", "In Alufolie einwickeln.", "Bei 160°C 60 Min garen.", "Folie auf, 200°C, 5 Min bräunen."],
      backofen: ["Lamm in Folie einwickeln.", "Bei 150°C 2,5-3 Std.", "Letzte 30 Min aufdecken und bräunen."],
      topf: ["Lamm anbraten, mit Tomaten und Brühe ablöschen.", "Deckel drauf, 2 Std. schmoren."]
    },
    tipp: "Über Nacht marinieren – je länger, desto besser."
  },
  {
    name: "Gemista (Gefüllte Tomaten & Paprika)", emoji: "🫑",
    kategorie: "griechisch", portionen: "4 Portionen",
    keywords: ["gemista","gefüllt","gefüllte tomaten","gefüllte paprika","reis","hackfleisch","gefülltes gemüse"],
    zutaten: ["4 Tomaten", "4 Paprika", "200g Reis", "300g Hackfleisch", "1 Zwiebel", "Petersilie & Minze", "3 EL Olivenöl", "Salz & Pfeffer"],
    airfryer: { temp: "180°C", vor: "15 Min", koch: "30 Min", gesamt: "45 Min",
      ninja: "Fach 1: Tomaten. Fach 2: Paprika. Beide gleichzeitig bei 180°C 30 Min!" },
    backofen: { temp: "180°C Umluft", vor: "15 Min", koch: "60 Min", gesamt: "75 Min" },
    topf: { vor: "15 Min", koch: "35 Min", gesamt: "50 Min", hinweis: "Nebeneinander im Topf mit Deckel garen." },
    schritte: {
      airfryer: ["Gemüse aushöhlen, Füllung vorbereiten.", "Füllen, Deckel drauf.", "Beide Fächer gleichzeitig bei 180°C 30 Min."],
      backofen: ["Füllen, in Auflaufform stellen.", "Etwas Wasser angießen, 60 Min bei 180°C."],
      topf: ["Im großen Topf nebeneinander stellen.", "Wasser angießen, Deckel drauf, 35 Min."]
    },
    tipp: "Fruchtfleisch der Tomaten in die Füllung geben."
  },
  {
    name: "Tiropita (Käsepie)", emoji: "🧀",
    kategorie: "griechisch", portionen: "4 Portionen",
    keywords: ["tiropita","käsepie","feta","ricotta","filoteig","käsekuchen","pie"],
    zutaten: ["300g Feta", "200g Ricotta", "3 Eier", "100ml Milch", "8 Blätter Filoteig", "4 EL Butter", "Pfeffer, Muskat"],
    airfryer: { temp: "170°C", vor: "10 Min", koch: "18 Min", gesamt: "28 Min",
      ninja: "Fach 1 & 2: Gleichzeitig bei 170°C 18 Min goldbraun." },
    backofen: { temp: "180°C Umluft", vor: "10 Min", koch: "30 Min", gesamt: "40 Min" },
    topf: { vor: "10 Min", koch: "12 Min", gesamt: "22 Min", hinweis: "Als kleine Käsepfannkuchen in der Pfanne." },
    schritte: {
      airfryer: ["Feta, Ricotta, Eier, Milch mischen.", "Filoteig einpinseln, füllen, falten.", "Bei 170°C 18 Min backen."],
      backofen: ["In Auflaufform mit Teig auskleiden.", "Füllen, abdecken.", "Bei 180°C 30 Min."],
      topf: ["Laibchen formen, je Seite 3 Min braten."]
    },
    tipp: "Mehrlagiger Filoteig und viel Butter = extra knusprig."
  },
  {
    name: "Tzatziki", emoji: "🥒",
    kategorie: "griechisch", portionen: "4 Portionen",
    keywords: ["tzatziki","joghurt","gurke","knoblauch","dip","sauce"],
    zutaten: ["500g griechischer Joghurt (10%)", "1 große Gurke", "3-4 Knoblauchzehen", "2 EL Olivenöl", "1 EL Weißweinessig", "Dill", "Salz & Pfeffer"],
    airfryer: { temp: "–", vor: "10 Min", koch: "0 Min", gesamt: "10 Min + Kühlen",
      ninja: "Kein Air Fryer nötig! Aber: Pita-Brot in Fach 1 bei 180°C 3 Min aufknuspern." },
    backofen: { temp: "–", vor: "10 Min", koch: "0 Min", gesamt: "10 Min + Kühlen" },
    topf: { vor: "10 Min", koch: "0 Min", gesamt: "10 Min + Kühlen", hinweis: "Nur eine Schüssel nötig, kein Kochen." },
    schritte: {
      airfryer: ["Gurke reiben, fest ausdrücken.", "Knoblauch pressen.", "Alle Zutaten mischen.", "Mindestens 1 Std kühlen."],
      backofen: ["Gurke reiben und ausdrücken.", "Alle Zutaten vermengen, kühlen."],
      topf: ["Gurke reiben und ausdrücken.", "Alles mischen, kalt stellen."]
    },
    tipp: "Gurke WIRKLICH fest ausdrücken – sonst wird's wässrig!"
  },
  {
    name: "Stifado (Rindfleisch-Schmortopf)", emoji: "🥘",
    kategorie: "griechisch", portionen: "4 Portionen",
    keywords: ["stifado","rind","rindfleisch","schmoren","zwiebeln","zimt","rotwein","eintopf"],
    zutaten: ["800g Rindfleisch (Würfel)", "500g Perlzwiebeln oder kleine Zwiebeln", "400g Tomaten (Dose)", "150ml Rotwein", "3 Knoblauchzehen", "1 Zimtstange", "4 Gewürznelken", "Lorbeerblatt", "3 EL Olivenöl", "Salz & Pfeffer"],
    airfryer: { temp: "160°C", vor: "15 Min", koch: "50 Min", gesamt: "65 Min",
      ninja: "Fach 1: Alles in einer Auflaufform bei 160°C 50 Min schmoren. Zwischendurch einmal umrühren." },
    backofen: { temp: "160°C Umluft", vor: "15 Min", koch: "90 Min", gesamt: "105 Min" },
    topf: { vor: "15 Min", koch: "75 Min", gesamt: "90 Min", hinweis: "Der Klassiker – langsam im Schmortopf." },
    schritte: {
      airfryer: ["Fleisch in Olivenöl scharf anbraten (Pfanne).", "Alle Zutaten in eine Auflaufform geben.", "Bei 160°C 50 Min im Air Fryer schmoren.", "Mit Nudeln oder Brot servieren."],
      backofen: ["Fleisch anbraten, alles in einen Schmortopf.", "Bei 160°C 90 Min mit Deckel."],
      topf: ["Fleisch und Zwiebeln anbraten.", "Wein ablöschen, Tomaten und Gewürze dazu.", "75 Min bei niedriger Hitze schmoren."]
    },
    tipp: "Zimtstange ist der Geschmacksschlüssel – nicht weglassen!"
  },
  {
    name: "Schnitzel", emoji: "🥩",
    kategorie: "allgemein", portionen: "2 Portionen",
    keywords: ["schnitzel","wiener","paniert","kalbsschnitzel","schweineschnitzel"],
    zutaten: ["2 Schnitzel (à 180g)", "2 Eier", "100g Semmelbrösel", "50g Mehl", "Salz & Pfeffer", "Öl oder Butterschmalz"],
    airfryer: { temp: "190°C", vor: "5 Min", koch: "16 Min", gesamt: "21 Min",
      ninja: "Fach 1: Schnitzel bei 190°C 16 Min, nach 8 Min wenden. Fach 2: Pommes gleichzeitig bei 200°C 18 Min!" },
    backofen: { temp: "220°C Grill", vor: "5 Min", koch: "20 Min", gesamt: "25 Min" },
    topf: { vor: "5 Min", koch: "8 Min", gesamt: "13 Min", hinweis: "In Butterschmalz schwimmend braten." },
    schritte: {
      airfryer: ["Klopfen, würzen, panieren.", "Bei 190°C 16 Min, nach 8 Min wenden."],
      backofen: ["Panieren, auf Blech bei 220°C Grill 20 Min."],
      topf: ["In heißem Butterschmalz je Seite 3-4 Min."]
    },
    tipp: "Schwimmendes Fett in der Pfanne = echtes Wiener Schnitzel."
  },
  {
    name: "Lachs", emoji: "🐟",
    kategorie: "allgemein", portionen: "2 Portionen",
    keywords: ["lachs","lachsfilet","fisch","salmon","lachssteak"],
    zutaten: ["2 Lachsfilets (à 180g)", "1 Zitrone", "2 EL Olivenöl", "Dill", "Knoblauchpulver", "Salz & Pfeffer"],
    airfryer: { temp: "180°C", vor: "3 Min", koch: "12 Min", gesamt: "15 Min",
      ninja: "Fach 1: Lachs bei 180°C 12 Min – nicht wenden! Fach 2: Gemüse gleichzeitig." },
    backofen: { temp: "200°C Umluft", vor: "5 Min", koch: "18 Min", gesamt: "23 Min" },
    topf: { vor: "3 Min", koch: "8 Min", gesamt: "11 Min", hinweis: "Haut nach unten anfangen." },
    schritte: {
      airfryer: ["Lachs würzen.", "Bei 180°C 12 Min (kein Wenden)."],
      backofen: ["In Folie einwickeln, bei 200°C 18 Min."],
      topf: ["Haut nach unten 5 Min, wenden, weitere 3 Min."]
    },
    tipp: "Fertig wenn er sich leicht trennen lässt."
  },
  {
    name: "Hähnchenbrust", emoji: "🍗",
    kategorie: "allgemein", portionen: "2 Portionen",
    keywords: ["hähnchen","haehnchen","huhn","chicken","hühnchen","hühnerbrust","hähnchenbrust"],
    zutaten: ["2 Hähnchenbrüste", "2 EL Olivenöl", "1 TL Paprika", "1 TL Knoblauchpulver", "½ TL Oregano", "Salz & Pfeffer", "1 Zitrone"],
    airfryer: { temp: "190°C", vor: "5 Min", koch: "18 Min", gesamt: "23 Min",
      ninja: "Fach 1: Hähnchen bei 190°C 18 Min. Fach 2: Gemüse bei 180°C 15 Min – gleichzeitig fertig!" },
    backofen: { temp: "200°C", vor: "5 Min", koch: "25 Min", gesamt: "30 Min" },
    topf: { vor: "5 Min", koch: "14 Min", gesamt: "19 Min", hinweis: "Scharf anbraten, dann mit Deckel fertig garen." },
    schritte: {
      airfryer: ["Hähnchen würzen.", "Bei 190°C 18 Min, nach 9 Min wenden."],
      backofen: ["Würzen, bei 200°C 25 Min."],
      topf: ["Je Seite 3 Min scharf anbraten, dann 8 Min mit Deckel."]
    },
    tipp: "5 Min ruhen lassen nach dem Garen – bleibt saftiger."
  },
  {
    name: "Burger", emoji: "🍔",
    kategorie: "allgemein", portionen: "2 Portionen",
    keywords: ["burger","hamburger","patty","hackfleisch","rindfleisch"],
    zutaten: ["400g Rinderhack (20% Fett)", "2 Burgerbuns", "2 Scheiben Cheddar", "Salat, Tomate, Zwiebel", "Senf, Ketchup, Mayo", "Salz & Pfeffer"],
    airfryer: { temp: "200°C", vor: "5 Min", koch: "12 Min", gesamt: "17 Min",
      ninja: "Fach 1: Patties bei 200°C 12 Min. Fach 2: Pommes gleichzeitig – perfektes Timing!" },
    backofen: { temp: "220°C Grill", vor: "5 Min", koch: "15 Min", gesamt: "20 Min" },
    topf: { vor: "5 Min", koch: "8 Min", gesamt: "13 Min", hinweis: "Grillpfanne sehr heiß für schöne Streifen." },
    schritte: {
      airfryer: ["Patties formen, würzen.", "Bei 200°C 12 Min, nach 6 Min wenden + Käse drauf."],
      backofen: ["Auf Blech bei 220°C Grill 15 Min."],
      topf: ["In heißer Grillpfanne je Seite 3-4 Min."]
    },
    tipp: "Hack nicht zu viel kneten – macht die Patties zäh."
  },
  {
    name: "Pommes Frites", emoji: "🍟",
    kategorie: "allgemein", portionen: "2-3 Portionen",
    keywords: ["pommes","frites","fritten","kartoffelstäbchen","chips","kartoffeln"],
    zutaten: ["600g Kartoffeln (festkochend)", "2 EL Olivenöl", "1 TL Paprika", "Salz"],
    airfryer: { temp: "200°C", vor: "5 Min", koch: "20 Min", gesamt: "25 Min",
      ninja: "Kartoffeln auf beide Fächer – doppelte Menge gleichzeitig bei 200°C 20 Min!" },
    backofen: { temp: "220°C Umluft", vor: "5 Min", koch: "35 Min", gesamt: "40 Min" },
    topf: { vor: "10 Min", koch: "6 Min", gesamt: "16 Min", hinweis: "Frittieren bei 170°C." },
    schritte: {
      airfryer: ["Schneiden, 10 Min einweichen, abtrocknen.", "Mit Öl und Salz mischen.", "Bei 200°C 20 Min, nach 10 Min schütteln."],
      backofen: ["Schneiden, einweichen, trocknen, würzen.", "Bei 220°C 35 Min, nach 20 Min wenden."],
      topf: ["Bei 170°C portionsweise 5-6 Min frittieren."]
    },
    tipp: "Einweichen entfernt die Stärke – macht sie knuspriger."
  },
  {
    name: "Pasta Arrabbiata", emoji: "🍝",
    kategorie: "allgemein", portionen: "2 Portionen",
    keywords: ["pasta","nudeln","arrabbiata","spaghetti","penne","tomaten","chili","nudel"],
    zutaten: ["300g Penne", "400g Tomaten (Dose)", "3 Knoblauchzehen", "1 Chilischote", "3 EL Olivenöl", "Petersilie", "Parmesan", "Salz & Pfeffer"],
    airfryer: { temp: "–", vor: "5 Min", koch: "15 Min", gesamt: "20 Min",
      ninja: "Sauce im Topf, aber Knoblauchbrot in Fach 1 bei 180°C 4 Min toasten!" },
    backofen: { temp: "200°C", vor: "5 Min", koch: "20 Min", gesamt: "25 Min" },
    topf: { vor: "5 Min", koch: "15 Min", gesamt: "20 Min", hinweis: "Klassisch – beste Methode für Pasta." },
    schritte: {
      airfryer: ["Pasta im Topf kochen.", "Sauce in der Pfanne, mit Pasta mischen."],
      backofen: ["Pasta kochen, Sauce machen.", "In Auflaufform mit Parmesan bei 200°C 20 Min."],
      topf: ["Pasta kochen. Knoblauch+Chili in Öl anbraten.", "Tomaten dazu, 10 Min köcheln. Pasta dazu."]
    },
    tipp: "Etwas Kochwasser zur Sauce – macht sie sämiger."
  },
  {
    name: "Tomatensuppe", emoji: "🍲",
    kategorie: "allgemein", portionen: "4 Portionen",
    keywords: ["suppe","tomatensuppe","tomaten","püree","cremesuppe"],
    zutaten: ["800g Tomaten (Dose)", "1 Zwiebel", "3 Knoblauchzehen", "500ml Gemüsebrühe", "2 EL Olivenöl", "Basilikum", "Sahne", "Salz & Pfeffer"],
    airfryer: { temp: "–", vor: "5 Min", koch: "20 Min", gesamt: "25 Min",
      ninja: "Suppe im Topf. Crostini in Fach 1 bei 180°C 5 Min rösten!" },
    backofen: { temp: "200°C", vor: "5 Min", koch: "40 Min", gesamt: "45 Min" },
    topf: { vor: "5 Min", koch: "20 Min", gesamt: "25 Min", hinweis: "Ideal im Topf." },
    schritte: {
      airfryer: ["Suppe im Topf kochen, Crostini im Air Fryer."],
      backofen: ["Tomaten bei 200°C 30 Min rösten, dann pürieren."],
      topf: ["Zwiebeln anbraten, Tomaten+Brühe dazu, 20 Min köcheln, pürieren."]
    },
    tipp: "Tomaten rösten gibt tieferen Geschmack."
  },
  {
    name: "Risotto", emoji: "🍚",
    kategorie: "allgemein", portionen: "2-3 Portionen",
    keywords: ["risotto","reis","arborio","parmesan","weißwein"],
    zutaten: ["300g Arborio-Reis", "1L warme Brühe", "1 Zwiebel", "150ml Weißwein", "50g Parmesan", "2 EL Butter", "Olivenöl", "Salz & Pfeffer"],
    airfryer: { temp: "–", vor: "5 Min", koch: "22 Min", gesamt: "27 Min",
      ninja: "Risotto im Topf. Topping (Pilze/Garnelen) im Air Fryer bei 190°C 8 Min!" },
    backofen: { temp: "180°C", vor: "5 Min", koch: "30 Min", gesamt: "35 Min" },
    topf: { vor: "5 Min", koch: "22 Min", gesamt: "27 Min", hinweis: "Der einzig wahre Weg für Risotto." },
    schritte: {
      airfryer: ["Risotto im Topf kochen, Topping im Air Fryer."],
      backofen: ["Zwiebeln anbraten, Reis rösten, Wein+Brühe dazu.", "Bei 180°C 25 Min mit Deckel, dann Parmesan einrühren."],
      topf: ["Zwiebeln anbraten, Reis rösten.", "Wein ablöschen, Brühe kellenweise zugeben.", "22 Min rühren, Parmesan+Butter einrühren."]
    },
    tipp: "Brühe immer warm halten und kellenweise zugeben!"
  },
];

// ─── COMPONENTS ──────────────────────────────────────────────────────────────
const DEVICES = [
  { id: "airfryer", label: "Air Fryer", icon: "💨", desc: "Ninja 9.5L Dual Zone" },
  { id: "backofen", label: "Backofen", icon: "🔥", desc: "Klassisch" },
  { id: "topf", label: "Topf / Herd", icon: "🫕", desc: "Kochen & Schmoren" },
];
const CATEGORIES = [
  { id: "griechisch", label: "Griechische Rezepte", icon: "🇬🇷" },
  { id: "allgemein", label: "Allgemeine Gerichte", icon: "🌍" },
];
const SUGG = {
  griechisch: ["Gyros","Souvlaki","Moussaka","Feta mit Peperoni","Kleftiko","Stifado","Tiropita","Tzatziki"],
  allgemein: ["Schnitzel","Lachs","Hähnchen","Burger","Pommes","Pasta","Suppe","Risotto"],
};

export default function App() {
  const [device, setDevice] = useState("airfryer");
  const [category, setCategory] = useState("griechisch");
  const [input, setInput] = useState("");
  const [recipe, setRecipe] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  async function search(dish) {
    if (!dish.trim()) return;
    setLoading(true);
    setError(null);
    setRecipe(null);
    try {
      const res = await fetch("/api/rezept", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ dish: dish.trim(), device, category }),
      });
      const data = await res.json();
      if (!res.ok || data.error) throw new Error(data.error || "Fehler");
      setRecipe(data);
    } catch (e) {
      setError("Rezept konnte nicht geladen werden: " + e.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={S.root}>
      <div style={S.bg} />
      <header style={S.header}>
        <div style={S.hi}>
          <span style={{ fontSize: 40 }}>🏺</span>
          <div>
            <div style={S.logoTitle}>Kouzína</div>
            <div style={S.logoSub}>Dein griechischer Koch-Assistent</div>
          </div>
        </div>
      </header>

      <main style={S.main}>
        <div style={S.cg}>
          <div style={S.lbl}>Kategorie</div>
          <div style={S.row}>
            {CATEGORIES.map(c => (
              <button key={c.id}
                style={{ ...S.catBtn, ...(category === c.id ? S.catOn : {}) }}
                onClick={() => { setCategory(c.id); setRecipe(null); setNotFound(false); }}>
                {c.icon} {c.label}
              </button>
            ))}
          </div>
        </div>

        <div style={S.cg}>
          <div style={S.lbl}>Kochgerät</div>
          <div style={S.row}>
            {DEVICES.map(d => (
              <button key={d.id}
                style={{ ...S.devBtn, ...(device === d.id ? S.devOn : {}) }}
                onClick={() => setDevice(d.id)}>
                <div style={{ fontSize: 22 }}>{d.icon}</div>
                <div style={S.devName}>{d.label}</div>
                <div style={S.devDesc}>{d.desc}</div>
              </button>
            ))}
          </div>
        </div>

        <div style={S.sw}>
          <input style={S.inp}
            placeholder={`Gericht oder Zutaten eingeben… z.B. "Feta Peperoni Oliven"`}
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === "Enter" && search(input)} />
          <button style={S.sbtn} onClick={() => search(input)}>→</button>
        </div>

        <div style={S.pills}>
          {SUGG[category].map(s => (
            <button key={s} style={S.pill} onClick={() => { setInput(s); search(s); }}>{s}</button>
          ))}
        </div>

        {loading && (
          <div style={{ textAlign: "center", padding: "50px 20px" }}>
            <div style={{ fontSize: 48, marginBottom: 12 }}>🍳</div>
            <div style={{ color: "#1a3a5c", fontSize: 16, opacity: 0.7, fontFamily: "'Playfair Display', Georgia, serif" }}>Rezept wird zubereitet…</div>
          </div>
        )}

        {error && (
          <div style={{ background: "#fff3f3", border: "1px solid #e57373", borderRadius: 8, padding: "14px 18px", color: "#c62828", marginBottom: 16, fontSize: 14 }}>
            ⚠️ {error}
          </div>
        )}

        {recipe && !loading && <RecipeCard recipe={recipe} device={device} />}
      </main>
    </div>
  );
}

function RecipeCard({ recipe, device }) {
  const d = recipe[device];
  const steps = recipe.schritte[device];
  const stats = [
    { icon: "⏱", label: "Vorbereitung", val: d.vor },
    { icon: "🔥", label: "Kochen", val: d.koch },
    { icon: "⌛", label: "Gesamt", val: d.gesamt, hi: true },
    (d.temp && d.temp !== "–") ? { icon: "🌡", label: "Temperatur", val: d.temp, hi: true } : null,
  ].filter(Boolean);

  return (
    <div style={S.card}>
      <div style={S.ch}>
        <span style={{ fontSize: 46 }}>{recipe.emoji}</span>
        <div>
          <div style={S.cn}>{recipe.name}</div>
          <div style={S.cp}>{recipe.portionen}</div>
        </div>
      </div>

      <div style={S.sr}>
        {stats.map((s, i) => (
          <div key={i} style={{ ...S.stat, ...(s.hi ? S.shi : {}) }}>
            <div>{s.icon}</div>
            <div style={S.sv}>{s.val || "–"}</div>
            <div style={S.sl}>{s.label}</div>
          </div>
        ))}
      </div>

      {device === "airfryer" && d.ninja && (
        <div style={S.hbox}>
          <span style={{ fontSize: 22, flexShrink: 0 }}>💨</span>
          <div>
            <div style={{ fontWeight: "bold", color: BLUE, fontSize: 13, marginBottom: 3 }}>Ninja Dual Zone Tipp</div>
            <div style={S.ht}>{d.ninja}</div>
          </div>
        </div>
      )}
      {device !== "airfryer" && d.hinweis && (
        <div style={{ ...S.hbox, background: "rgba(26,58,92,0.05)", border: "1px solid rgba(26,58,92,0.15)" }}>
          <span style={{ fontSize: 22, flexShrink: 0 }}>💡</span>
          <div style={S.ht}>{d.hinweis}</div>
        </div>
      )}

      <div style={S.tc}>
        <div style={S.col}>
          <div style={S.colt}>🫒 Zutaten</div>
          {recipe.zutaten.map((z, i) => (
            <div key={i} style={S.zutat}><span style={{ color: GOLD, fontWeight: "bold", flexShrink: 0 }}>·</span>{z}</div>
          ))}
        </div>
        <div style={{ ...S.col, borderRight: "none" }}>
          <div style={S.colt}>📋 Zubereitung</div>
          {steps.map((s, i) => (
            <div key={i} style={S.step}>
              <span style={S.snum}>{i + 1}</span><span>{s}</span>
            </div>
          ))}
        </div>
      </div>

      {recipe.tipp && (
        <div style={S.tipp}>💡 <strong>Tipp:</strong> {recipe.tipp}</div>
      )}
    </div>
  );
}

const BLUE = "#1a3a5c", GOLD = "#c8a84b", CREAM = "#faf6ee", W = "#ffffff";
const S = {
  root: { minHeight: "100vh", background: CREAM, fontFamily: "'Playfair Display', Georgia, serif", position: "relative" },
  bg: { position: "fixed", inset: 0, backgroundImage: "radial-gradient(circle at 10% 20%,rgba(200,168,75,.08) 0%,transparent 50%),radial-gradient(circle at 90% 80%,rgba(26,58,92,.08) 0%,transparent 50%)", pointerEvents: "none", zIndex: 0 },
  header: { background: BLUE, borderBottom: `3px solid ${GOLD}`, position: "relative", zIndex: 1 },
  hi: { maxWidth: 860, margin: "0 auto", padding: "18px 24px", display: "flex", alignItems: "center", gap: 14 },
  logoTitle: { fontSize: 26, color: GOLD, fontWeight: "bold", letterSpacing: 2 },
  logoSub: { color: "rgba(255,255,255,.55)", fontSize: 12, letterSpacing: 1 },
  main: { maxWidth: 860, margin: "0 auto", padding: "28px 20px 60px", position: "relative", zIndex: 1 },
  cg: { marginBottom: 20 },
  lbl: { fontSize: 11, textTransform: "uppercase", letterSpacing: 2, color: BLUE, fontWeight: "bold", opacity: .6, marginBottom: 8 },
  row: { display: "flex", flexWrap: "wrap", gap: 8 },
  catBtn: { padding: "8px 18px", border: `2px solid ${BLUE}`, borderRadius: 6, background: W, color: BLUE, cursor: "pointer", fontSize: 13, fontFamily: "'Playfair Display', Georgia, serif" },
  catOn: { background: BLUE, color: W },
  devBtn: { padding: "10px 18px", border: "2px solid rgba(26,58,92,.2)", borderRadius: 8, background: W, cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center", gap: 2, minWidth: 110 },
  devOn: { border: `2px solid ${GOLD}`, background: "rgba(200,168,75,.08)", boxShadow: "0 2px 12px rgba(200,168,75,.2)" },
  devName: { fontSize: 13, fontWeight: "bold", color: BLUE },
  devDesc: { fontSize: 10, color: "#888" },
  sw: { display: "flex", border: `2px solid ${BLUE}`, borderRadius: 10, overflow: "hidden", boxShadow: "0 4px 20px rgba(26,58,92,.1)", background: W, marginBottom: 12 },
  inp: { flex: 1, padding: "15px 20px", border: "none", outline: "none", fontSize: 16, fontFamily: "'Playfair Display', Georgia, serif", color: BLUE, background: "transparent" },
  sbtn: { padding: "0 26px", background: BLUE, color: GOLD, border: "none", fontSize: 22, cursor: "pointer", fontWeight: "bold" },
  pills: { display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 16 },
  pill: { padding: "5px 14px", border: `1px solid ${GOLD}`, borderRadius: 20, background: "rgba(200,168,75,.08)", color: BLUE, fontSize: 13, cursor: "pointer", fontFamily: "'Playfair Display', Georgia, serif" },
  nf: { background: "#fff8e1", border: `1px solid ${GOLD}`, borderRadius: 8, padding: "14px 18px", color: "#7a5c00", fontSize: 14, marginBottom: 16 },
  card: { background: W, borderRadius: 14, border: "1px solid rgba(200,168,75,.35)", boxShadow: "0 8px 40px rgba(26,58,92,.1)", overflow: "hidden", marginTop: 8 },
  ch: { background: BLUE, padding: "22px 28px", display: "flex", alignItems: "center", gap: 16, borderBottom: `3px solid ${GOLD}` },
  cn: { fontSize: 24, color: W, fontWeight: "bold", letterSpacing: .5 },
  cp: { color: GOLD, fontSize: 13, marginTop: 4 },
  sr: { display: "flex", flexWrap: "wrap", borderBottom: "1px solid rgba(200,168,75,.2)" },
  stat: { flex: "1 1 80px", padding: 16, textAlign: "center", borderRight: "1px solid rgba(200,168,75,.2)", fontSize: 18 },
  shi: { background: "rgba(200,168,75,.07)" },
  sv: { fontSize: 15, fontWeight: "bold", color: BLUE, marginTop: 3 },
  sl: { fontSize: 10, color: "#888", textTransform: "uppercase", letterSpacing: 1, marginTop: 2 },
  hbox: { display: "flex", gap: 12, alignItems: "flex-start", background: "rgba(200,168,75,.08)", border: "1px solid rgba(200,168,75,.3)", borderRadius: 8, padding: "12px 16px", margin: "16px 20px 0" },
  ht: { color: "#444", fontSize: 13, lineHeight: 1.5 },
  tc: { display: "grid", gridTemplateColumns: "1fr 1fr", padding: "20px 0" },
  col: { padding: "0 24px", borderRight: "1px solid rgba(200,168,75,.2)" },
  colt: { fontSize: 13, fontWeight: "bold", color: BLUE, textTransform: "uppercase", letterSpacing: 1.5, marginBottom: 14, paddingBottom: 8, borderBottom: `2px solid ${GOLD}` },
  zutat: { display: "flex", gap: 8, padding: "5px 0", fontSize: 14, color: "#333", lineHeight: 1.4 },
  step: { display: "flex", gap: 10, fontSize: 14, color: "#333", lineHeight: 1.5, marginBottom: 10 },
  snum: { background: BLUE, color: GOLD, borderRadius: "50%", width: 22, height: 22, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: "bold", flexShrink: 0, marginTop: 1 },
  tipp: { margin: "0 20px 20px", background: "rgba(200,168,75,.1)", border: "1px solid rgba(200,168,75,.3)", borderRadius: 8, padding: "12px 16px", fontSize: 13, color: "#555", lineHeight: 1.5 },
};
