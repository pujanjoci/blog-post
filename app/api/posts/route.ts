import { NextResponse } from 'next/server';
import { getAllPosts } from '@/lib/content';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const posts = getAllPosts();
    // Exclude full content in the listing to keep the payload size small
    const listingPosts = posts.map(({ content, ...rest }) => rest);
    return NextResponse.json(listingPosts);
  } catch (error) {
    console.error('Error fetching posts in API route:', error);
    return NextResponse.json(
      { error: 'Failed to fetch posts' },
      { status: 500 }
    );
  }
}
