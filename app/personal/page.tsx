'use client'

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { ChevronDown, Upload, Brain, BarChart3, DollarSign, Home, ShoppingBag, Palette } from 'lucide-react';
import header_logo from "@/app/personal/Picture/header_logo.jpg";
import logo from "@/app/personal/Picture/logo.png";
import roomFrame1 from "@/app/personal/Picture/page-room1.png";
import roomFrame2 from "@/app/personal/Picture/page-room2.png";
import roomFrame3 from "@/app/personal/Picture/page-room3.png";
import roomFrame4 from "@/app/personal/Picture/page-room4.png";
const FRAME_COUNT = 4;

const AnimatedRoomCard = () => {
  const [frame, setFrame] = useState(1);
  const frames = [roomFrame1, roomFrame2, roomFrame3, roomFrame4];
  const FRAME_MS = 1000;


  useEffect(() => {
    // Animation loop
    const id = setInterval(() => {
      setFrame((prev) => (prev % FRAME_COUNT) + 1);
    }, FRAME_MS);

    return () => clearInterval(id);
  }, []);

  return (
    <div className="relative transition-transform duration-1000 hover:scale-105 transform-origin-center">
      <div className="w-80 h-96 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-3xl p-6 shadow-2xl">
        <div className="w-full h-full bg-white rounded-2xl flex items-center justify-center">
          <div className="text-center">
            <img
              src={frames[frame - 1].src}
              alt={`Room Frame ${frame}`}
              className="mx-auto mb-4 w-24 h-24 object-contain"
            />
            <div className="text-slate-600 font-medium">Build Your Dream Space</div>
            <div className="text-sm text-slate-400 mt-2">
              Share it and collab with your friends
            </div>
          </div>
        </div>
      </div>
      <div className="absolute -top-2 -right-2 w-6 h-6 bg-green-400 rounded-full animate-pulse"></div>
      <div className="absolute -bottom-2 -left-2 w-4 h-4 bg-blue-400 rounded-full animate-bounce"></div>
    </div>
  );
};

