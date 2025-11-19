import React, { useEffect, useState } from 'react';
import { Client } from '@stomp/stompjs';
import axios from 'axios';
import './ChatRoom.css';

let stompClient = null;

const ChatRoom = ({ username, jwtToken, onLogout }) => {
  const [message, setMessage] = useState('');
  const [groupMessages, setGroupMessages] = useState([]);
  const [privateMessages, setPrivateMessages] = useState([]);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [activeTab, setActiveTab] = useState('GROUP');

  const connect = () => {
    stompClient = new Client({
    //  webSocketFactory: () => new WebSocket('ws://localhost:8080/ws'),
      webSocketFactory: () => new WebSocket(`ws://localhost:8080/ws?token=${jwtToken}`),
      connectHeaders: { Authorization: `Bearer ${jwtToken}` },
      debug: (str) => console.log('[STOMP]', str),
      reconnectDelay: 5000,
      onConnect: onConnected,
      onStompError: (frame) => {
        console.error('STOMP error:', frame);
        alert('WebSocket connection failed. Logging out.');
        onLogout();
      }
    });

    stompClient.activate();
  };

  const onConnected = () => {
    console.log('✅ STOMP connected as', username);

    stompClient.subscribe('/topic/public', (msg) => {
      console.log('📨 Public message received', msg);
      onMessageReceived(msg);
    });

    stompClient.subscribe('/user/queue/messages', (msg) => {
      console.log('📨 Private message received', msg);
      onMessageReceived(msg);
    });

    console.log('✅ STOMP subscriptions set up');

    stompClient.publish({
      destination: '/app/chat.addUser',
      body: JSON.stringify({ sender: username, type: 'JOIN' }),
    });

    console.log(`[WebSocket] Connected as ${username}`);
  };

  const onMessageReceived = (payload) => {
    let msg;
    try {
      msg = JSON.parse(payload.body);
      console.log("📬 Received message", msg);
    } catch (err) {
      console.error("Invalid message:", err);
      return;
    }

    const isPrivate = msg.privateMessage ?? msg.isPrivate ?? false;

    if (msg.type === 'JOIN') {
      msg.content = `${msg.sender} has joined the chat room.`;
      setGroupMessages((prev) => [...prev, msg]);
      return;
    }

    if (isPrivate) {
      if (msg.sender === username || msg.recipient === username) {
        console.log(`[Private] Message from ${msg.sender} to ${msg.recipient}`);
        setPrivateMessages((prev) => [...prev, msg]);
      }
    } else {
      if (msg.sender !== username) { // ✅ prevent self-duplication
        console.log(`[Group] Message from ${msg.sender}`);
        setGroupMessages((prev) => [...prev, msg]);
      } else {
        console.log(`[Group] Ignored own message`);
      }
    }
    
  };

  const sendMessage = () => {
    if (stompClient && stompClient.connected && message.trim()) {
      const isPrivate = activeTab === 'PRIVATE' && !!selectedUser;

      const chatMessage = {
        sender: username,
        content: message,
        type: 'CHAT',
        recipient: isPrivate ? selectedUser : null,
        privateMessage: isPrivate
      };

      console.log(`📤 Sending ${isPrivate ? 'PRIVATE' : 'PUBLIC'} message to ${chatMessage.recipient || 'ALL'}`, chatMessage);

      stompClient.publish({
        destination: '/app/chat.sendMessage',
        body: JSON.stringify(chatMessage),
      });

      if (isPrivate) {
        setPrivateMessages((prev) => [...prev, chatMessage]);
      } else {
        setGroupMessages((prev) => [...prev, chatMessage]);
      }

      setMessage('');
    }
  };

  const fetchOnlineUsers = async () => {
    try {
      const res = await axios.get('http://localhost:8080/users/online', {
        headers: { Authorization: `Bearer ${jwtToken}` }
      });
      console.log("🌐 Online users fetched:", res.data);
      setOnlineUsers(res.data.filter((user) => user !== username));
    } catch (err) {
      console.error('Failed to fetch online users', err);
    }
  };

  useEffect(() => {
    connect();
    fetchOnlineUsers();
    const interval = setInterval(fetchOnlineUsers, 5000);

    return () => {
      clearInterval(interval);
      if (stompClient) stompClient.deactivate();
    };
  }, []);

  const currentMessages =
    activeTab === 'GROUP'
      ? groupMessages
      : privateMessages.filter(
          (msg) =>
            (msg.sender === username && msg.recipient === selectedUser) ||
            (msg.sender === selectedUser && msg.recipient === username)
        );

  return (
    <div className="chat-container">
      <div className="chat-header">
        <h2>
          {activeTab === 'GROUP'
            ? 'Group Chat Room'
            : `Private Chat with ${selectedUser || '...'}`}
        </h2>
        <button onClick={onLogout} className="logout-button">Logout</button>
      </div>

      <div className="chat-tabs">
        <button
          className={activeTab === 'GROUP' ? 'active-tab' : ''}
          onClick={() => {
            setActiveTab('GROUP');
            setSelectedUser(null);
          }}
        >
          Group Chat
        </button>
        <button
          className={activeTab === 'PRIVATE' ? 'active-tab' : ''}
          onClick={() => setActiveTab('PRIVATE')}
        >
          Private Chat
        </button>
      </div>

      
      <div className={`chat-body ${activeTab === 'PRIVATE' ? 'private-mode' : 'group-mode'}`}>

        {activeTab === 'PRIVATE' && (
          <div className="user-list">
            <h4>Private with:</h4>
            {onlineUsers.map((user, i) => (
              <div
                key={i}
                className={`user-item ${selectedUser === user ? 'active-user' : ''}`}
                onClick={() => setSelectedUser(user)}
              >
                {user}
              </div>
            ))}
          </div>
        )}

        <div className="chat-main">
          <div className="chat-messages">
            {currentMessages.length === 0 ? (
              <p className="no-messages">No messages yet...</p>
            ) : (
              currentMessages.map((msg, i) => (
                <div key={i} className="chat-message">
                  {msg.type === 'CHAT' ? (
                    <>
                      <span className="sender">{msg.sender}:</span>
                      <span className="content"> {msg.content}</span>
                    </>
                  ) : (
                    <p className="join-message">{msg.content}</p>
                  )}
                </div>
              ))
            )}
          </div>

          <div className="chat-input-container">
            {activeTab === 'PRIVATE' && selectedUser && (
              <div className="private-label">
                Sending privately to <strong>{selectedUser}</strong>
              </div>
            )}
            <input
              type="text"
              className="chat-input"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
              placeholder="Type your message..."
            />
            <button onClick={sendMessage} className="send-button">Send</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatRoom;
