import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { BookOpen, Timer, Trophy, TrendingUp, Users, Zap, Star, ArrowRight, Play } from 'lucide-react';

import { AuthModal } from "@/components/AuthModal";
import { AuthDebugger } from './AuthDebugger';

const ReadRiseLanding = () => {
  const [scrollY, setScrollY] = useState(0);
  const [currentFeature, setCurrentFeature] = useState(0);
  // Enhanced AuthModal state
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authModalMode, setAuthModalMode] = useState<'login' | 'signup'>('login');

  // Handlers for opening modal in the correct mode
  const openLoginModal = () => {
    setAuthModalMode('login');
    setShowAuthModal(true);
  };
  const openSignupModal = () => {
    setAuthModalMode('signup');
    setShowAuthModal(true);
  };

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentFeature((prev) => (prev + 1) % 3);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const features = [
    {
      icon: Timer,
      title: "Focus Sessions",
      description: "Distraction-free reading with customizable timers",
      color: "from-blue-500 to-cyan-500"
    },
    {
      icon: Trophy,
      title: "Reading Achievements",
      description: "Unlock badges and level up your reading journey",
      color: "from-purple-500 to-pink-500"
    },
    {
      icon: TrendingUp,
      title: "Progress Tracking",
      description: "Visualize your reading growth with beautiful analytics",
      color: "from-orange-500 to-red-500"
    }
  ];

  const testimonials = [
    { name: "Sarah Chen", role: "Student", quote: "ReadRise helped me finish 12 books this semester!", avatar: "SC" },
    { name: "Mark Rivera", role: "Professional", quote: "The focus timer is a game-changer for my daily reading habit.", avatar: "MR" },
    { name: "Lisa Park", role: "Book Blogger", quote: "Finally, an app that makes reading feel like an adventure!", avatar: "LP" }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white overflow-hidden">
      {/* Animated Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute top-3/4 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-3/4 w-48 h-48 bg-pink-500/10 rounded-full blur-3xl animate-pulse delay-2000"></div>
      </div>

      {/* Header */}
      <header className="relative z-10 px-6 py-4">
        <nav className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
              <BookOpen className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              ReadRise
            </span>
          </div>
          <div className="hidden md:flex items-center space-x-8">
            <a href="#features" className="text-gray-300 hover:text-white transition-colors">Features</a>
            <a href="#how-it-works" className="text-gray-300 hover:text-white transition-colors">How it Works</a>
            <a href="#testimonials" className="text-gray-300 hover:text-white transition-colors">Reviews</a>
            <Button className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700" onClick={openLoginModal}>
              Login
            </Button>
            <Button variant="outline" className="border-purple-500/50 text-purple-300 hover:bg-purple-500/10" onClick={openSignupModal}>
              Sign Up
            </Button>
          </div>
        </nav>
        {/* Auth Modal (single instance, mode switching) */}
        <AuthModal 
          open={showAuthModal}
          onClose={() => setShowAuthModal(false)}
          mode={authModalMode}
        />
      </header>

      {/* Hero Section */}
      <section className="relative z-10 px-6 py-20">
        <div className="max-w-7xl mx-auto text-center">
          <Badge className="mb-6 bg-purple-500/20 text-purple-300 border-purple-500/30">
            🚀 The Future of Reading is Here
          </Badge>
          
          <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
            <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
              Rise Through
            </span>
            <br />
            <span className="text-white">Every Page</span>
          </h1>
          
          <p className="text-xl md:text-2xl text-gray-300 mb-8 max-w-3xl mx-auto leading-relaxed">
            Transform your reading habit with gamified focus sessions, progress tracking, and achievements that make every book an adventure.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-4 mb-12">
            <Button size="lg" className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-lg px-8 py-4" onClick={openSignupModal}>
              <Play className="w-5 h-5 mr-2" />
              Start Your Journey
            </Button>
            <Button size="lg" variant="outline" className="border-purple-500/50 text-purple-300 hover:bg-purple-500/10 text-lg px-8 py-4">
              Watch Demo
            </Button>
          </div>

          {/* Hero Stats */}
          <div className="grid grid-cols-3 gap-8 max-w-md mx-auto">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-400">10K+</div>
              <div className="text-sm text-gray-400">Books Read</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-400">5K+</div>
              <div className="text-sm text-gray-400">Active Readers</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-pink-400">98%</div>
              <div className="text-sm text-gray-400">Goal Achievement</div>
            </div>
          </div>
        </div>
      </section>

      {/* Floating Book Animation */}
      <div className="relative z-10 flex justify-center mb-20">
        <div className="relative">
          <div 
            className="w-64 h-80 bg-gradient-to-br from-blue-500/20 to-purple-600/20 rounded-lg backdrop-blur-sm border border-white/10 transform rotate-12 hover:rotate-6 transition-transform duration-500"
            style={{ transform: `translateY(${scrollY * -0.1}px) rotate(12deg)` }}
          >
            <div className="p-6 h-full flex flex-col justify-between">
              <div>
                <div className="w-full h-4 bg-gradient-to-r from-blue-400/30 to-purple-400/30 rounded mb-2"></div>
                <div className="w-3/4 h-4 bg-gradient-to-r from-blue-400/20 to-purple-400/20 rounded mb-2"></div>
                <div className="w-1/2 h-4 bg-gradient-to-r from-blue-400/10 to-purple-400/10 rounded"></div>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full mx-auto mb-2 flex items-center justify-center">
                  <BookOpen className="w-8 h-8 text-white" />
                </div>
                <div className="text-sm text-gray-300">Reading Session</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <section id="features" className="relative z-10 px-6 py-20">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                Supercharge Your Reading
              </span>
            </h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Every feature designed to make reading more engaging, trackable, and rewarding
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              const isActive = currentFeature === index;
              
              return (
                <Card key={index} className={`bg-slate-800/50 border-slate-700/50 backdrop-blur-sm transition-all duration-500 hover:scale-105 ${isActive ? 'ring-2 ring-purple-500/50' : ''}`}>
                  <CardContent className="p-6 text-center">
                    <div className={`w-16 h-16 bg-gradient-to-r ${feature.color} rounded-full mx-auto mb-4 flex items-center justify-center transform transition-transform ${isActive ? 'scale-110' : ''}`}>
                      <Icon className="w-8 h-8 text-white" />
                    </div>
                    <h3 className="text-xl font-semibold mb-2 text-white">{feature.title}</h3>
                    <p className="text-gray-400">{feature.description}</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Additional Features Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { icon: Zap, title: "Smart Streaks", desc: "Build habits" },
              { icon: Users, title: "Reading Friends", desc: "Social challenges" },
              { icon: Star, title: "Book Reviews", desc: "Rate & remember" },
              { icon: TrendingUp, title: "Analytics", desc: "Track progress" }
            ].map((item, index) => {
              const Icon = item.icon;
              return (
                <div key={index} className="text-center p-4 rounded-lg bg-slate-800/30 border border-slate-700/30 hover:bg-slate-800/50 transition-colors">
                  <Icon className="w-8 h-8 text-purple-400 mx-auto mb-2" />
                  <h4 className="font-semibold text-white mb-1">{item.title}</h4>
                  <p className="text-sm text-gray-400">{item.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="relative z-10 px-6 py-20 bg-slate-800/20">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-6 text-white">
              Simple. Powerful. Effective.
            </h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Get started in minutes and transform your reading habit forever
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { step: "1", title: "Add Your Books", desc: "Search and add books to your personal library with beautiful cover art", icon: BookOpen },
              { step: "2", title: "Start Focus Sessions", desc: "Set your timer, choose your book, and dive into distraction-free reading", icon: Timer },
              { step: "3", title: "Track & Celebrate", desc: "Watch your progress grow and unlock achievements as you read", icon: Trophy }
            ].map((item, index) => {
              const Icon = item.icon;
              return (
                <div key={index} className="text-center relative">
                  <div className="w-20 h-20 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full mx-auto mb-6 flex items-center justify-center text-2xl font-bold">
                    {item.step}
                  </div>
                  <Icon className="w-12 h-12 text-purple-400 mx-auto mb-4" />
                  <h3 className="text-2xl font-semibold mb-4 text-white">{item.title}</h3>
                  <p className="text-gray-300 text-lg">{item.desc}</p>
                  {index < 2 && (
                    <ArrowRight className="hidden md:block w-8 h-8 text-purple-400 absolute top-10 -right-4 transform rotate-0" />
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section id="testimonials" className="relative z-10 px-6 py-20">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                Readers Love ReadRise
              </span>
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <Card key={index} className="bg-slate-800/50 border-slate-700/50 backdrop-blur-sm hover:bg-slate-800/70 transition-colors">
                <CardContent className="p-6">
                  <div className="flex items-center mb-4">
                    <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold mr-4">
                      {testimonial.avatar}
                    </div>
                    <div>
                      <h4 className="font-semibold text-white">{testimonial.name}</h4>
                      <p className="text-sm text-gray-400">{testimonial.role}</p>
                    </div>
                  </div>
                  <p className="text-gray-300 italic">"{testimonial.quote}"</p>
                  <div className="flex text-yellow-400 mt-4">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-current" />
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative z-10 px-6 py-20">
        <div className="max-w-4xl mx-auto text-center">
          <div className="bg-gradient-to-r from-slate-800/50 to-purple-900/50 rounded-3xl p-12 backdrop-blur-sm border border-purple-500/20">
            <h2 className="text-4xl md:text-5xl font-bold mb-6 text-white">
              Ready to Rise?
            </h2>
            <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
              Join thousands of readers who've transformed their reading habits with ReadRise. Start your journey today.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-4">
              <Button size="lg" className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-lg px-8 py-4" onClick={openSignupModal}>
                <Play className="w-5 h-5 mr-2" />
                Start Reading Now
              </Button>
              <div className="text-sm text-gray-400">
                Free to start • No credit card required
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 px-6 py-12 border-t border-slate-800">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div className="flex items-center space-x-2 mb-4 md:mb-0">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                <BookOpen className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                ReadRise
              </span>
            </div>
            <div className="flex items-center space-x-6 text-gray-400">
              <a href="#" className="hover:text-white transition-colors">Privacy</a>
              <a href="#" className="hover:text-white transition-colors">Terms</a>
              <a href="#" className="hover:text-white transition-colors">Support</a>
            </div>
          </div>
          <div className="text-center text-gray-500 mt-8">
            2025 ReadRise. Made with for book lovers everywhere.
          </div>
        </div>
      </footer>
    </div>
  );
};

export default ReadRiseLanding;