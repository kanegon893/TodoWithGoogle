"use client"; // クライアント側で動作

import React, { useState, useEffect } from 'react';

interface Todo {
  id: number;
  text: string;
  completed: boolean;
  date: string;
  startTime: string;
  endTime: string;
}

const TodoList: React.FC = () => {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [newTodo, setNewTodo] = useState<string>('');
  const [date, setDate] = useState<string>('');          
  const [startTime, setStartTime] = useState<string>(''); 
  const [endTime, setEndTime] = useState<string>('');     
  const [accessToken, setAccessToken] = useState<string | null>(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get('accessToken');
    if (token) {
      setAccessToken(token);
    }
  }, []);

  const addToCalendar = async (todo: Todo) => {
    if (!accessToken) {
      try {
        const authResponse = await fetch('/api/auth/google');
        const authUrl = await authResponse.text();
        window.location.href = authUrl;
      } catch (error) {
        console.error('Error starting Google OAuth flow:', error);
      }
      return;
    }

    try {
      const calendarResponse = await fetch('/api/calendar/addEvent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          accessToken, 
          title: todo.text, 
          description: 'Todoの詳細', 
          startTime: `${todo.date}T${todo.startTime}:00`, 
          endTime: `${todo.date}T${todo.endTime}:00`,    
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

  const addTodo = () => {
    if (newTodo.trim() === '' || date === '' || startTime === '' || endTime === '') return;

    const newTask: Todo = {
      id: Date.now(),
      text: newTodo,
      completed: false,
      date: date,
      startTime: startTime,
      endTime: endTime,
    };

    setTodos([...todos, newTask]);
    setNewTodo('');    
    setDate('');       
    setStartTime('');  
    setEndTime('');    
  };

  return (
    <div className="max-w-xl mx-auto p-6 bg-white shadow-lg rounded-lg">
      <h1 className="text-2xl font-bold mb-4 text-center">Todo List</h1>
      <div className="mb-4">
        <input
          type="text"
          value={newTodo}
          onChange={(e) => setNewTodo(e.target.value)} 
          placeholder="新しいTodoを入力"
          className="w-full mb-2 p-2 border rounded focus:outline-none focus:ring focus:border-blue-300"
        />
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}   
          placeholder="日付を選択"
          className="w-full mb-2 p-2 border rounded focus:outline-none focus:ring focus:border-blue-300"
        />
        <div className="flex space-x-2">
          <input
            type="time"
            value={startTime}
            onChange={(e) => setStartTime(e.target.value)}  
            placeholder="開始時間を選択"
            className="w-1/2 p-2 border rounded focus:outline-none focus:ring focus:border-blue-300"
          />
          <input
            type="time"
            value={endTime}
            onChange={(e) => setEndTime(e.target.value)}    
            placeholder="終了時間を選択"
            className="w-1/2 p-2 border rounded focus:outline-none focus:ring focus:border-blue-300"
          />
        </div>
        <button
          onClick={addTodo}
          className="w-full mt-4 p-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Add Todo
        </button>
      </div>

      <ul className="space-y-2">
        {todos.map((todo) => (
          <li
            key={todo.id}
            className="p-4 bg-gray-100 rounded shadow flex justify-between items-center"
          >
            <div>
              <span className="font-medium">{todo.text}</span> <br />
              <span className="text-sm text-gray-500">
                {todo.date} {todo.startTime} - {todo.endTime}
              </span>
            </div>
            <button
              onClick={() => addToCalendar(todo)}
              className="bg-green-500 text-white p-2 rounded hover:bg-green-600"
            >
              Add to Calendar
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default TodoList;