const FuturopalWebsite = () => {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 100);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-100">
      {/* Header */}
      <header className={`fixed w-full top-0 z-50 transition-all duration-300 ${
        isScrolled ? 'bg-white/98 backdrop-blur-lg shadow-lg' : 'bg-white/95 backdrop-blur-md'
      }`}>
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 rounded-full flex items-center justify-center">
                <img 
                      src={header_logo.src} 
                      alt="Logo" 
                      className="rounded-[10px]" 
                 />
              </div>
              <span className="font-bold text-slate-800 text-lg">FUTUROPAL</span>
            </div>

            {/* Navigation Links */}
            <div className="hidden md:flex items-center space-x-8">
              <button onClick={() => scrollToSection('services')} className="text-slate-700 hover:text-blue-600 font-medium transition-colors">
                Services
              </button>
              <button onClick={() => scrollToSection('marketplace')} className="text-slate-700 hover:text-blue-600 font-medium transition-colors">
                Marketplace
              </button>
              <button onClick={() => scrollToSection('digital-room')} className="text-slate-700 hover:text-blue-600 font-medium transition-colors">
                Digital Room
              </button>
              <Link href="personal/dashboard" className="text-slate-700 hover:text-blue-600 font-medium transition-colors">
                Login
              </Link>
            </div>

            {/* Auth Buttons */}
            <div className="flex items-center space-x-4">
              <Link href="register" className="px-6 py-2 border-2 border-blue-500 text-blue-500 rounded-full hover:bg-blue-500 hover:text-white transition-all duration-300">
                Sign up
              </Link>
              <div className="flex items-center space-x-1">
                <span className="text-slate-700">EN</span>
                <ChevronDown className="w-4 h-4 text-slate-700" />
              </div>
            </div>
          </div>
        </nav>
      </header>

      {/* Hero Section */}
      <section className="pt-20 pb-20 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 relative overflow-hidden">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Hero Text */}
            <div className="text-white">
              <div className="text-orange-300 font-semibold text-sm uppercase tracking-wider mb-4">
                FUTUROPAL: YOUR AI STUDY BUDDY & DIGITAL LEARNING WORLD
              </div>
              <h1 className="text-5xl lg:text-6xl font-bold leading-tight mb-6 text-slate-800">
                Learn Smarter, 
                <br />decorate your space, 
                <br />and earn while you grow
              </h1>
              <p className="text-lg leading-relaxed mb-8 text-white/90 max-w-xl">
                FuturoPal transforms your notes into simple, personalized lessons designed to help you learn faster and smarter. Take adaptive quizzes to test your understanding, earn NFT points as you progress, and unlock items to customize your own digital room.
              </p>
              <button className="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-8 py-4 rounded-full font-semibold hover:from-blue-600 hover:to-blue-700 transform hover:scale-105 transition-all duration-300 shadow-lg">
                <Link href="register">
                  Get Started
                </Link>
              </button>
            </div>

            {/* Robot Animation */}
            <div className="flex justify-center">
              <div className="relative">
                <div className="  w-80 h-80 bg-gradient-to-br from-yellow-300/40 to-orange-600/40 80% opacity rounded-3xl flex items-center justify-center shadow-2xl animate-bounce border border-orange-200/20">
                  <div className="text-8xl">
                    <img 
                      src={logo.src} 
                      alt="Logo" 
                      className="rounded-[10px]" 
                      width="500" 
                      height="300"
                    />
                  </div>
                </div>
                <div className="absolute -top-4 -right-4 w-8 h-8 bg-yellow-400 rounded-full animate-ping"></div>
                <div className="absolute -bottom-4 -left-4 w-6 h-6 bg-pink-400 rounded-full animate-pulse"></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section id="services" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-bold text-center text-slate-800 mb-16">
            We Offer Best Services
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              {
                icon: <Upload className="w-8 h-8" />,
                title: "Upload Your Notes",
                description: "Tutor uploads quizes game, AI transforms them into lessons. Your knowledge, simplified and personalized."
              },
              {
                icon: <Brain className="w-8 h-8" />,
                title: "Learn Smarter, Quiz Smarter",
                description: "Best learners never go solo, quizzes show your growth. Ready to test your knowledge in the quizzes?"
              },
              {
                icon: <BarChart3 className="w-8 h-8" />,
                title: "Track Progress Store Certificates",
                description: "Track your progress，record your journey. Every step is a story of victory."
              },
              {
                icon: <DollarSign className="w-8 h-8" />,
                title: "Earn NFT Points",
                description: "Gain knowledge. Get the strategy of study on enhance your journey. Learn to Earn. Earn and Learn."
              }
            ].map((service, index) => (
              <div key={index} className="text-center p-8 rounded-2xl bg-white shadow-lg hover:shadow-xl hover:-translate-y-2 transition-all duration-300 border border-slate-100">
                <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-6 text-white">
                  {service.icon}
                </div>
                <h3 className="text-xl font-semibold text-slate-800 mb-4">{service.title}</h3>
                <p className="text-slate-600 leading-relaxed">{service.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Room Section */}
      <section id="digital-room" className="py-20 bg-gradient-to-r from-purple-500 to-pink-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-white">
          <h2 className="text-4xl font-bold mb-6">Your Room, Your World</h2>
          <p className="text-xl mb-16 opacity-90">
            Explore Our Marketplace. Use Your NFT Points To Shop For Learning strategy And Upgrades.
          </p>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { icon: <Home className="w-12 h-12" />, title: "Build Your own Digital Room" },
              { icon: <ShoppingBag className="w-12 h-12" />, title: "NFT Marketplace" },
              { icon: <Palette className="w-12 h-12" />, title: "Unlock More Digital Room Features" }
            ].map((room, index) => (
              <div key={index} className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 hover:bg-white/20 transition-all duration-300 hover:scale-105">
                <div className="w-24 h-24 bg-gradient-to-br from-indigo-400 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-6 text-white">
                  {room.icon}
                </div>
                <h4 className="text-lg font-semibold">{room.title}</h4>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Steps Section */}
      <section id="marketplace" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            {/* Steps Text */}
            <div>
              <h2 className="text-4xl font-bold text-slate-800 mb-8 leading-tight">
                Make It Yours, Piece By Piece And Share It With The World. 
                <span className="text-blue-600"> In 3 Easy Steps</span>
              </h2>
              <div className="space-y-8">
                {[
                  {
                    step: "1",
                    title: "Earn NFT Points",
                    description: "Complete lessons, quizzes, and challenges to earn NFT points.",
                    color: "from-yellow-400 to-orange-500"
                  },
                  {
                    step: "2", 
                    title: "Build Your Room",
                    description: "Use your NFT points to buy and build your knowledge digital room.",
                    color: "from-green-400 to-blue-500"
                  },
                  {
                    step: "3",
                    title: "Share & Sell", 
                    description: "Turn creativity strategy note into currency – share your room or sell it to others.",
                    color: "from-purple-400 to-pink-500"
                  }
                ].map((item, index) => (
                  <div key={index} className="flex items-start space-x-6">
                    <div className={`w-12 h-12 bg-gradient-to-r ${item.color} rounded-full flex items-center justify-center text-white font-bold text-lg flex-shrink-0`}>
                      {item.step}
                    </div>
                    <div>
                      <h4 className="text-xl font-semibold text-slate-800 mb-2">{item.title}</h4>
                      <p className="text-slate-600 leading-relaxed">{item.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Phone Mockup */}
            <div className="flex justify-center">
              <Link href="register">
                <AnimatedRoomCard />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-800 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-slate-300">
            All rights reserved FUTUROPAL Built with ❤️ during the Hackathon
          </p>
        </div>
      </footer>
    </div>
  );
};

export default FuturopalWebsite;