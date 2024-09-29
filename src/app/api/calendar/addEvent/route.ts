import { google } from 'googleapis';
import { NextRequest, NextResponse } from 'next/server';

// Google OAuth2 クライアントの設定
const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.GOOGLE_REDIRECT_URI
);

// Googleカレンダーにイベントを追加するAPIエンドポイント
export async function POST(request: NextRequest) {
  try {
    const { accessToken, title, description, startTime, endTime } = await request.json();

    // OAuth2クライアントにアクセストークンをセット
    oauth2Client.setCredentials({ access_token: accessToken });

    const calendar = google.calendar({ version: 'v3', auth: oauth2Client });

    // 新しいイベントの設定
    const event = {
      summary: title,
      description: description,
      start: {
        dateTime: startTime,
        timeZone: 'Asia/Tokyo',  // 必要に応じてタイムゾーンを変更
      },
      end: {
        dateTime: endTime,
        timeZone: 'Asia/Tokyo',
      },
    };

    // Googleカレンダーにイベントを挿入
    const response = await calendar.events.insert({
      calendarId: 'primary',
      requestBody: event,
    });

    // 成功した場合、作成されたイベントの情報を返す
    return NextResponse.json({ status: 'success', event: response.data });
  } catch (error) {
    // errorをError型としてキャスト
    if (error instanceof Error) {
      console.error('Error adding event to Google Calendar:', error.message);
      return NextResponse.json({ status: 'error', message: error.message }, { status: 500 });
    } else {
      console.error('Unknown error occurred');
      return NextResponse.json({ status: 'error', message: 'Unknown error occurred' }, { status: 500 });
    }
  }
}
