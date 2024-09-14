import { NextRequest, NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';
import prismadb from '@/lib/prismadb';
import serverAuth from '@/lib/serverauth';

export async function POST(req: NextRequest) {
    try {
        // Extract userId from URL parameters
        const url = new URL(req.url);
        const userId = url.pathname.split('/')[2]; // Assuming the URL is `/api/[userId]/api-keys`

        // Authenticate user and get currentUser
        const { currentUser } = await serverAuth(req);

        // Check if the authenticated user matches the userId from the URL
        if (currentUser.id !== userId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
        }

        // Generate a unique API key
        const apiKey = uuidv4();

        // Get context details from request body
        const body = await req.json();
        const { contextName, contextContent } = body;

        if (!contextName || !contextContent) {
            return NextResponse.json({ error: "Context name and content are required" }, { status: 400 });
        }

        // Create the API key and context in the database
        const newApiKey = await prismadb.apiKey.create({
            data: {
                key: apiKey,
                userId: currentUser.id,
            },
        });

        const newContext = await prismadb.context.create({
            data: {
                userId: currentUser.id,
                name: contextName,
                content: contextContent,
            },
        });

        return NextResponse.json({ apiKey: newApiKey, context: newContext }, { status: 201 });
    } catch (e) {
        console.error("Error during API key and context creation:", e);
        return NextResponse.json({ error: "Error generating API key or saving context", details: e.message }, { status: 500 });
    }
}

export async function GET(req: NextRequest) {
    try {
        // Extract userId from URL parameters
        const url = new URL(req.url);
        const userId = url.pathname.split('/')[2]; // Assuming the URL is `/api/[userId]/api-keys`

        // Authenticate user and get currentUser
        // const { currentUser } = await serverAuth(req);

        // Check if the authenticated user matches the userId from the URL
        // if (currentUser.id !== userId) {
        //     return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
        // }

        // Fetch all API keys and contexts for the user
        const [apiKeys, contexts] = await Promise.all([
            prismadb.apiKey.findMany({
                where: { userId: userId },
            }),
            prismadb.context.findMany({
                where: { userId: userId },
            }),
        ]);

        return NextResponse.json({ apiKeys, contexts }, { status: 200 });
    } catch (e) {
        console.error("Error retrieving API keys and contexts:", e);
        return NextResponse.json({ error: "Error retrieving API keys or contexts", details: e.message }, { status: 500 });
    }
}
