export async function callLocalLlm(prompt: string): Promise<any> {
    const res = await fetch('http://localhost:11434/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            model: process.env.LLM_MODEL,
            prompt,
            stream: false
        })
    });

    const data = await res.json();

    try {
        return JSON.parse(data.response);
    } catch {
        throw new Error('LLM returned invalid JSON');
    }
}