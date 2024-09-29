"use client"; // クライアント側で動作

import React, { useState, useEffect } from 'react';

interface Todo {
  id: number;
  text: string;
  completed: boolean;
}

const TodoList: React.FC = () => {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [newTodo, setNewTodo] = useState<string>('');
  const [accessToken, setAccessToken] = useState<string | null>(null);

  // URLからアクセストークンを取得
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get('accessToken');
    if (token) {
      setAccessToken(token);
    }
  }, []);

  // TodoをGoogleカレンダーに追加する関数
  const addToCalendar = async (todo: Todo) => {
    if (!accessToken) {
      // アクセストークンがない場合、Google認証を開始
      try {
        const authResponse = await fetch('/api/auth/google');
        const authUrl = await authResponse.text();
        window.location.href = authUrl;
      } catch (error) {
        console.error('Error starting Google OAuth flow:', error);
      }
      return;
    }

    // カレンダーにイベントを追加
    try {
      const calendarResponse = await fetch('/api/calendar/addEvent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          accessToken, // 認証用のトークン
          title: todo.text, // Todoのタイトル
          description: 'Todoの詳細', // 詳細（任意）
          startTime: new Date().toISOString(), // 現在時刻
          endTime: new Date(new Date().getTime() + 60 * 60 * 1000).toISOString(), // 1時間後
        }),
      });

      if (!calendarResponse.ok) {
        const error = await calendarResponse.json();
        throw new Error(error.message || 'Google Calendar API request failed');
      }

      const eventData = await calendarResponse.json();
      console.log('Event added to Google Calendar:', eventData);
    } catch (error) {
      console.error('Error adding event to calendar:', error);
    }
  };

  // 新しいTodoを追加する関数
  const addTodo = () => {
    if (newTodo.trim() === '') return;

    const newTask: Todo = {
      id: Date.now(),
      text: newTodo,
      completed: false,
    };

    setTodos([...todos, newTask]);
    setNewTodo(''); // 入力欄をクリア
  };

  return (
    <div>
      <input
        type="text"
        value={newTodo}
        onChange={(e) => setNewTodo(e.target.value)} // 入力をリアルタイムで反映
        placeholder="新しいTodoを入力"
      />
      <button onClick={addTodo}>Add Todo</button>

      <ul>
        {todos.map((todo) => (
          <li key={todo.id}>
            {todo.text}
            <button onClick={() => addToCalendar(todo)}>Add to Calendar</button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default TodoList;
