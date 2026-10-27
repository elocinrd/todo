import { useState, useEffect } from 'react'

const STORAGE_KEY = 'todo_app_items_v1'

export default function App() {
  const [todos, setTodos] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY)
      return saved ? JSON.parse(saved) : [
        { id: '1', text: 'Welcome to your Todo List!', completed: false },
        { id: '2', text: 'Double-click a task to edit it', completed: false },
      ]
    } catch {
      return []
    }
  })
  const [input, setInput] = useState('')
  const [filter, setFilter] = useState('all')
  const [editingId, setEditingId] = useState(null)
  const [editingText, setEditingText] = useState('')

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(todos))
  }, [todos])

  const handleAdd = (e) => {
    e.preventDefault()
    const trimmed = input.trim()
    if (!trimmed) return
    setTodos((prev) => [
      { id: crypto.randomUUID(), text: trimmed, completed: false },
      ...prev,
    ])
    setInput('')
  }

  const toggleTodo = (id) => {
    setTodos((prev) =>
      prev.map((todo) =>
        todo.id === id ? { ...todo, completed: !todo.completed } : todo
      )
    )
  }

  const deleteTodo = (id) => {
    setTodos((prev) => prev.filter((todo) => todo.id !== id))
  }

  const startEdit = (todo) => {
    setEditingId(todo.id)
    setEditingText(todo.text)
  }

  const saveEdit = (id) => {
    const trimmed = editingText.trim()
    if (!trimmed) {
      deleteTodo(id)
    } else {
      setTodos((prev) =>
        prev.map((todo) => (todo.id === id ? { ...todo, text: trimmed } : todo))
      )
    }
    setEditingId(null)
  }

  const clearCompleted = () => {
    setTodos((prev) => prev.filter((todo) => !todo.completed))
  }

  const filteredTodos = todos.filter((todo) => {
    if (filter === 'active') return !todo.completed
    if (filter === 'completed') return todo.completed
    return true
  })

  const remainingCount = todos.filter((t) => !t.completed).length
  const hasCompleted = todos.some((t) => t.completed)

  return (
    <main className="todo-card">
      <header className="header">
        <h1>Todo List</h1>
        <span className="count">
          {remainingCount} {remainingCount === 1 ? 'task' : 'tasks'} remaining
        </span>
      </header>

      <form className="todo-form" onSubmit={handleAdd}>
        <input
          type="text"
          className="todo-input"
          placeholder="What needs to be done?"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          aria-label="New task"
        />
        <button type="submit" className="btn-primary">
          Add
        </button>
      </form>

      <div className="filters">
        <div className="filter-tabs" role="tablist">
          {['all', 'active', 'completed'].map((tab) => (
            <button
              key={tab}
              type="button"
              className={`filter-btn ${filter === tab ? 'active' : ''}`}
              onClick={() => setFilter(tab)}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>
        {hasCompleted && (
          <button
            type="button"
            className="clear-btn"
            onClick={clearCompleted}
          >
            Clear completed
          </button>
        )}
      </div>

      {filteredTodos.length === 0 ? (
        <p className="empty-state">
          {filter === 'all'
            ? 'No tasks yet. Add one above!'
            : `No ${filter} tasks.`}
        </p>
      ) : (
        <ul className="todo-list">
          {filteredTodos.map((todo) => (
            <li
              key={todo.id}
              className={`todo-item ${todo.completed ? 'completed' : ''}`}
            >
              <input
                type="checkbox"
                className="todo-checkbox"
                checked={todo.completed}
                onChange={() => toggleTodo(todo.id)}
                aria-label={`Mark "${todo.text}" as ${
                  todo.completed ? 'incomplete' : 'complete'
                }`}
              />

              {editingId === todo.id ? (
                <input
                  type="text"
                  className="edit-input"
                  value={editingText}
                  autoFocus
                  onChange={(e) => setEditingText(e.target.value)}
                  onBlur={() => saveEdit(todo.id)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') saveEdit(todo.id)
                    if (e.key === 'Escape') setEditingId(null)
                  }}
                />
              ) : (
                <span
                  className="todo-text"
                  onDoubleClick={() => startEdit(todo)}
                  title="Double-click to edit"
                >
                  {todo.text}
                </span>
              )}

              <button
                type="button"
                className="delete-btn"
                onClick={() => deleteTodo(todo.id)}
                aria-label={`Delete "${todo.text}"`}
              >
                ✕
              </button>
            </li>
          ))}
        </ul>
      )}
    </main>
  )
}

