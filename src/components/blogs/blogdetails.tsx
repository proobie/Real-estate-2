import React, { useEffect, useState } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import Header from "../common/Header";
import Footer from "../common/Footer";
import { Helmet } from 'react-helmet-async';
import { supabase } from "../../supabaseClient";

interface Blog {
  id: string;
  Niche: string;
  Keywords: string;
  Titles: string;
  Content: string;
  Image: string;
  Time: string;
  linkedin?: string;
  FaceBook?: string;
}

interface RecentBlog {
  id: string;
  Niche: string;
  Time: string;
  Image: string;
}

const BlogDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const location = useLocation();
  const navigate = useNavigate();

  const [blog, setBlog] = useState<Blog | null>(location.state);
  const [recentBlogs, setRecentBlogs] = useState<RecentBlog[]>([]);
  const [loading, setLoading] = useState(!location.state);
  const [error, setError] = useState<string | null>(null);
  const [showSidebar, setShowSidebar] = useState(false);
  const [copied, setCopied] = useState(false);


  useEffect(() => {
    if (!location.state && id) {
      fetchBlog();
    }
    fetchRecentBlogs();
  }, [id, location.state]);

  const fetchBlog = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('Blog_data')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      setBlog(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      console.error('Error fetching blog:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchRecentBlogs = async () => {
    try {
      const { data, error } = await supabase
        .from('Blog_data')
        .select('id, Niche, Time, Image')
        .order('Time', { ascending: false })
        .limit(5);

      if (error) throw error;
      setRecentBlogs(data || []);
    } catch (err) {
      console.error('Error fetching recent blogs:', err);
    }
  };

  const extractDescription = (html: string, maxLength: number = 160) => {
    const stripped = html.replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim();
    return stripped.length > maxLength
      ? stripped.substring(0, maxLength) + '...'
      : stripped;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-gray-50">
        <Helmet>
          <title>Loading... | LotLite Property</title>
        </Helmet>
        <Header />
        <main className="flex-grow flex items-center justify-center">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            <p className="mt-4 text-gray-600">Loading blog...</p>
          </div>
        </main>
        <div className="hidden md:block">
          <Footer />
        </div>
      </div>
    );
  }

  if (error || !blog) {
    return (
      <div className="min-h-screen flex flex-col bg-gray-50">
        <Helmet>
          <title>Blog Not Found | LotLite Property</title>
        </Helmet>
        <Header />
        <main className="flex-grow flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-xl font-semibold text-gray-700 mb-2">
              {error || 'Blog not found'}
            </h2>
            <button
              onClick={() => navigate("/blogs")}
              className="mt-4 px-4 py-2 bg-primary text-white rounded-lg shadow hover:bg-primary/90"
            >
              Back to Blogs
            </button>
          </div>
        </main>
        <div className="hidden md:block">
          <Footer />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Helmet>
        <title>{blog.Niche} | LotLite Property</title>
        <meta name="description" content={extractDescription(blog.Content)} />
        <meta name="keywords" content={blog.Keywords} />
        <meta property="og:type" content="article" />
        <meta property="og:title" content={blog.Niche} />
        <meta property="og:description" content={extractDescription(blog.Content)} />
        <meta property="og:image" content={blog.Image} />
        <meta property="og:url" content={window.location.href} />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={blog.Niche} />
        <meta name="twitter:description" content={extractDescription(blog.Content)} />
        <meta name="twitter:image" content={blog.Image} />
        <meta property="article:published_time" content={blog.Time} />
      </Helmet>

      <Header />

      <main className="flex-grow max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Main Content */}
          <div className="flex-1 lg:w-2/3">
            <button
              onClick={() => navigate("/blogs")}
              className="mb-6 flex items-center text-primary hover:text-primary/80 transition-colors"
            >
              <svg
                className="w-5 h-5 mr-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 19l-7-7 7-7"
                />
              </svg>
              Back to Blogs
            </button>

            <img
              src={blog.Image || "https://source.unsplash.com/800x400/?real-estate"}
              alt={blog.Niche}
              className="w-full h-64 md:h-96 object-cover rounded-lg mb-6 shadow-lg"
              onError={(e) => {
                e.currentTarget.src = "https://source.unsplash.com/800x400/?real-estate";
              }}
            />

            <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">
              {blog.Titles}
            </h1>

            <div className="flex items-center gap-4 text-sm text-gray-500 mb-6 pb-6 border-b">
              <span>{formatDate(blog.Time)}</span>
            </div>

            <div
              className="prose prose-lg prose-headings:text-gray-900 prose-headings:font-bold prose-p:text-gray-700 prose-a:text-primary prose-a:no-underline hover:prose-a:underline prose-strong:text-gray-900 prose-ul:text-gray-700 prose-ol:text-gray-700 max-w-none"
              dangerouslySetInnerHTML={{ __html: blog.Content }}
            />
          </div>

          {/* Sidebar */}
          <aside className="lg:w-1/3">
            {/* Mobile Toggle */}
            <div className="lg:hidden mb-6">
              <button
                onClick={() => setShowSidebar((prev) => !prev)}
                className="flex items-center justify-center w-full px-4 py-2 bg-primary text-white font-medium rounded-xl shadow-md hover:bg-primary/90 transition-all"
              >
                {showSidebar ? "Hide Sidebar ▲" : "Show Sidebar ▼"}
              </button>
            </div>

            {/* Sidebar Content */}
            {(showSidebar || (typeof window !== "undefined" && window.innerWidth >= 1024)) && (
              <div className="space-y-8 lg:sticky lg:top-6 transition-all duration-300">
                {/* Recent Blogs */}
                <div className="bg-white/90 backdrop-blur-md border border-gray-100 rounded-2xl shadow-lg p-6 max-h-[65vh] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 hover:scrollbar-thumb-gray-400 transition-all">
                  <h3 className="text-2xl font-bold text-gray-800 mb-5 flex items-center justify-between">
                    <span>Recent Posts</span>
                    <div className="h-[2px] flex-1 ml-3 bg-gradient-to-r from-primary/80 to-transparent"></div>
                  </h3>

                  <div className="space-y-5">
                    {recentBlogs.map((recentBlog) => (
                      <div
                        key={recentBlog.id}
                        onClick={() => {
                          navigate(`/blogs/${recentBlog.id}`);
                          window.scrollTo({ top: 0, behavior: 'smooth' });
                        }}
                        className={`flex gap-4 items-center cursor-pointer group rounded-xl p-2 transition-all hover:bg-gray-50 ${recentBlog.id === blog.id ? 'opacity-60 pointer-events-none' : ''
                          }`}
                      >
                        <div className="relative">
                          <img
                            src={recentBlog.Image || "https://source.unsplash.com/100x100/?real-estate"}
                            alt={recentBlog.Niche}
                            className="w-20 h-20 object-cover rounded-xl shadow-sm group-hover:scale-105 transition-transform"
                            onError={(e) => {
                              e.currentTarget.src = "https://source.unsplash.com/100x100/?real-estate";
                            }}
                          />
                          <div className="absolute inset-0 rounded-xl bg-black/0 group-hover:bg-black/10 transition"></div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="text-sm font-semibold text-gray-800 group-hover:text-primary transition-colors line-clamp-2">
                            {recentBlog.Niche}
                          </h4>
                          <p className="text-xs text-gray-500 mt-1">
                            {formatDate(recentBlog.Time)}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>

                  <button
                    onClick={() => navigate("/blogs")}
                    className="w-full mt-6 px-5 py-2.5 text-primary border border-primary rounded-xl hover:bg-primary hover:text-white font-medium transition-all duration-300 shadow-sm"
                  >
                    View All Blogs
                  </button>
                </div>

                {/* Share Section */}
                <div className="bg-white/90 backdrop-blur-md border border-gray-100 rounded-2xl shadow-lg p-6 transition-all hover:shadow-xl">
                  <h3 className="text-2xl font-bold text-gray-800 mb-5 flex items-center justify-between">
                    <span>Share This Article</span>
                    <div className="h-[2px] flex-1 ml-3 bg-gradient-to-r from-primary/80 to-transparent"></div>
                  </h3>

                  <div className="flex flex-col gap-3">
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(window.location.href);
                        setCopied(true);
                        setTimeout(() => setCopied(false), 2000);
                      }}
                      className="flex items-center gap-3 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-all"
                    >
                      <svg className="w-5 h-5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                        />
                      </svg>
                      Copy Link
                    </button>
                    {copied && (
                      <p className="text-sm text-green-600 mt-2"> Link copied!</p>
                    )}
                    <a
                      href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(window.location.href)}&text=${encodeURIComponent(blog.Niche)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-3 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-all"
                    >
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M23 3a10.9 10.9 0 01-3.14 1.53A4.48 4.48 0 0012.9 8v1A10.66 10.66 0 013 4s-4 9 5 13a11.64 11.64 0 01-7 2c9 5 20 0 20-11.5A4.5 4.5 0 0023 3z" />
                      </svg>
                      Share on Twitter
                    </a>

                    <a
                      href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-3 px-4 py-2 bg-blue-700 hover:bg-blue-800 text-white rounded-lg transition-all"
                    >
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M24 12.073c0-6.627-5.373-12-12-12S0 5.446 0 12.073c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953h-1.516c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                      </svg>
                      Share on Facebook
                    </a>
                  </div>
                </div>
              </div>
            )}
          </aside>


        </div>
      </main>

      <div className="hidden md:block">
        <Footer />
      </div>
    </div>
  );
};

export default BlogDetails;