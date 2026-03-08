import { GoogleGenAI, Type } from '@google/genai';
import { Question } from '../types';

const genAI = new GoogleGenAI(import.meta.env.VITE_GEMINI_API_KEY);

export const generateQuestions = async (
  section: string,
  topic: string,
  difficulty: string,
  count: number
): Promise<Question[]> => {
  const prompt = `Generate ${count} multiple-choice questions for the NTS GAT General Test (Pakistan).
Section: ${section}
Topic: ${topic}
Difficulty: ${difficulty}

Guidelines:
- MCQ format with exactly 4 options.
- 1 correct answer.
- Provide a clear explanation for the correct answer.
- Realistic academic vocabulary.
- Quantitative questions should require calculation.
- Logical reasoning should involve puzzles and inference.
- Reading comprehension should include short passages followed by questions (if applicable).
- Generate questions similar to those used in past NTS GAT General exams and Pakistani testing patterns used by NTS. Focus on conceptual difficulty rather than trivial questions.
- Dynamically generate new questions each time to avoid repetition.
`;

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: prompt,
    config: {
      responseMimeType: 'application/json',
      responseSchema: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            section: { type: Type.STRING },
            topic: { type: Type.STRING },
            question: { type: Type.STRING },
            options: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
            },
            correct_answer: { type: Type.STRING },
            explanation: { type: Type.STRING },
          },
          required: ['section', 'topic', 'question', 'options', 'correct_answer', 'explanation'],
        },
      },
      temperature: 0.7,
    },
  });

  const jsonStr = response.text?.trim() || '[]';
  try {
    const questions = JSON.parse(jsonStr) as Omit<Question, 'id'>[];
    return questions.map((q) => ({
      ...q,
      id: Math.random().toString(36).substring(2, 9),
    }));
  } catch (e) {
    console.error('Failed to parse questions', e);
    return [];
  }
};

export const generateMockTest = async (): Promise<Question[]> => {
  // Generating 100 questions in one go might be too large for the model's output token limit or take too long.
  // We'll generate them in batches or ask for a smaller subset if needed.
  // For a real mock test, we need 35 Verbal, 35 Quant, 30 Analytical.
  // To avoid timeouts, we can generate them in 3 separate calls.
  
  const generateSection = async (section: string, count: number) => {
    const prompt = `Generate ${count} multiple-choice questions for the NTS GAT General Test (Pakistan).
Section: ${section}
Difficulty: GAT Exam Level

Guidelines:
- MCQ format with exactly 4 options.
- 1 correct answer.
- Provide a clear explanation for the correct answer.
- Realistic academic vocabulary.
- Quantitative questions should require calculation.
- Logical reasoning should involve puzzles and inference.
- Reading comprehension should include short passages followed by questions (if applicable).
- Generate questions similar to those used in past NTS GAT General exams and Pakistani testing patterns used by NTS. Focus on conceptual difficulty rather than trivial questions.
- Dynamically generate new questions each time to avoid repetition.
- Ensure the topics are well distributed across the syllabus for this section.
`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              section: { type: Type.STRING },
              topic: { type: Type.STRING },
              question: { type: Type.STRING },
              options: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
              },
              correct_answer: { type: Type.STRING },
              explanation: { type: Type.STRING },
            },
            required: ['section', 'topic', 'question', 'options', 'correct_answer', 'explanation'],
          },
        },
        temperature: 0.7,
      },
    });

    const jsonStr = response.text?.trim() || '[]';
    try {
      const questions = JSON.parse(jsonStr) as Omit<Question, 'id'>[];
      return questions.map((q) => ({
        ...q,
        id: Math.random().toString(36).substring(2, 9),
      }));
    } catch (e) {
      console.error('Failed to parse questions', e);
      return [];
    }
  };

  // For demonstration and performance, we might generate fewer questions or run in parallel.
  // Generating 100 questions might hit token limits. Let's generate 10 for each section for the mock test to ensure it works reliably, or we can try generating 35, 35, 30.
  // Let's try 10, 10, 10 for stability in this environment, or we can do the full 35, 35, 30.
  // Let's do full, but if it fails, we can fallback.
  
  const [verbal, quant, analytical] = await Promise.all([
    generateSection('Verbal Reasoning', 35),
    generateSection('Quantitative Reasoning', 35),
    generateSection('Analytical Reasoning', 30),
  ]);

  return [...verbal, ...quant, ...analytical];
};

export const chatWithTutor = async (history: { role: 'user' | 'model'; parts: { text: string }[] }[], message: string) => {
  const chat = ai.chats.create({
    model: 'gemini-2.5-flash',
    config: {
      systemInstruction: 'You are an expert AI Tutor for the NTS GAT General Test. You help students understand concepts, provide step-by-step solutions, give shortcuts for quantitative problems, explain vocabulary, and recommend practice strategies. Be encouraging and clear.',
    },
  });
  
  // The SDK might not support history directly in create, so we can just use generateContent with the full history
  const contents = history.map(h => ({
    role: h.role,
    parts: h.parts
  }));
  contents.push({ role: 'user', parts: [{ text: message }] });

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents,
    config: {
      systemInstruction: 'You are an expert AI Tutor for the NTS GAT General Test. You help students understand concepts, provide step-by-step solutions, give shortcuts for quantitative problems, explain vocabulary, and recommend practice strategies. Be encouraging and clear.',
    }
  });

  return response.text;
};
