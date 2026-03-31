export async function POST(request) {
  try {
    const body = await request.json();
    const message = body?.message;

    if (!message) {
      return Response.json({ error: "Message is required" }, { status: 400 });
    }

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
            role: "user",
            content: message,
          },
        ],
        instructions:
          "You are the website assistant for Roobens Finds. Be short, clear, friendly, and helpful. For the first reply, keep it short and ask only one simple question. If the visitor wants to work with us or asks for help, pricing, a sample, or contact, politely collect these details one at a time: name, business name, email, phone, and what they need."
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

    const lowerMessage = message.toLowerCase();

    const looksLikeLead =
      lowerMessage.includes("my name is") ||
      lowerMessage.includes("business") ||
      lowerMessage.includes("email") ||
      lowerMessage.includes("phone") ||
      lowerMessage.includes("i need") ||
      lowerMessage.includes("i want to work with you") ||
      lowerMessage.includes("contact me") ||
      lowerMessage.includes("quote") ||
      lowerMessage.includes("pricing");

    if (looksLikeLead) {
      await fetch("https://script.google.com/macros/s/AKfycbwIZAX2EWOCZq25r4LUg46GQlc_f0GYzoiX4hyB976huYkj13DXZZDqYsiH5gMZkLae/exec", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: "",
          business: "",
          email: "",
          phone: "",
          need: message,
        }),
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
