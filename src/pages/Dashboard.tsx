import React from "react";
import { useAuth } from "@/context/AuthContext";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ShoppingBag, Sparkles, Clock, Heart, ArrowRight, User as UserIcon, Truck } from "lucide-react";
import { Link } from "react-router-dom";
import { useStorage } from "@/context/StorageContext";

const Dashboard = () => {
  const { savedImages, cartItems } = useStorage();
  const { user, login } = useAuth(); // Assuming login updates the user state in context

  const handleProfileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async () => {
      const base64 = reader.result as string;
      try {
        const response = await fetch("http://localhost:5000/api/user/profile", {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${localStorage.getItem("token")}`
          },
          body: JSON.stringify({ profilePicture: base64 })
        });
        const data = await response.json();
        if (data.success) {
          // Update local user state
          const updatedUser = { ...user, ...data.user };
          login(localStorage.getItem("token") || "", updatedUser); // Reuse login to update context
        }
      } catch (err) {
        console.error("Profile upload failed", err);
      }
    };
    reader.readAsDataURL(file);
  };

  // Always fetch fresh from Grok API — no defaults
  const [trendingStyles, setTrendingStyles] = React.useState<any[]>([]);

  // Fetch fresh trending styles on every page load
  React.useEffect(() => {
    const fetchTrends = async () => {
      try {
        const response = await fetch("http://localhost:5000/api/trending");
        if (response.ok) {
          const data = await response.json();
          if (Array.isArray(data) && data.length > 0) {
            setTrendingStyles(data);
          }
        }
      } catch (error) {
        console.error("Failed to fetch trending styles", error);
      }
    };

    fetchTrends();
  }, []);

  const recentActivity = savedImages.slice(0, 3); // Show last 3 generated images

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />

      <main className="flex-1 py-12 px-6">
        <div className="max-w-7xl mx-auto space-y-12">
          {/* Welcome Section */}
          <section className="animate-fade-in flex items-center justify-between">
            <div>
              <h1 className="font-serif text-3xl md:text-4xl font-semibold text-foreground mb-2">
                Welcome back, <span className="text-gradient-gold">{user?.name || user?.email?.split('@')[0] || 'Fashionista'}</span>
              </h1>
              <p className="text-muted-foreground">
                Manage your generated styles and collections.
              </p>
            </div>
          </section>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 animate-slide-up" style={{ animationDelay: "100ms" }}>
            <Card className="bg-surface-elevated/50 backdrop-blur-sm border-white/10 hover:border-accent/30 transition-all duration-300">
              <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                <CardTitle className="text-sm font-medium text-muted-foreground">User Profile</CardTitle>
                <div className="relative group cursor-pointer">
                  <label htmlFor="profile-upload" className="cursor-pointer">
                    {user?.profilePicture ? (
                      <img src={user.profilePicture} alt="Profile" className="w-8 h-8 rounded-full object-cover border border-white/20" />
                    ) : (
                      <UserIcon className="w-6 h-6 text-purple-400 group-hover:text-purple-300 transition-colors" />
                    )}
                    <input id="profile-upload" type="file" className="hidden" accept="image/*" onChange={handleProfileUpload} />
                  </label>
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-sm font-bold text-foreground truncate">{user?.name || user?.email || 'Guest'}</div>
                <div className="flex gap-2 text-xs text-muted-foreground mt-1">
                  <span>{user?.height || '-'}</span>
                  <span>•</span>
                  <span>{user?.weight || '-'}</span>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-surface-elevated/50 backdrop-blur-sm border-white/10 hover:border-accent/30 transition-all duration-300">
              <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                <CardTitle className="text-sm font-medium text-muted-foreground">Total Designs</CardTitle>
                <Sparkles className="w-4 h-4 text-accent" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-foreground">{savedImages.length}</div>
                <p className="text-xs text-muted-foreground mt-1">Generated so far</p>
              </CardContent>
            </Card>

            <Card className="bg-surface-elevated/50 backdrop-blur-sm border-white/10 hover:border-accent/30 transition-all duration-300">
              <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                <CardTitle className="text-sm font-medium text-muted-foreground">Saved Items</CardTitle>
                <Heart className="w-4 h-4 text-pink-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-foreground">{savedImages.filter(img => img.url).length}</div>
                <p className="text-xs text-muted-foreground mt-1">Available in Gallery</p>
              </CardContent>
            </Card>

            <Link to="/cart">
              <Card className="bg-surface-elevated/50 backdrop-blur-sm border-white/10 hover:border-accent/30 transition-all duration-300 cursor-pointer hover:bg-white/5">
                <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                  <CardTitle className="text-sm font-medium text-muted-foreground">In Cart</CardTitle>
                  <ShoppingBag className="w-4 h-4 text-blue-400" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-foreground">{cartItems.length}</div>
                  <p className="text-xs text-muted-foreground mt-1">Ready for checkout</p>
                </CardContent>
              </Card>
            </Link>

            <Link to="/tracking">
              <Card className="bg-surface-elevated/50 backdrop-blur-sm border-white/10 hover:border-accent/30 transition-all duration-300 cursor-pointer hover:bg-white/5">
                <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Order Status</CardTitle>
                  <Truck className="w-4 h-4 text-green-400" />
                </CardHeader>
                <CardContent>
                  <div className="text-lg font-bold text-foreground">In Stitching</div>
                  <p className="text-xs text-muted-foreground mt-1">Est. Delivery: Feb 10</p>
                </CardContent>
              </Card>
            </Link>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Recent Activity */}
            <div className="lg:col-span-3 space-y-6 animate-slide-up" style={{ animationDelay: "200ms" }}>
              <div className="flex items-center justify-between">
                <h2 className="font-serif text-xl font-semibold">Recent Generations</h2>
                <Link to="/gallery">
                  <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">View All</Button>
                </Link>
              </div>

              <div className="flex gap-4 overflow-x-auto pb-4 -mx-2 px-2 md:-mx-0 md:px-0">
                {savedImages.length > 0 ? savedImages.slice(0, 5).map((activity, idx) => (
                  <Link to={`/gallery`} key={idx} className="block group">
                    <div className="min-w-[180px] w-[180px] bg-surface-elevated/30 rounded-xl border border-white/5 overflow-hidden transition-all duration-300 group-hover:border-accent/50 group-hover:bg-surface-elevated/50">
                      <div className="aspect-[3/4] w-full overflow-hidden bg-accent/5">
                        {activity.url ? (
                          <img
                            src={activity.url}
                            alt={activity.label}
                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                            <Sparkles className="w-8 h-8 opacity-20" />
                          </div>
                        )}
                      </div>
                      <div className="p-3">
                        <p className="text-sm font-medium text-foreground truncate">{activity.label || "Untitled"}</p>
                        <p className="text-xs text-muted-foreground truncate opacity-70 mt-0.5">{activity.description || "Generated Outfit"}</p>
                      </div>
                    </div>
                  </Link>
                )) : (
                  <div className="w-full py-12 text-center bg-surface-elevated/30 rounded-xl border border-white/5 border-dashed">
                    <p className="text-muted-foreground">No recent designs. Start creating!</p>
                    <Link to="/generate">
                      <Button variant="link" className="text-accent">Go to Generator</Button>
                    </Link>
                  </div>
                )}
              </div>
            </div>

            {/* Trending Styles - Full Width Horizontal Scroll */}
            <div className="lg:col-span-3 space-y-6 animate-slide-up" style={{ animationDelay: "300ms" }}>
              <div className="flex items-center justify-between">
                <h2 className="font-serif text-xl font-semibold">Trending Now</h2>
                <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">Explore</Button>
              </div>
              <div
                className="flex gap-4 overflow-x-auto pb-4 -mx-2 px-2 md:-mx-0 md:px-0 snap-x snap-mandatory"
                style={{ scrollbarWidth: 'thin', scrollbarColor: 'rgba(255,255,255,0.15) transparent' }}
              >
                {trendingStyles.length > 0 ? trendingStyles.map((style) => (
                  <div
                    key={style.id}
                    className="group relative min-w-[220px] w-[220px] md:min-w-[240px] md:w-[240px] flex-shrink-0 overflow-hidden rounded-xl cursor-pointer snap-start border border-white/5 hover:border-accent/40 transition-all duration-300"
                  >
                    <div className="aspect-[3/4] w-full overflow-hidden bg-surface-elevated/30">
                      <img
                        src={style.image}
                        alt={style.title}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                        loading="lazy"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = `https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=400&h=500&fit=crop`;
                        }}
                      />
                    </div>
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent opacity-100" />
                    <div className="absolute bottom-0 left-0 right-0 p-4">
                      <p className="text-white font-semibold text-sm mb-0.5">{style.title}</p>
                      {style.tag && (
                        <p className="text-[10px] text-accent/80 mb-1.5 truncate">{style.tag}</p>
                      )}
                      <div className="flex items-center gap-1.5 text-xs text-white/70">
                        <Heart className="w-3 h-3 text-red-400 fill-red-400" /> {style.likes} likes
                      </div>
                    </div>
                  </div>
                )) : (
                  // Loading skeletons while fetching from Grok
                  Array.from({ length: 6 }).map((_, idx) => (
                    <div key={idx} className="min-w-[220px] w-[220px] md:min-w-[240px] md:w-[240px] flex-shrink-0 rounded-xl border border-white/5 overflow-hidden">
                      <div className="aspect-[3/4] w-full bg-surface-elevated/30 animate-pulse" />
                      <div className="p-4 space-y-2">
                        <div className="h-3 w-3/4 bg-white/10 rounded animate-pulse" />
                        <div className="h-2 w-1/2 bg-white/5 rounded animate-pulse" />
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <section className="animate-slide-up" style={{ animationDelay: "400ms" }}>
            <div className="bg-gradient-to-r from-accent/20 to-purple-500/20 rounded-2xl p-8 border border-white/10 flex flex-col md:flex-row items-center justify-between gap-6">
              <div>
                <h2 className="font-serif text-2xl font-semibold mb-2">Ready to create something new?</h2>
                <p className="text-muted-foreground">Use our AI to generate your next favorite outfit.</p>
              </div>
              <Link to="/generate">
                <Button size="lg" className="bg-foreground text-background hover:bg-foreground/90">
                  Start Generating <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
            </div>
          </section>

        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Dashboard;
