export async function POST(request) {
  try {
    const body = await request.json();
    const message = body?.message;
    const history = Array.isArray(body?.history) ? body.history : [];
    const currentPage = body?.currentPage || "/";

    if (!message) {
      return Response.json({ error: "Message is required" }, { status: 400 });
    }

    const pageContextMap = {
      "/": "The visitor is on the homepage. Stay general and help them understand the offer.",
      "/tools": "The visitor is on the tools page. Focus on tools, features, benefits, and how to get started.",
      "/contact": "The visitor is on the contact page. Guide them toward contacting us or sharing what they need.",
      "/about": "The visitor is on the about page. Explain the brand, purpose, and who this is for.",
      "/finds": "The visitor is on the finds page. Focus on curated finds and recommendations.",
      "/product": "The visitor is on the product page. Focus on the product and next-step questions."
    };

    const pageContext =
      pageContextMap[currentPage] ||
      `The visitor is on the page "${currentPage}". Adapt naturally to that page.`;

    const formattedHistory = history.map((item) => ({
      role: item.sender === "Bot" ? "assistant" : "user",
      content: item.text,
    }));

    const openaiResponse = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: "gpt-4.1-mini",
        input: [
          {
            role: "system",
            content:
              "You are the website assistant for Roobens Finds. Be short, clear, warm, and professional. Do not restart the conversation if context already exists. Do not repeat greetings after the first message. Remember what the visitor already said. Do not ask the same question again if they already answered it. Move the conversation forward naturally. Keep replies concise. " +
              pageContext,
          },
          ...formattedHistory,
          {
            role: "user",
            content: message,
          },
        ],
      }),
    });

    const data = await openaiResponse.json();

    if (!openaiResponse.ok) {
      return Response.json(
        {
          error: "OpenAI request failed",
          details: data?.error?.message || "Unknown API error",
        },
        { status: 500 }
      );
    }

    const reply =
      data?.output
        ?.filter((item) => item.type === "message")
        ?.flatMap((item) => item.content || [])
        ?.filter((content) => content.type === "output_text")
        ?.map((content) => content.text)
        ?.join("\n")
        ?.trim() || "No response";

    const fullText = message.toLowerCase();
    const hasEmail = fullText.includes("@");
    const hasPhone = /\d{3}.*\d{3}.*\d{4}/.test(fullText);

    if (hasEmail || hasPhone) {
      const sheetResponse = await fetch(
        "https://script.google.com/macros/s/AKfycbwIZAX2EWOCZq25r4LUg46GQlc_f0GYzoiX4hyB976huYkj13DXZZDqYsiH5gMZkLae/exec",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name: "",
            business: "",
            email: hasEmail ? message : "",
            phone: hasPhone ? message : "",
            need: message,
          }),
        }
      );

      const sheetText = await sheetResponse.text();

      return Response.json({
        reply,
        sheetDebug: sheetText,
      });
    }

    return Response.json({ reply });
  } catch (error) {
    return Response.json(
      {
        error: "Something went wrong",
        details: error?.message || "Unknown error",
      },
      { status: 500 }
    );
  }
}
