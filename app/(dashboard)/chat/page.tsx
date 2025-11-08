'use client';

import React from 'react';
import ChatBox from '../../components/ChatBox';

export default function ChatPage() {
  return (
    <div className="space-y-6 sm:space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-2">
            AI Chat Assistant
          </h1>
          <p className="text-gray-700 text-sm sm:text-base lg:text-lg">
            Ask questions about Pakistan's 2023 Census data
          </p>
        </div>
      </div>

      <div className="w-full">
        <ChatBox />
      </div>
    </div>
  );
}

