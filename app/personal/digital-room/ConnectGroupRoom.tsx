'use client';

import { useState } from 'react';

interface Message {
  id: number;
  sender: 'me' | 'other';
  text: string;
}

interface Contact {
  id: number;
  name: string;
  avatar: string;
  lastMessage: string;
  time: string;
  messages: Message[];
}

const ConnectGroup = () => {
  const [contacts, setContacts] = useState<Contact[]>([
    {
      id: 1,
      name: 'Alice',
      avatar: 'https://i.pravatar.cc/150?img=1',
      lastMessage: 'See you later!',
      time: '10:45 AM',
      messages: [
        { id: 1, sender: 'other', text: 'Hey! How are you?' },
        { id: 2, sender: 'me', text: 'I’m good, thanks! You?' },
        { id: 3, sender: 'other', text: 'See you later!' },
      ],
    },
    {
      id: 2,
      name: 'Bob',
      avatar: 'https://i.pravatar.cc/150?img=2',
      lastMessage: 'Got the notes?',
      time: 'Yesterday',
      messages: [
        { id: 1, sender: 'me', text: 'Hey Bob, need the class notes?' },
        { id: 2, sender: 'other', text: 'Yes please!' },
      ],
    },
    {
      id: 3,
      name: 'Charlie',
      avatar: 'https://i.pravatar.cc/150?img=3',
      lastMessage: 'Let’s meet at 5',
      time: 'Mon',
      messages: [
        { id: 1, sender: 'other', text: 'Let’s meet at 5' },
      ],
    },
  ]);

  const [activeContactId, setActiveContactId] = useState<number>(1);
  const activeContact = contacts.find(c => c.id === activeContactId)!;

  const [newMessage, setNewMessage] = useState('');

  const sendMessage = () => {
    if (!newMessage.trim()) return;

    const myMsg: Message = {
      id: Date.now(),
      sender: 'me',
      text: newMessage.trim(),
    };

    setContacts(prev =>
      prev.map(contact =>
        contact.id === activeContactId
          ? {
              ...contact,
              messages: [...contact.messages, myMsg],
              lastMessage: myMsg.text,
              time: 'Now',
            }
          : contact
      )
    );

    setNewMessage('');

    // Auto-reply
    setTimeout(() => {
      const reply: Message = {
        id: Date.now(),
        sender: 'other',
        text: 'Got your message!',
      };
      setContacts(prev =>
        prev.map(contact =>
          contact.id === activeContactId
            ? {
                ...contact,
                messages: [...contact.messages, reply],
                lastMessage: reply.text,
                time: 'Now',
              }
            : contact
        )
      );
    }, 1000);
  };

  return (
    <div className="flex h-screen border rounded-lg overflow-hidden">
      {/* Sidebar */}
      <div className="w-1/3 border-r bg-white overflow-y-auto">
        {contacts.map(contact => (
          <div
            key={contact.id}
            onClick={() => setActiveContactId(contact.id)}
            className={`flex items-center p-3 cursor-pointer hover:bg-gray-100 ${
              contact.id === activeContactId ? 'bg-gray-200' : ''
            }`}
          >
            <img
              src={contact.avatar}
              alt={contact.name}
              className="w-12 h-12 rounded-full mr-3"
            />
            <div className="flex-1">
              <div className="flex justify-between">
                <span className="font-semibold">{contact.name}</span>
                <span className="text-xs text-gray-500">{contact.time}</span>
              </div>
              <p className="text-sm text-gray-600 truncate">
                {contact.lastMessage}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Chat area */}
      <div className="flex flex-col flex-1">
        {/* Header */}
        <div className="p-4 bg-blue-600 text-white font-bold">
          {activeContact.name}
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50">
          {activeContact.messages.map(msg => (
            <div
              key={msg.id}
              className={`flex ${msg.sender === 'me' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`px-4 py-2 rounded-lg max-w-xs ${
                  msg.sender === 'me'
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-200 text-gray-800'
                }`}
              >
                {msg.text}
              </div>
            </div>
          ))}
        </div>

        {/* Input */}
        <div className="p-3 border-t flex items-center space-x-2">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
            placeholder="Type a message..."
            className="flex-1 border rounded-lg px-3 py-2 focus:outline-none focus:ring focus:border-blue-300"
          />
          <button
            onClick={sendMessage}
            className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition"
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
}


export default ConnectGroup;