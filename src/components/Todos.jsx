import React, { useEffect, useState } from "react";
import { db } from "../firebase";
import {
  collection,
  query,
  where,
  onSnapshot,
  addDoc,
  doc,
  updateDoc,
  deleteDoc,
  getDoc,
} from "firebase/firestore";
import {
  getAuth,
  onAuthStateChanged,
  signOut,
  updateProfile,
  updatePassword,
  reauthenticateWithCredential,
  EmailAuthProvider,
} from "firebase/auth";
import { useNavigate } from "react-router-dom";
import { BsEmojiSmile } from "react-icons/bs";
import { AiOutlinePlus } from "react-icons/ai";
import data from "@emoji-mart/data";
import Picker from "@emoji-mart/react";
import Todo from "./Todo";

const EditProfileModal = ({ isOpen, onClose, onUpdateProfile }) => {
  const [newUsername, setNewUsername] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [confirmPasswordError, setConfirmPasswordError] = useState("");

  useEffect(() => {
    setPasswordError("");
    setConfirmPasswordError("");
  }, [isOpen, currentPassword, newPassword, confirmNewPassword]);

  const handleSubmit = () => {
    setPasswordError("");
    setConfirmPasswordError("");

    if (newPassword !== confirmNewPassword) {
      setConfirmPasswordError(
        "New password and confirm new password must match."
      );
      return;
    }

    onUpdateProfile(
      newUsername,
      currentPassword,
      newPassword,
      confirmNewPassword,
      setPasswordError, // Pass error setters as additional arguments
      setConfirmPasswordError
    );
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center p-4"
      style={{ zIndex: 1000 }}
    >
      <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md">
        <h2 className="text-xl font-semibold mb-4">Edit Profile</h2>
        <hr className="my-4" />
        <div className="my-4">
          <h3 className="text-sm font-semibold mb-2">Edit Username</h3>
          <input
            className="w-full border rounded p-2"
            placeholder="New Username"
            value={newUsername}
            onChange={(e) => setNewUsername(e.target.value)}
          />
        </div>

        <div className="my-2">
          <h3 className="text-sm font-semibold mb-2">Edit Password</h3>
          <input
            type="password"
            className="w-full border rounded p-2 mb-1"
            placeholder="Current Password"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
          />
          {passwordError && (
            <p className="text-red-500 text-xs">{passwordError}</p>
          )}
          <input
            type="password"
            className="w-full border rounded p-2 mb-1"
            placeholder="New Password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
          />
          <input
            type="password"
            className="w-full border rounded p-2 mb-1"
            placeholder="Confirm New Password"
            value={confirmNewPassword}
            onChange={(e) => setConfirmNewPassword(e.target.value)}
          />
          {confirmPasswordError && (
            <p className="text-red-500 text-xs">{confirmPasswordError}</p>
          )}
        </div>

        <div className="flex justify-end gap-2">
          <button
            className="bg-gray-300 hover:bg-gray-400 text-gray-800 text-base font-semibold py-1.5 px-4 rounded"
            onClick={onClose}
          >
            Cancel
          </button>
          <button
            className="bg-yellow-200 hover:bg-yellow-300 text-gray-800 text-base font-semibold py-1.5 px-4 rounded"
            onClick={() => handleSubmit()}
          >
            Update
          </button>
        </div>
      </div>
    </div>
  );
};

