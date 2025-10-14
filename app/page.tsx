"use client";

import Link from "next/link";

export default function HomePage() {
  const recentProjects = [
    {
      id: "1",
      name: "Product Demo Video",
      thumbnail: null,
      duration: 45,
      updatedAt: "2 hours ago",
    },
    {
      id: "2",
      name: "Tutorial Series - Episode 1",
      thumbnail: null,
      duration: 180,
      updatedAt: "1 day ago",
    },
  ];

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      {/* Header */}
      <div className="border-b border-gray-800">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-pink-600 bg-clip-text text-transparent">
              VIDIT
            </h1>
            <div className="flex items-center gap-4">
              <Link
                href="/editor"
                className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded transition-colors"
              >
                <span className="text-xl">+</span>
                New Project
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-6 py-12">
        {/* Hero Section */}
        <div className="max-w-4xl mb-16">
          <h2 className="text-5xl font-bold mb-4">
            Create stunning videos with AI
          </h2>
          <p className="text-xl text-gray-400 mb-8">
            VIDIT is your all-in-one AI-powered video editing platform. Edit, enhance,
            and publish to all your social media channels.
          </p>
          <div className="flex gap-4">
            <Link
              href="/editor"
              className="flex items-center gap-2 px-6 py-3 bg-purple-600 hover:bg-purple-700 rounded-lg text-lg font-semibold transition-colors"
            >
              <span className="text-xl">+</span>
              Create New Project
            </Link>
            <button className="px-6 py-3 bg-gray-800 hover:bg-gray-700 rounded-lg text-lg font-semibold transition-colors">
              Watch Demo
            </button>
          </div>
        </div>

        {/* Features */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
          <div className="p-6 bg-gray-900 border border-gray-800 rounded-lg">
            <div className="w-12 h-12 bg-purple-600/20 rounded-lg flex items-center justify-center mb-4 text-2xl">
              📹
            </div>
            <h3 className="text-lg font-semibold mb-2">Vitor Editor</h3>
            <p className="text-gray-400 text-sm">
              Professional multi-track timeline with frame-by-frame precision editing
            </p>
          </div>

          <div className="p-6 bg-gray-900 border border-gray-800 rounded-lg">
            <div className="w-12 h-12 bg-purple-600/20 rounded-lg flex items-center justify-center mb-4 text-2xl">
              🤖
            </div>
            <h3 className="text-lg font-semibold mb-2">Vaia AI Assistant</h3>
            <p className="text-gray-400 text-sm">
              AI-powered chatbot to help with scripts, ideas, and editing suggestions
            </p>
          </div>

          <div className="p-6 bg-gray-900 border border-gray-800 rounded-lg">
            <div className="w-12 h-12 bg-purple-600/20 rounded-lg flex items-center justify-center mb-4 text-2xl">
              🚀
            </div>
            <h3 className="text-lg font-semibold mb-2">Vport Publishing</h3>
            <p className="text-gray-400 text-sm">
              Publish to YouTube, Instagram, TikTok, and more with one click
            </p>
          </div>
        </div>

        {/* Recent Projects */}
        {recentProjects.length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-semibold">Recent Projects</h3>
              <Link
                href="/projects"
                className="text-purple-400 hover:text-purple-300 text-sm"
              >
                View all
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {recentProjects.map((project) => (
                <Link
                  key={project.id}
                  href={`/editor?project=${project.id}`}
                  className="group bg-gray-900 border border-gray-800 rounded-lg overflow-hidden hover:border-purple-500 transition-all"
                >
                  <div className="aspect-video bg-gray-950 flex items-center justify-center text-4xl">
                    {project.thumbnail ? (
                      <img
                        src={project.thumbnail}
                        alt={project.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span className="text-gray-700">📹</span>
                    )}
                  </div>
                  <div className="p-4">
                    <h4 className="font-medium mb-2 group-hover:text-purple-400 transition-colors">
                      {project.name}
                    </h4>
                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <span className="flex items-center gap-1">
                        🕐 {Math.floor(project.duration / 60)}:
                        {(project.duration % 60).toString().padStart(2, "0")}
                      </span>
                      <span>{project.updatedAt}</span>
                    </div>
                  </div>
                </Link>
              ))}

              {/* Create New Card */}
              <Link
                href="/editor"
                className="bg-gray-900 border-2 border-dashed border-gray-800 rounded-lg flex flex-col items-center justify-center aspect-video hover:border-purple-500 transition-all group"
              >
                <span className="text-5xl text-gray-600 group-hover:text-purple-400 mb-2">+</span>
                <span className="text-gray-600 group-hover:text-purple-400 text-sm font-medium">
                  New Project
                </span>
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
