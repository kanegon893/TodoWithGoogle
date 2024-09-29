import { google } from 'googleapis';
import { NextRequest, NextResponse } from 'next/server';

// OAuth2クライアントの初期化
const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  `${process.env.NEXT_PUBLIC_URL}/api/auth/google/callback`
);

// 認証フローのエンドポイント (GET)
export async function GET(request: NextRequest) {
  try {
    // 認証URLを生成し、Google認証ページにリダイレクトするURLをフロントエンドに返す
    const authUrl = oauth2Client.generateAuthUrl({
      access_type: 'offline',
      scope: ['https://www.googleapis.com/auth/calendar.events'],  // カレンダーへのアクセススコープ
    });
    return new NextResponse(authUrl, { status: 200 });
  } catch (error) {
    console.error('Error generating OAuth URL:', error);
    return new NextResponse('Failed to generate auth URL', { status: 500 });
  }
}
