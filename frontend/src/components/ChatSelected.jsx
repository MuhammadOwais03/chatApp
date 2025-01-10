import { useChatStore } from "../store/useChatStore";
import { useEffect, useRef } from "react";
import ChatHeader from "./ChatHeader";
import MessageInput from "./MessageInput";
import MessageSkeleton from "./skeleton/MessageSkeleton";
import { useAuthStore } from "../store/userAuthStore";
import { formatMessageTime } from "../lib/utils";

const ChatSelected = () => {
  const {
    messages,
    getMessages,
    isMessagesLoading,
    selectedUser,
    subscribeToMessages,
    unsubscribeFromMessages,
  } = useChatStore();
  const { authUser } = useAuthStore();
  const messageEndRef = useRef(null);

  useEffect(() => {
    getMessages(selectedUser._id);

   
  }, [
    selectedUser._id,
    getMessages,
    subscribeToMessages,
    unsubscribeFromMessages,
  ]);

  useEffect(() => {
    if (messageEndRef.current && messages) {
      messageEndRef.current.scrollIntoView({ behavior: "smooth" });
    }

    subscribeToMessages()

    console.log(messages);

    return () => unsubscribeFromMessages()
  }, [messages]);

  if (isMessagesLoading) {
    return (
      <div className="flex-1 flex flex-col overflow-auto">
        <ChatHeader />
        <MessageSkeleton />
        <MessageInput />
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col overflow-auto">
      <ChatHeader />

      <div className="relative flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <div
            key={message._id}
            className={`chat ${
              message.senderId === authUser._id ? "chat-end" : "chat-start"
            }`}
            ref={messageEndRef}
          >
            <div className="chat-image avatar">
              <div className="size-10 rounded-full border">
                <img
                  src={
                    message.senderId === authUser._id
                      ? authUser.profilePic || "/avatar.png"
                      : selectedUser.profilePic || "/avatar.png"
                  }
                  alt="profile pic"
                />
              </div>
            </div>
            <div className="chat-header mb-1">
              <time className="text-xs opacity-50 ml-1">
                {formatMessageTime(message.createdAt)}
              </time>
            </div>
            <div className="relative chat-bubble flex flex-col">
              {message.image.length > 0 &&
                message.image.map((img, index) => (
                  <img
                    key={index}
                    src={img}
                    alt="Attachment"
                    className="sm:max-w-[200px] rounded-md mb-2"
                  />
                ))}
              {message.text && <p>{message.text}</p>}
              {/* <div className="dropdown absolute left-[-60%] mt-2">
                <label tabIndex={0} className="btn m-1">
                  <span className="w-2 h-2 border-t-2 border-r-2 border-gray-600 transform rotate-45 mt-1"></span>
                </label>
                <ul
                  tabIndex={0}
                  className="dropdown-content menu bg-base-100 rounded-box z-[1] w-52 p-2 shadow"
                >
                  <li>
                    <a>Edit</a>
                  </li>
                  <li>
                    <a>Delete</a>
                  </li>
                </ul>
              </div> */}
            </div>

            {/* Dropdown with arrowhead and "Delete" & "Edit" options */}
          </div>
        ))}
      </div>

      <MessageInput />
    </div>
  );
};
export default ChatSelected;
