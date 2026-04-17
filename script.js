import { GoogleGenerativeAI } from "@google/generative-ai";

let history = [];

document.getElementById('startBtn').addEventListener('click', async () => {
    const key = document.getElementById('apiKey').value.trim();
    const topic = document.getElementById('topic').value.trim();
    const btn = document.getElementById('startBtn');

    if (!key || !topic) {
        alert("APIキーとテーマを入力しろ");
        return;
    }

    btn.disabled = true;
    btn.innerText = "考え中...";

    try {
        const genAI = new GoogleGenerativeAI(key);

        const model = genAI.getGenerativeModel({
            model: "gemini-flash-latest"
        });

        const context = history.map(h => `${h.role}: ${h.text}`).join("\n");

        // 肯定
        const resultA = await model.generateContent(`
${context}
あなたは論理的な肯定派です。
テーマ「${topic}」について100文字程度で主張してください。
        `);

        const textA = resultA.response.text();
        addMessage("肯定派", textA, "pro");
        history.push({ role: "肯定派", text: textA });

        // 否定
        const resultB = await model.generateContent(`
${history.map(h => `${h.role}: ${h.text}`).join("\n")}
あなたは鋭い否定派です。
直前の主張「${textA}」に反論してください。
        `);

        const textB = resultB.response.text();
        addMessage("否定派", textB, "con");
        history.push({ role: "否定派", text: textB });

    } catch (error) {
        console.error(error);
        addMessage("システム", error.message, "system");
    } finally {
        btn.disabled = false;
        btn.innerText = "次のターン";
    }
});

function addMessage(role, text, className) {
    const log = document.getElementById('chatLog');

    const div = document.createElement('div');
    div.className = className;
    div.innerHTML = `<strong>${role}:</strong><br>${text}`;

    log.appendChild(div);
    log.scrollTop = log.scrollHeight;
}