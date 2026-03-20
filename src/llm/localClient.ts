export async function callLocalLlm(prompt: string): Promise<any> {
    const maxRetries = 3;
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
            const res = await fetch('http://localhost:11434/api/generate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    model: process.env.LLM_MODEL,
                    prompt,
                    stream: false,
                    format: 'json'
                })
            });

            const data = await res.json();

            try {
                return JSON.parse(data.response);
            } catch (parseError) {
                console.error(`LLM JSON Parse Error (Attempt ${attempt}):\nRaw Response:`, data.response);
                if (attempt === maxRetries) {
                    throw new Error('LLM returned invalid JSON');
                }
            }
        } catch (fetchError) {
            console.error(`LLM Fetch Error (Attempt ${attempt}):`, fetchError);
            if (attempt === maxRetries) {
                throw new Error('LLM request failed');
            }
        }
    }
}