import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Header from "../common/Header";
import Footer from "../common/Footer";
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

const Blogs: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchBlogs();
  }, []);

  useEffect(() => {
    const key = location.state?.scrollTo;
    if (!key) return;

    const targetId = key === "blogs" ? "blogs-section" : undefined;
    if (targetId) {
      document.getElementById(targetId)?.scrollIntoView({ behavior: "smooth" });
    }
  }, [location]);

  const fetchBlogs = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('Blog_data')
        .select('*')
        .order('Time', { ascending: false });

      if (error) throw error;

      setBlogs(data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      console.error('Error fetching blogs:', err);
    } finally {
      setLoading(false);
    }
  };

  const extractExcerpt = (content: string, maxLength: number = 150) => {
    // Remove HTML tags and extract plain text
    const stripped = content.replace(/<[^>]*>/g, '');
    return stripped.length > maxLength
      ? stripped.substring(0, maxLength) + '...'
      : stripped;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-gray-50">
        <Header />
        <main className="flex-grow flex items-center justify-center">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            <p className="mt-4 text-gray-600">Loading blogs...</p>
          </div>
        </main>
        <div className="hidden md:block">
          <Footer />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col bg-gray-50">
        <Header />
        <main className="flex-grow flex items-center justify-center">
          <div className="text-center text-red-600">
            <p className="text-xl font-semibold">Error loading blogs</p>
            <p className="mt-2">{error}</p>
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
      <Header />

      <main
        id="blogs-section"
        className="flex-grow max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10"
      >
        <h1 className="text-3xl font-bold text-gray-800 mb-8">Our Blogs</h1>

        {blogs.length === 0 ? (
          <div className="text-center text-gray-600 py-10">
            <p className="text-xl">No blogs found</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {blogs.map((blog) => (
              <div
                key={blog.id}
                className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow"
              >
                <img
                  src={blog.Image || "https://source.unsplash.com/600x400/?real-estate"}
                  alt={blog.Niche}
                  className="h-48 w-full object-cover"
                  onError={(e) => {
                    e.currentTarget.src = "https://source.unsplash.com/600x400/?real-estate";
                  }}
                />
                <div className="p-5">
                  <h2 className="text-xl font-semibold text-gray-800 mb-2">
                    {blog.Niche}
                  </h2>
                  <p className="text-gray-600 text-sm mb-4">
                    {extractExcerpt(blog.Content)}
                  </p>
                  <button
                    className="text-primary font-medium hover:underline"
                    onClick={() => navigate(`/blogs/${blog.id}`, { state: blog })}
                  >
                    Read More →
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      <div className="hidden md:block">
        <Footer />
      </div>
    </div>
  );
};

export default Blogs;