export async function sendMessage(
  message: string,
  session: { sessionId: string; sessionCreatedAt: number },
  conversationId?: string | null
) {
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/chat/create`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        message,
        userId: "vishal-123",
        sessionId: session.sessionId,
        sessionCreatedAt: session.sessionCreatedAt,
        conversationId
      }),
    }
  );

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(errorText);
  }

  return response.json();
}

export async function fetchChatHistory() {
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/chat/history?userId=vishal-123`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      }
    }
  );

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(errorText);
  }

  return response.json();
}