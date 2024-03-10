import React, { useState } from "react";
import moment from "moment";
import {
  AiTwotoneDelete,
  AiTwotoneEdit,
  AiOutlineCheckCircle,
} from "react-icons/ai";
import { IoIosCloseCircle } from "react-icons/io";
import Layer from "./Layer";

const Todo = ({ todoList, deleteTodo, toggleCompleted, setEditTodo }) => {
  const [showText, setShowText] = useState(false);
  const [showFullText, setShowFullText] = useState("");

  const handleDeleteTodo = (id) => {
    deleteTodo(id);
  };

  const handleToggleCompleted = (id, completed) => {
    toggleCompleted(id, completed);
  };

  // Adjusting editTodoList to directly use setEditTodo passed from Todos.jsx
  const editTodoList = (id) => {
    const findTodo = todoList.find((todo) => todo.id === id);
    setEditTodo(findTodo);
  };

  const showFullTextHandler = (id) => {
    const findTodo = todoList.find((todo) => todo.id === id);
    setShowFullText(findTodo.text);
    setShowText(true);
  };

  return (
    <div id="todos">
      {todoList.map((todo) => (
        <div key={todo.id} className="bg-todo p-2 rounded-md w-full h-full">
          <span className="text-xs text-slate-600">
            {moment(todo.time.toDate()).fromNow()}{" "}
            {/* Adjusted for Firestore timestamp */}
          </span>

          <div className="flex flex-col justify-between h-[80%]">
            <h1
              className={`pt-3 text-sm ${
                todo.completed ? "line-through text-[#40513B]" : ""
              }`}
            >
              {todo.text.length > 36 ? todo.text.substring(0, 36) : todo.text}
              {todo.text.length > 36 && (
                <button
                  onClick={() => showFullTextHandler(todo.id)}
                  className="text-blue-600 text-xs hover:text-blue-800"
                >
                  ...more
                </button>
              )}
            </h1>

            <div className="flex items-center justify-end gap-1 py-2">
              <span
                onClick={() => handleDeleteTodo(todo.id)}
                className="cursor-pointer hover:text-slate-500"
              >
                <AiTwotoneDelete />
              </span>
              <span
                onClick={() => editTodoList(todo.id)}
                className="cursor-pointer hover:text-slate-500"
              >
                <AiTwotoneEdit />
              </span>
              <span
                onClick={() => handleToggleCompleted(todo.id, todo.completed)}
                className="cursor-pointer hover:text-slate-500"
              >
                <AiOutlineCheckCircle />
              </span>
            </div>
          </div>

          {showText && (
            <div className="absolute inset-0 flex items-center justify-center bg-bodyBg/75">
              <span
                onClick={() => setShowText(false)}
                className="absolute top-10 right-10 text-xl cursor-pointer hover:text-slate-500"
              >
                <IoIosCloseCircle color="teal" fontSize="3rem" />
              </span>
              <div className="w-[25rem] h-[25rem] bg-todo rounded-md">
                <Layer text={showFullText} />
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default Todo;
