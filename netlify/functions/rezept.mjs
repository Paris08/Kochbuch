export default async (req) => {
  try {
    const body = await req.json();
    const { dish, device, category } = body;

    const apiKey = Netlify.env.get("GROQ_API_KEY");
    if (!apiKey) {
      return new Response(JSON.stringify({ error: "Kein API Key" }), {
        status: 500, headers: { "Content-Type": "application/json" },
      });
    }

    const deviceLabels = {
      airfryer: "Air Fryer (Ninja Dual Zone 9.5L mit 2 Fächern übereinander)",
      backofen: "Backofen",
      topf: "Topf / Herd",
    };

    const systemPrompt = `Du bist ein Koch-Assistent. Antworte NUR mit einem validen JSON-Objekt. Kein Text davor oder danach, keine Backticks, kein Markdown, nur reines JSON.

Kochgerät: ${deviceLabels[device] || "Herd"}
Kategorie: ${category === "griechisch" ? "Griechisch" : "Allgemein"}

Antworte exakt in diesem JSON-Format:
{
  "name": "Name des Gerichts",
  "emoji": "passendes Emoji",
  "portionen": "2-3 Portionen",
  "zutaten": ["Zutat 1", "Zutat 2", "Zutat 3"],
  "schritte": ["Schritt 1", "Schritt 2", "Schritt 3"],
  "kochzeit": { "vorbereitung": "10 Min", "kochen": "20 Min", "gesamt": "30 Min" },
  "temperatur": "200°C",
  "ninja_hinweis": "Tipp für Ninja Dual Zone mit 2 Fächern",
  "geraet_hinweis": null,
  "tipp": "Ein hilfreicher Koch-Tipp"
}

Wichtig: Bei Air Fryer immer konkrete Temperatur und Zeit angeben und beide Fächer sinnvoll nutzen.`;

    const groqRes = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "llama-3.3-70b-versatile",
        max_tokens: 1000,
        temperature: 0.7,
        response_format: { type: "json_object" },
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: `Erstelle ein Rezept für: ${dish}` },
        ],
      }),
    });

    const groqData = await groqRes.json();

    if (!groqRes.ok) {
      return new Response(JSON.stringify({ error: groqData.error?.message || "Groq Fehler" }), {
        status: 500, headers: { "Content-Type": "application/json" },
      });
    }

    const text = groqData.choices?.[0]?.message?.content || "";
    
    // JSON extrahieren
    let parsed;
    try {
      parsed = JSON.parse(text);
    } catch {
      const match = text.match(/\{[\s\S]*\}/);
      if (!match) throw new Error("Kein JSON gefunden");
      parsed = JSON.parse(match[0]);
    }

    return new Response(JSON.stringify(parsed), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });

  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
};

export const config = { path: "/api/rezept" };
