import React from 'react';
import TodoList from './components/TodoList'; // TodoListコンポーネントをインポート

const HomePage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <h1 className="text-3xl font-bold mb-4">Todoアプリ</h1>
      {/* TodoListコンポーネントをここに埋め込む */}
      <TodoList />
    </div>
  );
};

export default HomePage;
