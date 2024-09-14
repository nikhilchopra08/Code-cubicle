import { NextRequest, NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';
import prismadb from '@/lib/prismadb';
import serverAuth from '@/lib/serverauth';

export async function POST(req: NextRequest) {
    try {
        // Authenticate user and get currentUser
        const { currentUser } = await serverAuth(req);

        // Generate a unique API key
        const apiKey = uuidv4();

        // Get context details from request body
        const body = await req.json();
        const { contextName, contextContent } = body;

        if (!contextName || !contextContent) {
            return NextResponse.json({ error: "Context name and content are required" }, { status: 400 });
        }

        // Create the API key
        const newApiKey = await prismadb.apiKey.create({
            data: {
                key: apiKey,
                userId: currentUser.id,
            },
        });

        // Create the context and associate it with the API key
        const newContext = await prismadb.context.create({
            data: {
                userId: currentUser.id,
                name: contextName,
                content: contextContent,
                apiKeyId: newApiKey.id, // Associate context with the new API key
            },
        });

        return NextResponse.json({ apiKey: newApiKey, context: newContext }, { status: 201 });
    } catch (e) {
        console.error("Error during API key and context creation:", e);
        return NextResponse.json({ error: "Error generating API key or saving context" }, { status: 500 });
    }
}


export async function GET(req: NextRequest) {
    try {
        // Authenticate user and get currentUser
        const { currentUser } = await serverAuth(req);

        // Fetch all API keys and their associated contexts for the user
        const apiKeys = await prismadb.apiKey.findMany({
            where: { userId: currentUser.id },
        });

        const contexts = await prismadb.context.findMany({
            where: { userId: currentUser.id },
        });

        return NextResponse.json({ apiKeys, contexts }, { status: 200 });
    } catch (e) {
        console.error("Error retrieving API keys and contexts:", e);
        return NextResponse.json({ error: "Error retrieving API keys or contexts" }, { status: 500 });
    }
}
