export async function POST(request) {
  try {
    const body = await request.json();
  const message = body?.message;
const history = Array.isArray(body?.history) ? body.history : [];
const currentPage = body?.currentPage || "/";
    if (!message) {
      return Response.json({ error: "Message is required" }, { status: 400 });
    }

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
  content: `
You are the website assistant for Roobens Finds.

Be short, clear, warm, and professional.

Important rules:
- Do NOT restart the conversation if context exists.
- Do NOT repeat greetings.
- Remember what the user already said.
- Move the conversation forward naturally.

Page awareness:
The user is currently on: ${currentPage}

Behavior:
- If on "/tools": focus on tools, features, and benefits.
- If on "/contact": guide the user to contact or submit info.
- If on "/about": explain the brand and purpose.
- Otherwise: stay general and helpful.

Always adapt your answer based on the page.
},
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
