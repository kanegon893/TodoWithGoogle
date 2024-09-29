import { google } from 'googleapis';
import { NextRequest, NextResponse } from 'next/server';

// OAuth2クライアントの初期化
const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  `${process.env.NEXT_PUBLIC_URL}/api/auth/google/callback`
);

// Google認証後に呼ばれるコールバックエンドポイント
export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const code = url.searchParams.get('code'); // Googleからの認証コードを取得

  if (!code) {
    return NextResponse.redirect('/');  // 認証コードがない場合、ホームにリダイレクト
  }

  try {
    // 認証コードを使用してアクセストークンを取得
    const { tokens } = await oauth2Client.getToken(code);
    oauth2Client.setCredentials(tokens);  // トークンをOAuth2クライアントに設定

    // アクセストークンをカレンダーイベント追加のためにフロントエンドに渡す
    return NextResponse.redirect(`${process.env.NEXT_PUBLIC_URL}/?accessToken=${tokens.access_token}`);
  } catch (error) {
    console.error('Error exchanging auth code for tokens:', error);
    return NextResponse.json({ error: 'Failed to obtain access token' }, { status: 500 });
  }
}
