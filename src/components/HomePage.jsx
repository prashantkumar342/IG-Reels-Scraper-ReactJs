import React, { useEffect, useState, useRef } from "react";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { 
  Heart, 
  MessageCircle, 
  Share, 
  Bookmark, 
  Play, 
  Volume2, 
  VolumeX, 
  X, 
  ChevronLeft, 
  ChevronRight,
  Eye,
  Instagram,
  Calendar
} from "lucide-react";
import axios from "axios";
import { toast } from "sonner";

const {VITE_BACKEND_URL} = import.meta.env;

// Loader component
const Loader = () => (
  <div className="flex flex-col items-center justify-center p-8">
    <div className="relative">
      <div className="w-12 h-12 border-4 border-purple-200 rounded-full animate-spin border-t-purple-600"></div>
      <Instagram className="w-6 h-6 text-purple-600 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" />
    </div>
    <p className="mt-4 text-sm text-gray-600 animate-pulse">Fetching reels...</p>
  </div>
);

function HomePage() {
  const [username, setUsername] = useState("");
  const [reelsData, setReelsData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [limit, setLimit] = useState(6);
  const [showModal, setShowModal] = useState(false);
  const [currentReelIndex, setCurrentReelIndex] = useState(0);
  const [isMuted, setIsMuted] = useState(true);
  const [expandedCaption, setExpandedCaption] = useState(false);
  const videoRef = useRef(null);
  
  const formatNumber = (num) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num?.toLocaleString() || "0";
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: date.getFullYear() !== new Date().getFullYear() ? 'numeric' : undefined
    });
  };

  const handleSubmit = async () => {
    if (!username.trim()) {
      return;
    }
    try {
      setLoading(true);
      setHasSearched(true);
      const response = await axios.get(
        `${VITE_BACKEND_URL}/scrape?username=${username}&limit=${limit}`
      );
      if (response?.status === 200) {
        setReelsData(response?.data?.reels || []);
        
        toast.success("Reels fetched successfully");
      }
    } catch (error) {
      console.error("Error fetching reels:", error);
      toast.error(error.response?.data?.message || "Failed to fetch reels");
    } finally {
      setLoading(false);
    }
  };

  const openModal = (index) => {
    setCurrentReelIndex(index);
    setShowModal(true);
    setExpandedCaption(false);
    document.body.style.overflow = 'hidden';
  };

  const closeModal = () => {
    setShowModal(false);
    setExpandedCaption(false);
    document.body.style.overflow = 'unset';
    if (videoRef.current) {
      videoRef.current.pause();
    }
  };

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const handleScroll = (e) => {
    e.preventDefault();
    if (e.deltaY > 0 && currentReelIndex < reelsData.length - 1) {
      setCurrentReelIndex(currentReelIndex + 1);
      setExpandedCaption(false);
    } else if (e.deltaY < 0 && currentReelIndex > 0) {
      setCurrentReelIndex(currentReelIndex - 1);
      setExpandedCaption(false);
    }
  };

  const navigateReel = (direction) => {
    if (direction === 'next' && currentReelIndex < reelsData.length - 1) {
      setCurrentReelIndex(currentReelIndex + 1);
    } else if (direction === 'prev' && currentReelIndex > 0) {
      setCurrentReelIndex(currentReelIndex - 1);
    }
    setExpandedCaption(false);
  };

  useEffect(() => {
    if (showModal && videoRef.current) {
      videoRef.current.play();
    }
  }, [currentReelIndex, showModal]);

  useEffect(() => {
    const handleKeyPress = (e) => {
      if (!showModal) return;
      
      switch(e.key) {
        case 'Escape':
          closeModal();
          break;
        case 'ArrowUp':
          e.preventDefault();
          navigateReel('prev');
          break;
        case 'ArrowDown':
          e.preventDefault();
          navigateReel('next');
          break;
        case ' ':
          e.preventDefault();
          if (videoRef.current) {
            videoRef.current.paused ? videoRef.current.play() : videoRef.current.pause();
          }
          break;
        case 'm':
        case 'M':
          toggleMute();
          break;
      }
    };

    if (showModal) {
      document.addEventListener('keydown', handleKeyPress);
      return () => {
        document.removeEventListener('keydown', handleKeyPress);
        document.body.style.overflow = 'unset';
      };
    }
  }, [showModal, currentReelIndex]);

  // Claude AI style centered search (before results)
  if (!hasSearched && !loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50 to-pink-50 dark:from-gray-900 dark:via-purple-900/20 dark:to-pink-900/20 flex items-center justify-center p-4">
        <div className="w-full max-w-2xl mx-auto">
          {/* Centered Header */}
          <div className="text-center mb-8 sm:mb-12">
            <div className="flex items-center justify-center gap-3 mb-4">
              <div className="p-3 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl">
                <Instagram className="w-8 h-8 text-white" />
              </div>
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                Reels Explorer
              </h1>
            </div>
            <p className="text-lg text-gray-600 dark:text-gray-400 mb-2">
              Discover amazing content from Instagram
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-500">
              Enter any Instagram username to explore their reels
            </p>
          </div>

          {/* Centered Search Card */}
          <Card className="shadow-xl border-0 bg-white/95 backdrop-blur-sm dark:bg-gray-800/95 rounded-2xl overflow-hidden">
            <CardHeader className="pb-4 pt-8">
              <CardTitle className="text-xl font-semibold text-center flex items-center justify-center gap-3">
                <Avatar className="w-10 h-10">
                  <AvatarFallback className="bg-gradient-to-br from-purple-500 to-pink-500 text-white">
                    IG
                  </AvatarFallback>
                </Avatar>
                Enter Instagram Username
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6 px-8">
              <div className="relative">
                <Input
                  placeholder="@username (without @)"
                  value={username}
                  onChange={(e) => setUsername(e.target.value.replace('@', ''))}
                  className="pl-6 pr-16 h-14 border-2 border-purple-200 focus:border-purple-400 rounded-xl dark:border-purple-700 dark:focus:border-purple-500 transition-colors text-lg"
                  onKeyPress={(e) => e.key === 'Enter' && handleSubmit()}
                />
                <Instagram className="absolute right-5 top-1/2 transform -translate-y-1/2 w-6 h-6 text-gray-400" />
              </div>
              <div className="relative">
                <Input
                  type="number"
                  placeholder="Number of reels (1-50)"
                  value={limit}
                  onChange={(e) => setLimit(Math.max(1, Math.min(50, parseInt(e.target.value) || 6)))}
                  className="pl-6 pr-16 h-14 border-2 border-purple-200 focus:border-purple-400 rounded-xl dark:border-purple-700 dark:focus:border-purple-500 transition-colors text-lg"
                  onKeyPress={(e) => e.key === 'Enter' && handleSubmit()}
                />
              </div>
            </CardContent>
            <CardFooter className="pt-4 pb-8 px-8">
              <Button
                onClick={handleSubmit}
                disabled={!username.trim()}
                className="w-full h-14 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white rounded-xl font-semibold shadow-lg transition-all duration-200 transform hover:scale-[1.02] text-lg"
              >
                <div className="flex items-center gap-3">
                  <Play className="w-5 h-5" />
                  Explore Reels
                </div>
              </Button>
            </CardFooter>
          </Card>

          {/* Bottom hint */}
          <div className="text-center mt-8">
            <p className="text-sm text-gray-500 dark:text-gray-500">
              Make sure the Instagram profile is public for best results
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50 to-pink-50 dark:from-gray-900 dark:via-purple-900/20 dark:to-pink-900/20">
      {/* Fixed Header (after search) */}
      <div className="fixed top-0 left-0 right-0 bg-white/90 backdrop-blur-lg border-b border-purple-100 dark:bg-gray-900/90 dark:border-purple-800 z-30 shadow-sm">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 py-3 sm:py-4">
          <div className="flex items-center justify-between gap-4">
            {/* Logo */}
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="p-1.5 sm:p-2 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg sm:rounded-xl">
                <Instagram className="w-4 h-4 sm:w-6 sm:h-6 text-white" />
              </div>
              <div>
                <h1 className="text-lg sm:text-xl lg:text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                  Reels Scraper
                </h1>
              </div>
            </div>

            {/* Compact Search Section */}
            <div className="flex-1 max-w-md">
              {/* <Card className="shadow-lg border-0 bg-white/95 backdrop-blur-sm dark:bg-gray-800/95"> */}
               
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <Input
                        placeholder="@username"
                        value={username}
                        onChange={(e) => setUsername(e.target.value.replace('@', ''))}
                        className="pl-3 pr-8 h-9 border-2 border-purple-200 focus:border-purple-400 rounded-lg dark:border-purple-700 dark:focus:border-purple-500 transition-colors text-sm"
                        onKeyPress={(e) => e.key === 'Enter' && handleSubmit()}
                      />
                      <Instagram className="absolute right-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    </div>
                    <div className="relative">
                      <Input
                        type="number"
                        placeholder="Limit"
                        value={limit}
                        onChange={(e) => setLimit(Math.max(1, Math.min(50, parseInt(e.target.value) || 6)))}
                        className="pl-3 pr-8 h-9 border-2 border-purple-200 focus:border-purple-400 rounded-lg dark:border-purple-700 dark:focus:border-purple-500 transition-colors text-sm w-24"
                        onKeyPress={(e) => e.key === 'Enter' && handleSubmit()}
                      />
                    </div>
                    <Button
                      onClick={handleSubmit}
                      disabled={loading || !username.trim()}
                      className="h-9 px-4 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white rounded-lg font-medium shadow-lg transition-all duration-200 text-sm"
                    >
                      {loading ? (
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      ) : (
                        <Play className="w-4 h-4" />
                      )}
                    </Button>
                  </div>
               
              {/* </Card> */}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content with proper top padding */}
      <div className="pt-20 sm:pt-24">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 py-4 sm:py-6">
          {/* Loading State */}
          {loading && <Loader />}

          {/* Results Header */}
          {!loading && reelsData.length > 0 && (
            <div className="mb-4 sm:mb-6 lg:mb-8">
              <div className="flex items-center gap-2 sm:gap-3 mb-2 sm:mb-3">
                <Avatar className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12">
                  <AvatarFallback className="bg-gradient-to-br from-purple-500 to-pink-500 text-white">
                    {username.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900 dark:text-white">@{username}</h2>
                  <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">{reelsData.length} reels found</p>
                </div>
              </div>
              <Separator className="bg-gradient-to-r from-purple-200 to-pink-200" />
            </div>
          )}

          {/* Instagram-style Smaller Reels Grid */}
          {!loading && reelsData.length > 0 && (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-1 sm:gap-2 lg:gap-3 mb-6 sm:mb-8">
              {reelsData.map((reel, index) => (
                <Card
                  key={reel.id}
                  className="group cursor-pointer hover:shadow-lg transition-all duration-200 transform hover:scale-[1.02] bg-white/80 backdrop-blur-sm border-0 shadow-sm overflow-hidden dark:bg-gray-800/80 rounded-lg"
                  onClick={() => openModal(index)}
                >
                  <div className="relative aspect-[9/16] overflow-hidden">
                    <img
                      src={reel.thumbnail_url}
                      alt="Reel thumbnail"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
                    
                    {/* Play Overlay */}
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                      <div className="bg-white/20 backdrop-blur-sm rounded-full p-2 sm:p-3">
                        <Play className="w-4 h-4 sm:w-6 sm:h-6 text-white fill-white" />
                      </div>
                    </div>

                    {/* Quick Stats */}
                    <div className="absolute top-1 sm:top-2 left-1 sm:left-2">
                      {reel.views && (
                        <Badge variant="secondary" className="bg-black/60 text-white border-0 backdrop-blur-sm text-xs px-1 py-0.5">
                          <Eye className="w-2 h-2 sm:w-3 sm:h-3 mr-0.5 sm:mr-1" />
                          {formatNumber(reel.views)}
                        </Badge>
                      )}
                    </div>

                    {/* Bottom Stats */}
                    <div className="absolute bottom-0 left-0 right-0 p-1.5 sm:p-2">
                      <div className="flex items-center justify-between text-white text-xs">
                        <div className="flex items-center gap-1 sm:gap-2">
                          <span className="flex items-center gap-0.5 sm:gap-1">
                            <Heart className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                            <span className="text-xs">{formatNumber(reel.likes)}</span>
                          </span>
                          <span className="flex items-center gap-0.5 sm:gap-1">
                            <MessageCircle className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                            <span className="text-xs">{formatNumber(reel.comments)}</span>
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}

          {/* Empty State */}
          {!loading && reelsData.length === 0 && hasSearched && (
            <div className="text-center py-12 sm:py-16">
              <div className="w-16 h-16 sm:w-20 sm:h-20 lg:w-24 lg:h-24 mx-auto mb-4 sm:mb-6 bg-gradient-to-br from-purple-100 to-pink-100 rounded-full flex items-center justify-center">
                <Instagram className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 text-purple-400" />
              </div>
              <h3 className="text-lg sm:text-xl font-semibold text-gray-600 dark:text-gray-400 mb-2">
                No Reels Found
              </h3>
              <p className="text-sm sm:text-base text-gray-500 dark:text-gray-500">
                Try searching for a different username or check if the profile is public
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Enhanced Modal */}
      {showModal && reelsData[currentReelIndex] && (
        <div
          className="fixed inset-0 bg-black/95 backdrop-blur-sm flex items-center justify-center z-50 p-2 sm:p-4"
          onWheel={handleScroll}
        >
          {/* Navigation Controls */}
          <Button
            onClick={closeModal}
            variant="outline"
            size="icon"
            className="absolute top-3 sm:top-6 right-3 sm:right-6 z-60 bg-black/50 border-white/20 text-white hover:bg-black/70 h-8 w-8 sm:h-10 sm:w-10"
          >
            <X className="w-4 h-4 sm:w-5 sm:h-5" />
          </Button>

          {currentReelIndex > 0 && (
            <Button
              onClick={() => navigateReel('prev')}
              variant="outline"
              size="icon"
              className="absolute left-2 sm:left-6 top-1/2 -translate-y-1/2 z-60 bg-black/50 border-white/20 text-white hover:bg-black/70 h-8 w-8 sm:h-10 sm:w-10"
            >
              <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5" />
            </Button>
          )}

          {currentReelIndex < reelsData.length - 1 && (
            <Button
              onClick={() => navigateReel('next')}
              variant="outline"
              size="icon"
              className="absolute right-2 sm:right-6 top-1/2 -translate-y-1/2 z-60 bg-black/50 border-white/20 text-white hover:bg-black/70 h-8 w-8 sm:h-10 sm:w-10"
            >
              <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5" />
            </Button>
          )}

          {/* Main Content */}
          <div className="relative w-full max-w-sm sm:max-w-md mx-auto h-full flex items-center">
            <div className="relative w-full aspect-[9/16] bg-black rounded-lg sm:rounded-xl overflow-hidden shadow-2xl max-h-[85vh]">
              <video
                ref={videoRef}
                src={reelsData[currentReelIndex].video_url}
                controls
                autoPlay
                muted={isMuted}
                className="w-full h-full object-contain"
              />

              {/* Video Controls Overlay */}
              <Button
                onClick={toggleMute}
                variant="outline"
                size="icon"
                className="absolute top-2 sm:top-4 left-2 sm:left-4 bg-black/50 border-white/20 text-white hover:bg-black/70 h-8 w-8 sm:h-10 sm:w-10"
              >
                {isMuted ? <VolumeX className="w-3 h-3 sm:w-4 sm:h-4" /> : <Volume2 className="w-3 h-3 sm:w-4 sm:h-4" />}
              </Button>

              {/* Instagram-style Sidebar */}
              <div className="absolute right-2 sm:right-4 bottom-24 sm:bottom-32 flex flex-col items-center gap-3 sm:gap-4">
                <button className="flex flex-col items-center text-white opacity-60 cursor-not-allowed">
                  <div className="bg-black/30 p-2 sm:p-3 rounded-full backdrop-blur-sm">
                    <Heart className="w-4 h-4 sm:w-5 sm:h-5" />
                  </div>
                  <span className="text-xs mt-1">{formatNumber(reelsData[currentReelIndex].likes)}</span>
                </button>
                
                <button className="flex flex-col items-center text-white opacity-60 cursor-not-allowed">
                  <div className="bg-black/30 p-2 sm:p-3 rounded-full backdrop-blur-sm">
                    <MessageCircle className="w-4 h-4 sm:w-5 sm:h-5" />
                  </div>
                  <span className="text-xs mt-1">{formatNumber(reelsData[currentReelIndex].comments)}</span>
                </button>
                
                <button className="flex flex-col items-center text-white opacity-60 cursor-not-allowed">
                  <div className="bg-black/30 p-2 sm:p-3 rounded-full backdrop-blur-sm">
                    <Share className="w-4 h-4 sm:w-5 sm:h-5" />
                  </div>
                  <span className="text-xs mt-1">Share</span>
                </button>
                
                <button className="flex flex-col items-center text-white opacity-60 cursor-not-allowed">
                  <div className="bg-black/30 p-2 sm:p-3 rounded-full backdrop-blur-sm">
                    <Bookmark className="w-4 h-4 sm:w-5 sm:h-5" />
                  </div>
                </button>
              </div>

              {/* Caption and Info */}
              <div className="absolute bottom-0 left-0 right-12 sm:right-16 p-3 sm:p-6 bg-gradient-to-t from-black/90 via-black/60 to-transparent">
                <div className="text-white space-y-2 sm:space-y-3">
                  <div className="flex items-center gap-2 mb-2">
                    <Avatar className="w-6 h-6 sm:w-8 sm:h-8">
                      <AvatarFallback className="bg-purple-500 text-white text-xs">
                        {username.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <span className="font-semibold text-sm sm:text-base">@{username}</span>
                  </div>
                  
                  <div className="space-y-1 sm:space-y-2">
                    <p className={`text-xs sm:text-sm leading-relaxed ${!expandedCaption ? 'line-clamp-3' : ''}`}>
                      {reelsData[currentReelIndex].caption}
                    </p>
                    
                    {reelsData[currentReelIndex].caption && reelsData[currentReelIndex].caption.length > 150 && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setExpandedCaption(!expandedCaption);
                        }}
                        className="text-white/80 text-xs sm:text-sm font-medium hover:text-white transition-colors"
                      >
                        {expandedCaption ? 'Show less' : 'Show more'}
                      </button>
                    )}
                  </div>
                  
                  <div className="flex items-center justify-between text-xs text-white/80">
                    {reelsData[currentReelIndex].posted_at && (
                      <span className="flex items-center gap-1">
                        <Calendar className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                        {formatDate(reelsData[currentReelIndex].posted_at)}
                      </span>
                    )}
                    {reelsData[currentReelIndex].views && (
                      <span className="flex items-center gap-1">
                        <Eye className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                        {formatNumber(reelsData[currentReelIndex].views)} views
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Reel Counter */}
              <div className="absolute top-2 sm:top-4 right-2 sm:right-4">
                <Badge variant="secondary" className="bg-black/50 text-white border-0 backdrop-blur-sm text-xs">
                  {currentReelIndex + 1} / {reelsData.length}
                </Badge>
              </div>
            </div>
          </div>

          {/* Keyboard Shortcuts Hint */}
          <div className="absolute bottom-3 sm:bottom-6 left-1/2 -translate-x-1/2">
            <Badge variant="outline" className="bg-black/50 border-white/20 text-white/80 text-xs px-2 py-1">
              <span className="hidden sm:inline">Use ↑↓ arrows to navigate • Space to play/pause • M to mute • Esc to close</span>
              <span className="sm:hidden">↑↓ navigate • Space play/pause • Esc close</span>
            </Badge>
          </div>
        </div>
      )}
    </div>
  );
}

export default HomePage;