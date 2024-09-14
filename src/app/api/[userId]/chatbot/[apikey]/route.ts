import { NextRequest, NextResponse } from 'next/server';
import prismadb from '@/lib/prismadb'; // Import your Prisma client instance

export async function POST(req: NextRequest) {
  try {
    // Extract API key and userId from the URL parameters
    const url = new URL(req.url);
    const urlParts = url.pathname.split('/');
    const userId = urlParts[2]; // Extract userId from path
    const apiKey = urlParts[4]; // Extract apiKey from path

    if (!apiKey) {
      return NextResponse.json({ message: 'API key is required' }, { status: 401 });
    }

    // Verify if the API key exists and is active
    const apiKeyRecord = await prismadb.apiKey.findUnique({
      where: { key: apiKey },
      include: { user: { include: { contexts: true } } }, // Include contexts with the user
    });

    if (!apiKeyRecord || !apiKeyRecord.isActive || apiKeyRecord.userId !== userId) {
      return NextResponse.json({ message: 'Invalid or inactive API key' }, { status: 403 });
    }

    // Verify if the user exists
    const user = await prismadb.user.findUnique({
      where: { id: userId },
      include: { contexts: true }, // Include contexts for the user
    });

    if (!user) {
      return NextResponse.json({ message: 'User not found or not authorized' }, { status: 403 });
    }

    // Fetch the latest context for the user
    const context = user.contexts.length > 0 ? user.contexts[0] : null; // Get the most recent context or null if none

    if (!context) {
      return NextResponse.json({ message: 'No context available for the user' }, { status: 400 });
    }

    const body = await req.json();
    const { question } = body;

    if (!question) {
      return NextResponse.json({ message: 'Question is required' }, { status: 400 });
    }

    const HUGGINGFACE_API_KEY = process.env.HUGGINGFACE_API;

    if (!HUGGINGFACE_API_KEY) {
      return NextResponse.json({ message: 'Hugging Face API key is not set in the environment' }, { status: 500 });
    }

    const response = await fetch(
      'https://api-inference.huggingface.co/models/deepset/roberta-base-squad2',
      {
        headers: {
          Authorization: `Bearer ${HUGGINGFACE_API_KEY}`,
          'Content-Type': 'application/json',
        },
        method: 'POST',
        body: JSON.stringify({ inputs: { question, context: context.content } }), // Use the context content
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(errorText || 'Failed to fetch from Hugging Face API');
    }

    const result = await response.json();
    return NextResponse.json(result, { status: 200 });

  } catch (error) {
    return NextResponse.json({ message: (error as Error).message }, { status: 500 });
  }
}
