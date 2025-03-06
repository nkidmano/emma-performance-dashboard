export const maxDuration = 60

import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  // Get URL from query parameters
  const { searchParams } = new URL(request.url);
  const url = searchParams.get('url');
  const strategy = searchParams.get('strategy') || 'mobile'; // Default to mobile

  if (!url) {
    return NextResponse.json({ error: 'URL parameter is required' }, { status: 400 });
  }

  try {
    const API_KEY = process.env.PAGESPEED_API_KEY;

    // Construct PageSpeed API URL
    const apiUrl = `https://www.googleapis.com/pagespeedonline/v5/runPagespeed?url=${url}&strategy=${strategy}&key=${API_KEY}`;

    // Fetch data from PageSpeed Insights
    const response = await fetch(apiUrl, { cache: 'no-store' });
    const { id, loadingExperience, analysisUTCTimestamp } = await response.json();

    // Return the data
    return NextResponse.json({ id, loadingExperience, analysisUTCTimestamp });
  } catch (error) {
    console.error('PageSpeed API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch PageSpeed data', message: 'PageSpeed API error' },
      { status: 500 }
    );
  }
}