const EditTodoModal = ({ isOpen, onClose, onSave, todo }) => {
  const [newText, setNewText] = useState(todo.text);

  useEffect(() => {
    setNewText(todo.text); // Update the text when todo changes
  }, [todo]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-30 flex justify-center items-center p-4">
      <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md">
        <h2 className="text-lg font-semibold mb-4">Edit Todo</h2>
        <textarea
          className="w-full border rounded p-2 mb-4"
          value={newText}
          onChange={(e) => setNewText(e.target.value)}
        />
        <div className="flex justify-end gap-2">
          <button
            className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded"
            onClick={onClose}
          >
            Cancel
          </button>
          <button
            className="bg-yellow-200 hover:bg-yellow-300 text-black font-bold py-2 px-4 rounded"
            onClick={() => {
              onSave(todo.id, newText);
              onClose();
            }}
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
};

const Todos = () => {
  const navigate = useNavigate();
  const auth = getAuth();
  const [username, setUsername] = useState("");
  const [showEmoji, setShowEmoji] = useState(false);
  const [text, setText] = useState("");
  const [todoList, setTodoList] = useState([]);
  const [filter, setFilter] = useState("all");
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [currentEditTodo, setCurrentEditTodo] = useState({
    id: null,
    text: "",
  });
  const [isEditProfileModalOpen, setIsEditProfileModalOpen] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUsername(user.displayName || "User");
        const q = query(
          collection(db, "todos"),
          where("userId", "==", user.uid)
        );
        onSnapshot(q, (snapshot) => {
          const todos = snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }));
          setTodoList(todos);
        });
      } else {
        navigate("/signin");
      }
    });

    return () => unsubscribe();
  }, [navigate]);

  const handleSignOut = () => {
    signOut(auth)
      .then(() => {
        navigate("/signin");
      })
      .catch((error) => {
        console.error("Sign out error:", error);
      });
  };

  const addTodo = async (e) => {
    e.preventDefault();
    if (!text.trim()) return; // Prevent adding empty todos
    try {
      await addDoc(collection(db, "todos"), {
        text,
        completed: false,
        time: new Date(),
        userId: auth.currentUser.uid,
      });
      setText(""); // Clear the input after adding
      setShowEmoji(false); // Optionally hide the emoji picker
    } catch (err) {
      console.error("Error adding todo: ", err);
    }
  };

  const deleteTodoFromFirestore = async (id) => {
    await deleteDoc(doc(db, "todos", id));
  };

  const toggleCompletedInFirestore = async (id) => {
    const todoRef = doc(db, "todos", id);
    const todoSnap = await getDoc(todoRef);
    if (todoSnap.exists()) {
      await updateDoc(todoRef, { completed: !todoSnap.data().completed });
    }
  };

  const editTodo = (todo) => {
    setCurrentEditTodo({ id: todo.id, text: todo.text });
    setIsEditModalOpen(true);
  };

  const editTodoInFirestore = async (id, newText) => {
    if (!newText.trim()) return;
    await updateDoc(doc(db, "todos", id), { text: newText });
    setIsEditModalOpen(false);
  };

  const filterTodos = () => {
    switch (filter) {
      case "ongoing":
        return todoList.filter((todo) => !todo.completed);
      case "completed":
        return todoList.filter((todo) => todo.completed);
      default:
        return todoList;
    }
  };

  const handleUpdateProfile = async (
    newUsername,
    currentPassword,
    newPassword,
    confirmNewPassword,
    setPasswordError, // Accept error setters as parameters
    setConfirmPasswordError
  ) => {
    const user = auth.currentUser;
    if (!user) return;

    setPasswordError("");
    setConfirmPasswordError("");

    try {
      if (
        newPassword &&
        newPassword === confirmNewPassword &&
        currentPassword
      ) {
        const credential = EmailAuthProvider.credential(
          user.email,
          currentPassword
        );
        await reauthenticateWithCredential(user, credential).catch((error) => {
          if (error.code === "auth/wrong-password") {
            setPasswordError(
              "The current password is incorrect. Please try again."
            );
          } else {
            setPasswordError(
              "The current password is incorrect. Please try again."
            );
          }
          throw new Error("Re-authentication failed."); // Prevent further execution on catch
        });

        await updatePassword(user, newPassword);
      }

      if (newUsername && user.displayName !== newUsername) {
        await updateProfile(user, { displayName: newUsername });
        setUsername(newUsername);
      }

      setIsEditProfileModalOpen(false);
    } catch (error) {
      console.error("Error updating profile:", error);
      // Additional error handling can be implemented here
    }
  };

  return (
    <>
      <div className="pt-3rem w-[90%] sm:w-[70%] md:w-[60%] lg:w-[40%] mx-auto">
        <h1 className="text-2xl font-medium text-center text-[#40513b]">
          {username}'s ToDo List
        </h1>

        {/* Edit Profile button */}
        <div className="flex justify-center">
          <button
            onClick={() => setIsEditProfileModalOpen(true)}
            className="inline-flex items-center justify-center px-6 py-1 my-3 font-medium leading-6 text-white text-sm whitespace-no-wrap bg-[#609966] rounded-md shadow-sm hover:bg-[#56895C] focus:outline-none focus:ring-2 focus:ring-offset-2"
          >
            Edit Profile
          </button>

          <EditProfileModal
            isOpen={isEditProfileModalOpen}
            onClose={() => setIsEditProfileModalOpen(false)}
            onUpdateProfile={handleUpdateProfile}
          />
        </div>

        {/* Filter buttons */}
        <div className="flex justify-center gap-4 pt-2">
          <button
            className={`px-4 py-2 rounded-md text-sm focus:outline-none ${
              filter === "all"
                ? "bg-yellow-200 text-black"
                : "bg-gray-200 text-gray-700 hover:bg-gray-300"
            }`}
            onClick={() => setFilter("all")}
          >
            All
          </button>
          <button
            className={`px-4 py-2 rounded-md text-sm focus:outline-none ${
              filter === "ongoing"
                ? "bg-yellow-200 text-black"
                : "bg-gray-200 text-gray-700 hover:bg-gray-300"
            }`}
            onClick={() => setFilter("ongoing")}
          >
            Ongoing
          </button>
          <button
            className={`px-4 py-2 rounded-md text-sm focus:outline-none ${
              filter === "completed"
                ? "bg-yellow-200 text-black"
                : "bg-gray-200 text-gray-700 hover:bg-gray-300"
            }`}
            onClick={() => setFilter("completed")}
          >
            Completed
          </button>
        </div>

        {/* todo input  */}
        <div>
          <form onSubmit={addTodo} className="flex items-start gap-2 pt-2rem">
            <div className="w-full flex items-end p-2 bg-todo rounded relative">
              <textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="write your text"
                className="w-full bg-transparent outline-none resize-none text-sm placeholder-gray-700"
                cols="30"
                rows="1"
              ></textarea>

              <span
                onClick={() => setShowEmoji(!showEmoji)}
                className="cursor-pointer hover:text-slate-300"
              >
                <BsEmojiSmile />
              </span>

              {showEmoji && (
                <div className="absolute top-[100%] right-2">
                  <Picker
                    data={data}
                    emojiSize={20}
                    emojiButtonSize={28}
                    onEmojiSelect={addEmoji}
                    maxFrequentRows={0}
                  />
                </div>
              )}
            </div>

            <button
              className="flex items-center capitalize gap-2 bg-yellow-200 hover:bg-yellow-300 text-black py-1.5
          px-3 rounded-sm
          "
            >
              <AiOutlinePlus />
              add
            </button>
          </form>

          {/* print the todo lists  */}
          <div className="pt-2rem">
            {/* Pass filtered todos to Todo component */}
            <Todo
              todoList={filterTodos()}
              deleteTodo={deleteTodoFromFirestore}
              toggleCompleted={toggleCompletedInFirestore}
              setEditTodo={editTodo}
            />
          </div>
        </div>

        {/* sign out button */}
        <div className="w-full flex items-center justify-center mt-5">
          <button
            type="button"
            onClick={handleSignOut}
            className="flex items-center focus:outline-none text-white bg-red-700 hover:bg-red-800 focus:ring-4 focus:ring-red-300 font-medium rounded-lg text-sm px-5 py-2.5"
          >
            Sign out
          </button>
        </div>
      </div>

      <footer className="text-center lg:text-left">
        <div className="p-4 text-center text-surface dark:text-black">
          © 2024 Copyright:&nbsp;
          <a href="https://lennoaubert.blog/" className="underline">
            Lenno Aubert Hartono
          </a>
          &nbsp;-&nbsp;2602116983
        </div>
      </footer>

      <EditTodoModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        onSave={editTodoInFirestore}
        todo={currentEditTodo}
      />
    </>
  );
};

export default Todos;
