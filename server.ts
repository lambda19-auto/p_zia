import express from 'express';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = Number(process.env.PORT || 8787);
const OPENAI_API_URL = 'https://api.openai.com/v1/responses';

app.use(express.json());

type Budget = 'low' | 'medium' | 'high';

interface RecommendationsRequestBody {
  query?: string;
  budget?: Budget;
  season?: string;
  travelers?: number;
  hasChildren?: boolean;
}

interface Recommendation {
  title: string;
  description: string;
  whyFits: string;
  estimatedCost: string;
}

interface OpenAIOutputTextContent {
  type?: string;
  text?: string;
  annotations?: Array<{
    type?: string;
    url_citation?: {
      url?: string;
      title?: string;
    };
  }>;
}

interface OpenAIResponsePayload {
  output?: Array<{
    type?: string;
    content?: OpenAIOutputTextContent[];
  }>;
}

const buildPrompt = (body: RecommendationsRequestBody): string => {
  const budget = body.budget || 'medium';
  const season = body.season || 'summer';
  const travelers = Math.max(1, Number(body.travelers || 1));
  const hasChildren = Boolean(body.hasChildren);

  return `
Пользователь хочет поехать: "${body.query}".
Параметры поездки:
- Бюджет: ${budget === 'low' ? 'экономный (до 100к руб.)' : budget === 'medium' ? 'средний (100-300к руб.)' : 'высокий (от 300к руб.)'}
- Сезон: ${season}
- Количество человек: ${travelers}
- С детьми: ${hasChildren ? 'Да' : 'Нет'}

Найди топ-3 лучших варианта для отдыха, соответствующих этим критериям.
Для каждого варианта напиши название, краткое описание, почему он подходит, и примерную стоимость.
Отвечай на русском языке.
  `.trim();
};

app.post('/api/recommendations', async (req, res) => {
  const body = req.body as RecommendationsRequestBody;
  if (!body.query || !body.query.trim()) {
    return res.status(400).json({ error: 'Query is required.' });
  }

  if (!process.env.OPENAI_API_KEY) {
    return res.status(500).json({ error: 'OPENAI_API_KEY is not configured on server.' });
  }

  try {
    const openaiResponse = await fetch(OPENAI_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'gpt-5',
        tools: [{ type: 'web_search' }],
        input: buildPrompt(body),
        text: {
          format: {
            type: 'json_schema',
            name: 'travel_recommendations',
            strict: true,
            schema: {
              type: 'array',
              minItems: 3,
              maxItems: 3,
              items: {
                type: 'object',
                additionalProperties: false,
                properties: {
                  title: { type: 'string', description: 'Название направления' },
                  description: { type: 'string', description: 'Краткое описание' },
                  whyFits: { type: 'string', description: 'Почему этот вариант подходит под критерии' },
                  estimatedCost: { type: 'string', description: 'Примерная стоимость' },
                },
                required: ['title', 'description', 'whyFits', 'estimatedCost'],
              },
            },
          },
        },
      }),
    });

    if (!openaiResponse.ok) {
      const errorText = await openaiResponse.text();
      return res.status(openaiResponse.status).json({ error: errorText });
    }

    const data = (await openaiResponse.json()) as OpenAIResponsePayload;
    const outputTextItems = (data.output || [])
      .flatMap((item) => item.content || [])
      .filter((content): content is OpenAIOutputTextContent => content.type === 'output_text' && typeof content.text === 'string');

    const jsonText = outputTextItems.map((item) => item.text || '').join('\n').trim();
    const recommendations = JSON.parse(jsonText || '[]') as Recommendation[];

    const sources = outputTextItems
      .flatMap((item) => item.annotations || [])
      .filter((annotation) => annotation.type === 'url_citation' && annotation.url_citation?.url)
      .map((annotation) => ({
        uri: annotation.url_citation!.url!,
        title: annotation.url_citation!.title || annotation.url_citation!.url!,
      }))
      .filter((source, index, array) => array.findIndex((item) => item.uri === source.uri) === index);

    return res.json({ recommendations, sources });
  } catch (error) {
    console.error('Recommendations API error:', error);
    return res.status(500).json({ error: 'Failed to get travel recommendations.' });
  }
});

app.listen(PORT, () => {
  console.log(`API server listening on port ${PORT}`);
});
