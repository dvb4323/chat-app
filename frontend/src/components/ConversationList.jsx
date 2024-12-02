import React, { useEffect, useState, useCallback, useMemo } from "react";
import PropTypes from "prop-types";
import Cookies from "universal-cookie";

const cookies = new Cookies();

const formatDate = (dateString) => {
  const inputDate = new Date(dateString);
  const currentDate = new Date();

  if (
    inputDate.getFullYear() === currentDate.getFullYear() &&
    inputDate.getMonth() === currentDate.getMonth() &&
    inputDate.getDate() === currentDate.getDate()
  ) {
    return inputDate.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  }

  const oneWeekAgo = new Date(currentDate);
  oneWeekAgo.setDate(currentDate.getDate() - 7);

  if (inputDate >= oneWeekAgo) {
    return inputDate.toLocaleDateString("en-US", { weekday: "short" });
  }

  const day = inputDate.getDate().toString().padStart(2, "0");
  const month = (inputDate.getMonth() + 1).toString().padStart(2, "0");
  const year = inputDate.getFullYear();

  return `${day}.${month}.${year}`;
};

const Conversation = React.memo(
  ({
    conversation,
    changeConversationId,
    isActive,
    onSelectConversation,
    user,
  }) => {
    const {
      id,
      name: convName,
      Messages = [],
      Participants = [],
    } = conversation;
    const latestMessage = Messages[0] || {};
    const name =
      convName ||
      Participants.find((p) => p.Users?.id !== user?.id)?.Users?.username ||
      "Unknown";

    const handleConversationChange = useCallback(() => {
      changeConversationId(id);
      onSelectConversation(id);
    }, [id, changeConversationId, onSelectConversation]);

    return (
      <li
        className={`grid grid-cols-8 grid-rows-2 hover:bg-gray-700 p-2 rounded-md cursor-pointer ${
          isActive ? "bg-gray-800" : ""
        }`}
        onClick={handleConversationChange}
      >
        <div className="rounded-full w-[60px] h-[60px] bg-gray-600 col-span-2 row-start-1 col-start-1 row-end-3 flex items-center justify-center text-white">
          {name?.charAt(0).toUpperCase()}
        </div>
        <div className="col-start-3 row-span-1 col-end-9">
          <div className="flex justify-between items-center">
            <p className="text-white text-xl font-semibold">{name}</p>
            <p className="text-gray-400 text-sm">
              {latestMessage?.createdAt
                ? formatDate(latestMessage.createdAt)
                : ""}
            </p>
          </div>
        </div>
        <div className="col-start-3 row-span-1 col-end-9">
          <p className="text-gray-400 text-md truncate max-w-[70%]">
            {user?.id === latestMessage?.senderId ? "You: " : ""}
            {latestMessage?.content || "No messages yet."}
          </p>
        </div>
      </li>
    );
  }
);

Conversation.displayName = "Conversation";

Conversation.propTypes = {
  conversation: PropTypes.shape({
    id: PropTypes.number.isRequired,
    name: PropTypes.string,
    Messages: PropTypes.arrayOf(
      PropTypes.shape({
        createdAt: PropTypes.string,
        senderId: PropTypes.number,
        content: PropTypes.string,
      })
    ),
    Participants: PropTypes.arrayOf(
      PropTypes.shape({
        Users: PropTypes.shape({
          id: PropTypes.number,
          username: PropTypes.string,
        }),
      })
    ),
  }).isRequired,
  changeConversationId: PropTypes.func.isRequired,
  isActive: PropTypes.bool.isRequired,
  onSelectConversation: PropTypes.func.isRequired,
  user: PropTypes.shape({
    id: PropTypes.number,
  }).isRequired,
};

const ConversationList = ({ changeConversationId }) => {
  const [conversations, setConversations] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeConversationId, setActiveConversationId] = useState(null);

  const user = useMemo(() => cookies.get("user"), []);

  const fetchConversations = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const token = cookies.get("token");
      if (!token) throw new Error("Authentication token is missing");

      const response = await fetch("http://localhost:3000/api/conversations", {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to fetch conversations");
      }

      const data = await response.json();
      setConversations(data);

      if (data.length > 0) {
        const firstConvId = data[0].id;
        setActiveConversationId(firstConvId);
        changeConversationId(firstConvId);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, [changeConversationId]);

  useEffect(() => {
    if (user?.id) fetchConversations();
  }, [user?.id, fetchConversations]);

  const handleSelectConversation = useCallback((conversationId) => {
    setActiveConversationId(conversationId);
  }, []);

  if (isLoading) {
    return (
      <div className="p-4 text-center text-gray-400">
        Loading conversations...
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 text-center text-red-500">
        {error}
        <button
          onClick={fetchConversations}
          className="ml-2 bg-blue-500 text-white px-3 py-1 rounded"
        >
          Retry
        </button>
      </div>
    );
  }

  if (conversations.length === 0) {
    return (
      <div className="p-4 text-center text-gray-400">
        No conversations found.
      </div>
    );
  }

  return (
    <div className="p-4 w-full">
      <ul className="flex flex-col gap-1">
        {conversations.map((conversation) => (
          <Conversation
            key={conversation.id}
            conversation={conversation}
            changeConversationId={changeConversationId}
            isActive={activeConversationId === conversation.id}
            onSelectConversation={handleSelectConversation}
            user={user}
          />
        ))}
      </ul>
    </div>
  );
};

ConversationList.propTypes = {
  changeConversationId: PropTypes.func.isRequired,
};

export default ConversationList;
