import React from 'react';
import { Link } from '@tanstack/react-router';

export function Onboarding() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900 p-4">
      <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">Welcome to EducationPlus!</h1>
      <p className="text-lg text-gray-700 dark:text-gray-300 mb-8 text-center">
        Your journey to knowledge starts here.
      </p>
      <Link to="/dashboard" className="px-6 py-3 bg-blue-600 text-white rounded-lg shadow-md hover:bg-blue-700 transition duration-300">
        Get Started
      </Link>
    </div>
  );
}
