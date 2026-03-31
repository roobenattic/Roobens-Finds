export async function POST(request) {
  try {
    const body = await request.json();
    const message = body?.message;

    if (!message) {
      return Response.json({ error: "Message is required" }, { status: 400 });
    }

    const response = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: "gpt-4.1-mini",
        instructions:
          "You are the website assistant for Roobens Finds. Be short, clear, friendly, and helpful. Guide visitors toward the next best step. If they want to work with us, ask for their name, business name, email, phone, and what they need.",
        input: message,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      return Response.json(
        {
          error: "OpenAI request failed",
          details: data?.error?.message || "Unknown API error",
        },
        { status: 500 }
      );
    }

    return Response.json({
      reply: data.output_text || "No response",
    });
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
