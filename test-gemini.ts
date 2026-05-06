import "dotenv/config";

async function testGemini() {
  const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
  const prompt = "Say hi";
  const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: {
        temperature: 0.7,
        responseMimeType: "application/json",
      }
    })
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error("Gemini API Error:", errorText);
    throw new Error("Failed to call Gemini API");
  }

  const data = await response.json() as any;
  let text = data.candidates[0].content.parts[0].text;
  console.log("Raw Response:", text);
}

testGemini();
