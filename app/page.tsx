'use client'

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { ChevronDown, Compass, Brain, LineChart, Puzzle, GraduationCap, Coins, ShoppingBag, Palette, BookOpen, Bell, Sparkles, Target, Trophy, Activity, ClipboardCheck, FileText, BarChart, Star, Users } from 'lucide-react';
import Image from 'next/image';

const FRAME_COUNT = 4;

const AnimatedRoomCard = () => {
  const [frame, setFrame] = useState(1);
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
            <div className="mx-auto mb-4 w-24 h-24 relative">
              <Image
                src={`/personal/Picture/page-room${frame}.png`}
                alt={`Room Frame ${frame}`}
                fill
                className="object-contain"
              />
            </div>
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
                <Image 
                  src="/personal/Picture/header_logo.jpg"
                  alt="Logo" 
                  width={48}
                  height={48}
                  className="rounded-[10px]" 
                />
              </div>
              <span className="font-bold text-slate-800 text-lg">FUTUROPAL</span>
            </div>

            {/* Navigation Links */}
            <div className="hidden md:flex items-center space-x-8">
              <button onClick={() => scrollToSection('services')} className="text-slate-700 hover:text-blue-600 font-medium transition-colors">
                AI Services
              </button>
              <button onClick={() => scrollToSection('marketplace')} className="text-slate-700 hover:text-blue-600 font-medium transition-colors">
                Marketplace
              </button>
              <button onClick={() => scrollToSection('digital-room')} className="text-slate-700 hover:text-blue-600 font-medium transition-colors">
                Digital Room
              </button>
              <button onClick={() => scrollToSection('courses')} className="text-slate-700 hover:text-blue-600 font-medium transition-colors">
                Courses
              </button>
              <button onClick={() => scrollToSection('tutor')} className="text-slate-700 hover:text-blue-600 font-medium transition-colors">
                Tutors
              </button>
              <Link href="/personal/dashboard" className="text-slate-700 hover:text-blue-600 font-medium transition-colors">
                Login
              </Link>
            </div>

            {/* Auth Buttons */}
            <div className="flex items-center space-x-4">
              <Link href="/register" className="px-6 py-2 border-2 border-blue-500 text-blue-500 rounded-full hover:bg-blue-500 hover:text-white transition-all duration-300">
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
                <Link href="/register">
                  Get Started
                </Link>
              </button>
            </div>

            {/* Robot Animation */}
            <div className="flex justify-center">
              <div className="relative">
                <div className="w-80 h-80 bg-gradient-to-br from-yellow-300/40 to-orange-600/40 rounded-3xl flex items-center justify-center shadow-2xl animate-bounce border border-orange-200/20">
                  <div className="text-8xl relative">
                    <Image 
                      src="/personal/Picture/logo.png"
                      alt="Logo" 
                      width={500}
                      height={300}
                      className="rounded-[10px]" 
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
            AI Service. Smarter Learning.
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              {
                icon: <Compass className="w-8 h-8" />, // Navigation icon
                title: "Comprehensive AI Assistance",
                description: "Provide strong support every page you navigate."
              },
              {
                icon: <Brain className="w-8 h-8" />, // Tutor/education icon
                title: "Step-by-Step AI Guidance",
                description: "Get personalized, step-by-step tutoring that makes complex topics easy to understand."
              },
              {
                icon: <Puzzle className="w-8 h-8" />, // Challenges & variety icon
                title: "Variety & Challenge",
                description: "Choose from a range of learning tools and difficulty levels to suit your style."
              },
              {
                icon: <LineChart className="w-8 h-8" />, // Progress tracking icon
                title: "Progress Tracking",
                description: "Monitor your achievements and watch your skills grow with detailed progress tracking."
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
      <section id="marketplace" className="py-20 bg-gradient-to-r from-purple-500 to-pink-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-white">
          <h2 className="text-4xl font-bold mb-6">Your Points, Your World</h2>
          <p className="text-xl mb-16 opacity-90">
            Explore Our Marketplace. Use Your NFT Points To Shop For Decorations And Upgrades.
          </p>
          <div className="grid md:grid-cols-4 gap-8">
            {[
              { icon: <GraduationCap className="w-12 h-12" />, title: "Learning Earn Point" },
              { icon: <ShoppingBag className="w-12 h-12" />, title: "Various NFT Marketplace" },
              { icon: <Coins className="w-12 h-12" />, title: "Buy items for design" },
              { icon: <Palette className="w-12 h-12" />, title: "Unlock More Exciting Themes" }
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
      <section id="digital-room" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            {/* Steps Text */}
            <div>
              <h2 className="text-4xl font-bold text-slate-800 mb-8 leading-tight">
                Make It Yours, Piece By Piece And Share It With The World. 
                <span className="text-blue-600"> In 3 Room Groups</span>
              </h2>
              <div className="space-y-8">
                {[
                  {
                    step: "1",
                    title: "Research Group",
                    description: "Research and complete tasks to earn rewards. Develop self-learning skills.",
                    color: "from-yellow-400 to-orange-500"
                  },
                  {
                    step: "2", 
                    title: "Connect Group",
                    description: "Social space for collaboration, discussions and idea exchange with peers and mentors.",
                    color: "from-green-400 to-blue-500"
                  },
                  {
                    step: "3",
                    title: "Lab Group", 
                    description: "Customize your digital room with items you earned, Build the item with your friends.",
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
              <Link href="/register">
                <AnimatedRoomCard />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Course Section */}
      <section id="courses" className="py-20 bg-gradient-to-br from-purple-50 to-violet-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-bold text-center text-slate-800 mb-6">
            Unlimited Courses Learning 
          </h2>
          <p className="text-xl text-center text-slate-600 mb-16 max-w-3xl mx-auto">
            From academic subjects to creative skills, explore diverse courses tailored to your interests and career goals.
          </p>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: <BookOpen className="w-8 h-8" />,
                title: "Diverse Course Library",
                description: "Access academic subjects like Math, Science, History alongside creative skills like Figma, Instagram Design, Photography, and Programming.",
                gradient: "from-emerald-400 to-teal-500"
              },
              {
                icon: <Bell className="w-8 h-8" />,
                title: "Smart Reminders",
                description: "Never lose progress again. Get personalized notifications and gentle nudges to keep you on track with your learning goals.",
                gradient: "from-orange-400 to-red-500"
              },
              {
                icon: <Sparkles className="w-8 h-8" />,
                title: "AI Learning Guidance",
                description: "Receive intelligent recommendations for your learning path and career journey based on your interests and industry trends.",
                gradient: "from-blue-400 to-purple-500"
              },
              {
                icon: <Target className="w-8 h-8" />,
                title: "Goal-Oriented Learning",
                description: "Set personalized learning objectives and track milestones with adaptive content that matches your pace and style.",
                gradient: "from-pink-400 to-rose-500"
              },
              {
                icon: <Users className="w-8 h-8" />,
                title: "Collaborative Projects",
                description: "Work on real-world projects with peers, building both technical skills and teamwork abilities in a supportive environment.",
                gradient: "from-indigo-400 to-blue-500"
              },
              {
                icon: <Trophy className="w-8 h-8" />,
                title: "Achievement System",
                description: "Earn certificates, badges, and NFT rewards as you complete courses and reach learning milestones.",
                gradient: "from-yellow-400 to-orange-500"
              }
            ].map((course, index) => (
              <div
                key={index}
                className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl hover:-translate-y-2 transition-all duration-300 border border-slate-100 group"
              >
                <div className={`w-16 h-16 bg-gradient-to-r ${course.gradient} rounded-2xl flex items-center justify-center mx-auto mb-6 text-white group-hover:scale-110 transition-transform duration-300`}>
                  {course.icon}
                </div>
                <h3 className="text-xl font-semibold text-slate-800 mb-4 text-center">
                  {course.title}
                </h3>
                <p className="text-slate-600 leading-relaxed text-center">
                  {course.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Tutor Dashboard Section */}
      <section id="tutor" className="py-20 bg-gradient-to-r from-slate-900 via-purple-600 to-slate-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-white mb-6">
              Empower Your Teaching Journey
            </h2>
            <p className="text-xl text-purple-200 max-w-3xl mx-auto">
              Advanced dashboard tools designed for educators to track, guide, and inspire student success.
            </p>
          </div>
          
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            {/* Dashboard Features */}
            <div className="space-y-8">
              {[
                {
                  icon: <Activity className="w-8 h-8" />,
                  title: "Student Progress Analytics",
                  description: "Monitor individual and class-wide learning progress with detailed analytics. Identify students who need extra support and intervene before they fall behind.",
                  accent: "bg-gradient-to-r from-green-400 to-emerald-500"
                },
                {
                  icon: <ClipboardCheck className="w-8 h-8" />,
                  title: "Assignment Management Hub",
                  description: "Create, distribute, and grade assignments seamlessly. Set deadlines, provide feedback, and track submission rates all in one intuitive interface.",
                  accent: "bg-gradient-to-r from-blue-400 to-cyan-500"
                },
                {
                  icon: <FileText className="w-8 h-8" />,
                  title: "Content & Research Library",
                  description: "Import and organize engaging course materials, research tasks, and multimedia content. Build comprehensive learning experiences that captivate students.",
                  accent: "bg-gradient-to-r from-purple-400 to-pink-500"
                }
              ].map((feature, index) => (
                <div key={index} className="flex items-start space-x-6 bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10 hover:bg-white/10 transition-all duration-300">
                  <div className={`w-16 h-16 ${feature.accent} rounded-xl flex items-center justify-center text-white flex-shrink-0`}>
                    {feature.icon}
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-white mb-3">{feature.title}</h3>
                    <p className="text-purple-200 leading-relaxed">{feature.description}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Dashboard Preview */}
            <div className="relative">
              <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-8 border border-white/20">
                <div className="space-y-6">
                  {/* Header */}
                  <div className="flex items-center justify-between">
                    <h4 className="text-2xl font-bold text-white">Dashboard Overview</h4>
                    <div className="flex space-x-2">
                      <div className="w-3 h-3 bg-red-400 rounded-full"></div>
                      <div className="w-3 h-3 bg-yellow-400 rounded-full"></div>
                      <div className="w-3 h-3 bg-green-400 rounded-full"></div>
                    </div>
                  </div>
                  
                  {/* Stats Cards */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-white/10 rounded-xl p-4">
                      <div className="text-3xl font-bold text-emerald-400">87%</div>
                      <div className="text-sm text-purple-200">Course Completion</div>
                    </div>
                    <div className="bg-white/10 rounded-xl p-4">
                      <div className="text-3xl font-bold text-blue-400">24</div>
                      <div className="text-sm text-purple-200">Active Students</div>
                    </div>
                  </div>
                  
                  {/* Progress Bars */}
                  <div className="space-y-3">
                    <div>
                      <div className="flex justify-between text-sm text-purple-200 mb-1">
                        <span>Assignment Submissions</span>
                        <span>92%</span>
                      </div>
                      <div className="w-full bg-white/20 rounded-full h-2">
                        <div className="bg-gradient-to-r from-green-400 to-emerald-500 h-2 rounded-full" style={{width: '92%'}}></div>
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between text-sm text-purple-200 mb-1">
                        <span>Student Engagement</span>
                        <span>78%</span>
                      </div>
                      <div className="w-full bg-white/20 rounded-full h-2">
                        <div className="bg-gradient-to-r from-blue-400 to-cyan-500 h-2 rounded-full" style={{width: '78%'}}></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Floating Elements */}
              <div className="absolute -top-4 -right-4 w-16 h-16 bg-gradient-to-r from-pink-400 to-rose-500 rounded-full flex items-center justify-center">
                <BarChart className="w-8 h-8 text-white" />
              </div>
              <div className="absolute -bottom-6 -left-6 w-20 h-20 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center">
                <Star className="w-10 h-10 text-white" />
              </div>
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