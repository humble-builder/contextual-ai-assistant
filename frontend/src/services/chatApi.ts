export async function sendMessage(message: string) {
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/chat`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        message,
        userId: "vishal-123", // Replace with actual user ID
      }),
    }
  );

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(errorText);
  }

  return response.json();
}