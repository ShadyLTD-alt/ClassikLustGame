
import fetch from 'node-fetch';

interface MistralConfig {
  apiKey: string;
  model: string;
  debugModel: string;
}

interface DebugRequest {
  code: string;
  error: string;
  context?: string;
}

interface ChatRequest {
  message: string;
  characterId: string;
  conversationHistory?: Array<{ role: 'user' | 'assistant'; content: string }>;
  characterPersonality?: string;
}

class MistralService {
  private config: MistralConfig;
  private enabled: boolean = false;

  constructor() {
    this.config = {
      apiKey: process.env.MISTRAL_API_KEY || '',
      model: 'mistral-small-latest',
      debugModel: 'codestral-latest'
    };
  }

  setEnabled(enabled: boolean) {
    this.enabled = enabled;
  }

  isEnabled(): boolean {
    return this.enabled && !!this.config.apiKey;
  }

  async debugAssist(request: DebugRequest): Promise<string> {
    if (!this.isEnabled()) {
      return 'MistralAI debug assistant is not enabled or configured.';
    }

    const prompt = `You are a helpful debugging assistant for a TypeScript/React game application.

Code with issue:
\`\`\`
${request.code}
\`\`\`

Error message:
${request.error}

${request.context ? `Additional context: ${request.context}` : ''}

Please provide:
1. An explanation of what's causing the error
2. A specific fix for the code
3. Best practices to prevent similar issues

Keep your response concise and actionable.`;

    try {
      const response = await this.callMistralAPI(prompt, this.config.debugModel);
      return response;
    } catch (error) {
      console.error('Mistral debug assist error:', error);
      return 'Unable to get debug assistance at this time.';
    }
  }

  async generateChatResponse(request: ChatRequest): Promise<string> {
    if (!this.isEnabled()) {
      return 'I understand! Thanks for talking with me.'; // Fallback response
    }

    const historyContext = request.conversationHistory
      ? request.conversationHistory.slice(-10).map(msg => `${msg.role}: ${msg.content}`).join('\n')
      : '';

    const prompt = `You are roleplaying as a character in an anime-style game. 

Character personality: ${request.characterPersonality || 'friendly and engaging'}

Recent conversation:
${historyContext}

User message: ${request.message}

Respond in character with a natural, engaging message. Keep it conversational and match the character's personality. Limit response to 1-2 sentences.`;

    try {
      const response = await this.callMistralAPI(prompt, this.config.model);
      return response.trim();
    } catch (error) {
      console.error('Mistral chat error:', error);
      return 'I understand! Thanks for talking with me.'; // Fallback
    }
  }

  private async callMistralAPI(prompt: string, model: string): Promise<string> {
    const response = await fetch('https://api.mistral.ai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.config.apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: model,
        messages: [
          {
            role: 'user',
            content: prompt
          }
        ],
        max_tokens: 500,
        temperature: 0.7
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Mistral API error: ${response.status} ${response.statusText} - ${errorText}`);
    }

    const data = await response.json() as any;
    return data.choices[0]?.message?.content || 'No response generated.';
  }

  async testConnection(): Promise<{ success: boolean; message: string }> {
    if (!this.config.apiKey) {
      return { success: false, message: 'API key not configured' };
    }

    try {
      const response = await this.callMistralAPI('Hello, this is a test.', this.config.model);
      return { success: true, message: 'Connection successful' };
    } catch (error) {
      return { success: false, message: `Connection failed: ${error.message}` };
    }
  }
}

export const mistralService = new MistralService();
