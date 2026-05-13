export default async (req) => {
  const { dish, device, category } = await req.json();

  const apiKey = Netlify.env.get("GROQ_API_KEY");

  const deviceLabels = {
    airfryer: "Air Fryer (Ninja Dual Zone 9.5L mit 2 Fächern übereinander)",
    backofen: "Backofen",
    topf: "Topf / Herd",
  };

  const systemPrompt = `Du bist ein Koch-Assistent. Antworte NUR mit einem validen JSON-Objekt, kein Text davor oder danach, keine Backticks, kein Markdown.

Kochgerät: ${deviceLabels[device] || device}
Kategorie: ${category === "griechisch" ? "Griechisch" : "Allgemein"}

JSON-Format (exakt so):
{
  "name": "Name des Gerichts",
  "emoji": "passendes Emoji",
  "portionen": "2-3 Portionen",
  "zutaten": ["Zutat 1", "Zutat 2"],
  "schritte": ["Schritt 1", "Schritt 2"],
  "kochzeit": { "vorbereitung": "10 Min", "kochen": "20 Min", "gesamt": "30 Min" },
  "temperatur": "200°C oder null wenn nicht relevant",
  "ninja_hinweis": "Tipp speziell für Ninja Dual Zone mit 2 Fächern wenn airfryer gewählt, sonst null",
  "geraet_hinweis": "Hinweis zum Gerät wenn backofen oder topf, sonst null",
  "tipp": "Ein hilfreicher Koch-Tipp"
}

Passe alles ans Kochgerät an. Bei Air Fryer: konkrete Grad und Minuten, beide Fächer sinnvoll nutzen.
Bei griechisch: authentische griechische Rezepte.`;

  const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: "llama-3.3-70b-versatile",
      max_tokens: 1000,
      temperature: 0.7,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: `Rezept für: ${dish}` },
      ],
    }),
  });

  const data = await response.json();

  if (!response.ok) {
    return new Response(JSON.stringify({ error: data.error?.message || "Groq Fehler" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }

  const text = data.choices?.[0]?.message?.content || "";
  const match = text.match(/\{[\s\S]*\}/);

  if (!match) {
    return new Response(JSON.stringify({ error: "Kein JSON in Antwort" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }

  return new Response(match[0], {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
};

export const config = {
  path: "/api/rezept",
};
