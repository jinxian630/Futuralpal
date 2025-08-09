import React, { useState } from 'react';
import { Calendar, Trophy, Users, BookOpen, Microscope, Palette, User, Clock, CheckCircle, ArrowLeft, GitBranch, Globe, FileEdit, Send, Eye } from 'lucide-react';

interface Mission {
  id: string;
  title: string;
  category: 'art' | 'science' | 'literature' | 'my-project';
  description: string;
  reward: string;
  deadline: string;
  status: 'open' | 'in-progress' | 'completed';
  assignedTo?: string;
}

const ResearchGroupRoom = () => {
  const [userRole, setUserRole] = useState<'teacher' | 'student'>('student');
  const [selectedCategory, setSelectedCategory] = useState<string>('art');
  const [selectedMission, setSelectedMission] = useState<Mission | null>(null);
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [currentView, setCurrentView] = useState<'missions' | 'workspace'>('missions');
  const [activeMission, setActiveMission] = useState<Mission | null>(null);
  const [workspaceTab, setWorkspaceTab] = useState<'main' | 'branch' | 'your-task'>('main');
  const [userTask, setUserTask] = useState<string>('');
  const [missions, setMissions] = useState<Mission[]>([
    {
      id: '1',
      title: 'Renaissance Art Analysis',
      category: 'art',
      description: 'Research and analyze the impact of Renaissance art on modern design principles. Create a comprehensive report with visual examples.',
      reward: '50 Research Points + Certificate',
      deadline: '2025-08-20',
      status: 'open'
    },
    {
      id: '2',
      title: 'Digital Art Evolution',
      category: 'art',
      description: 'Explore the evolution of digital art from early computer graphics to contemporary NFT art movements.',
      reward: '40 Research Points',
      deadline: '2025-08-25',
      status: 'open'
    },
    {
      id: '3',
      title: 'Climate Change Solutions',
      category: 'science',
      description: 'Investigate innovative scientific approaches to combat climate change and their feasibility.',
      reward: '60 Research Points + Lab Access',
      deadline: '2025-08-30',
      status: 'open'
    },
    {
      id: '4',
      title: 'Quantum Computing Basics',
      category: 'science',
      description: 'Create an educational presentation explaining quantum computing principles for high school students.',
      reward: '45 Research Points',
      deadline: '2025-09-05',
      status: 'in-progress',
      assignedTo: 'John Doe'
    },
    {
      id: '5',
      title: 'Modern Poetry Analysis',
      category: 'literature',
      description: 'Analyze themes in contemporary poetry and their reflection of current social issues.',
      reward: '35 Research Points',
      deadline: '2025-08-28',
      status: 'open'
    },
    {
      id: '6',
      title: 'Personal Research Initiative',
      category: 'my-project',
      description: 'Propose and execute your own research project on a topic of personal interest.',
      reward: '70 Research Points + Presentation Opportunity',
      deadline: '2025-09-15',
      status: 'open'
    }
  ]);

  const categories = [
    { id: 'art', name: 'Art Based', icon: Palette, color: 'bg-purple-500' },
    { id: 'science', name: 'Science Based', icon: Microscope, color: 'bg-blue-500' },
    { id: 'literature', name: 'Literature Based', icon: BookOpen, color: 'bg-green-500' },
    { id: 'my-project', name: 'My Project', icon: User, color: 'bg-orange-500' }
  ];

  const filteredMissions = missions.filter(mission => mission.category === selectedCategory);

  const handleJoinMission = (mission: Mission) => {
    setSelectedMission(mission);
    setShowJoinModal(true);
  };

  const confirmJoinMission = () => {
    if (selectedMission) {
      setMissions(missions.map(mission => 
        mission.id === selectedMission.id 
          ? { ...mission, status: 'in-progress' as const, assignedTo: 'Current User' }
          : mission
      ));
      setActiveMission(selectedMission);
      setCurrentView('workspace');
      setShowJoinModal(false);
      setSelectedMission(null);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'open':
        return <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs">Open</span>;
      case 'in-progress':
        return <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs">In Progress</span>;
      case 'completed':
        return <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">Completed</span>;
      default:
        return null;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const handleSubmitTask = () => {
    if (userTask.trim() && activeMission) {
      // In a real app, this would submit to backend
      alert('Task submitted successfully!');
      setUserTask('');
    }
  };

  const goBackToMissions = () => {
    setCurrentView('missions');
    setActiveMission(null);
    setWorkspaceTab('main');
    setUserTask('');
  };

  // Sample content for workspace tabs
  const mainContent = `# ${activeMission?.title} - Main Project

## Project Overview
This is the consolidated view of all approved contributions for the ${activeMission?.title} mission.

### Current Status
- Total contributors: 5 students
- Approved submissions: 3
- Pending reviews: 2

### Key Findings
1. Renaissance art significantly influenced modern design principles
2. Digital tools have democratized artistic creation
3. NFT movements are reshaping art ownership concepts

### Merged Contributions
- Historical analysis by Sarah Chen
- Technical implementation by Mike Johnson  
- Contemporary examples by Lisa Wang

*Last updated: August 9, 2025*`;

  const branchContent = `# Branch Contributions - Under Review

## Pending Submissions

### Branch: feature/color-theory-analysis
**Author:** Alex Rodriguez  
**Submitted:** August 8, 2025

Analysis of color theory applications in Renaissance vs Digital art:
- Color psychology research
- Comparative visual studies
- Modern application examples

**Status:** Awaiting teacher review

### Branch: feature/technical-evolution
**Author:** Emma Davis  
**Submitted:** August 7, 2025  

Technical evolution documentation:
- Timeline of digital art tools
- Software comparison analysis
- Future trend predictions

**Status:** Minor revisions requested

*These contributions will be merged to main after teacher approval*`;

  if (currentView === 'workspace' && activeMission) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-white">
        {/* Header */}
        <div className="bg-white shadow-lg border-b">
          <div className="max-w-7xl mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <button
                  onClick={goBackToMissions}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <ArrowLeft className="h-5 w-5 text-gray-600" />
                </button>
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-indigo-600 rounded-lg">
                    <FileEdit className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h1 className="text-xl font-bold text-gray-900">{activeMission.title}</h1>
                    <p className="text-sm text-gray-600">Project Workspace</p>
                  </div>
                </div>
              </div>
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <Clock className="h-4 w-4" />
                <span>Due: {formatDate(activeMission.deadline)}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="bg-white rounded-lg shadow-md">
            {/* Tab Navigation */}
            <div className="border-b">
              <div className="flex">
                <button
                  onClick={() => setWorkspaceTab('main')}
                  className={`flex items-center space-x-2 px-6 py-4 font-medium transition-colors ${
                    workspaceTab === 'main'
                      ? 'text-indigo-600 border-b-2 border-indigo-600'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <Globe className="h-4 w-4" />
                  <span>Main</span>
                </button>
                <button
                  onClick={() => setWorkspaceTab('branch')}
                  className={`flex items-center space-x-2 px-6 py-4 font-medium transition-colors ${
                    workspaceTab === 'branch'
                      ? 'text-indigo-600 border-b-2 border-indigo-600'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <GitBranch className="h-4 w-4" />
                  <span>Branch</span>
                </button>
                <button
                  onClick={() => setWorkspaceTab('your-task')}
                  className={`flex items-center space-x-2 px-6 py-4 font-medium transition-colors ${
                    workspaceTab === 'your-task'
                      ? 'text-indigo-600 border-b-2 border-indigo-600'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <User className="h-4 w-4" />
                  <span>Your Task</span>
                </button>
              </div>
            </div>

            {/* Tab Content */}
            <div className="p-6">
              {workspaceTab === 'main' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h2 className="text-lg font-semibold text-gray-900">Main Project View</h2>
                    <div className="flex items-center space-x-2 text-sm text-gray-500">
                      <Eye className="h-4 w-4" />
                      <span>View Only</span>
                    </div>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-4 min-h-96">
                    <pre className="whitespace-pre-wrap text-sm text-gray-700 font-mono">
                      {mainContent}
                    </pre>
                  </div>
                </div>
              )}

              {workspaceTab === 'branch' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h2 className="text-lg font-semibold text-gray-900">Branch Contributions</h2>
                    <div className="flex items-center space-x-2 text-sm text-gray-500">
                      <Eye className="h-4 w-4" />
                      <span>View Only</span>
                    </div>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-4 min-h-96">
                    <pre className="whitespace-pre-wrap text-sm text-gray-700 font-mono">
                      {branchContent}
                    </pre>
                  </div>
                </div>
              )}

              {workspaceTab === 'your-task' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h2 className="text-lg font-semibold text-gray-900">Your Task Contribution</h2>
                    <div className="flex items-center space-x-2 text-sm text-green-600">
                      <FileEdit className="h-4 w-4" />
                      <span>Editable</span>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <textarea
                      value={userTask}
                      onChange={(e) => setUserTask(e.target.value)}
                      placeholder={`Start working on your contribution for: ${activeMission.title}

You can include:
- Research findings
- Analysis and insights  
- Supporting evidence
- Conclusions and recommendations

Use markdown formatting for better structure.`}
                      className="w-full min-h-96 p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none font-mono text-sm"
                    />
                    <div className="flex items-center justify-between">
                      <div className="text-sm text-gray-500">
                        {userTask.length} characters
                      </div>
                      <button
                        onClick={handleSubmitTask}
                        disabled={!userTask.trim()}
                        className={`flex items-center space-x-2 px-6 py-2 rounded-lg font-medium transition-colors ${
                          userTask.trim()
                            ? 'bg-indigo-600 text-white hover:bg-indigo-700'
                            : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                        }`}
                      >
                        <Send className="h-4 w-4" />
                        <span>Submit</span>
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-white">
      {/* Header */}
      <div className="bg-white shadow-lg border-b">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-indigo-600 rounded-lg">
                <Users className="h-6 w-6 text-white" />
              </div>
              <h1 className="text-2xl font-bold text-gray-900">Research Group Room</h1>
            </div>
            <div className="flex items-center space-x-4">
              <select 
                value={userRole} 
                onChange={(e) => setUserRole(e.target.value as 'teacher' | 'student')}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="student">Student View</option>
                <option value="teacher">Teacher View</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar - Explore Categories */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-md p-6 sticky top-4">
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <BookOpen className="h-5 w-5 mr-2" />
                Explore
              </h2>
              <div className="space-y-2">
                {categories.map((category) => {
                  const Icon = category.icon;
                  return (
                    <button
                      key={category.id}
                      onClick={() => setSelectedCategory(category.id)}
                      className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                        selectedCategory === category.id
                          ? 'bg-indigo-100 text-indigo-700 border-2 border-indigo-300'
                          : 'hover:bg-gray-50 text-gray-700 border-2 border-transparent'
                      }`}
                    >
                      <div className={`p-2 rounded-md ${category.color}`}>
                        <Icon className="h-4 w-4 text-white" />
                      </div>
                      <span className="font-medium">{category.name}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Main Content - Mission List */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-lg shadow-md">
              <div className="p-6 border-b">
                <h3 className="text-xl font-semibold text-gray-900">
                  {categories.find(cat => cat.id === selectedCategory)?.name} Missions
                </h3>
                <p className="text-gray-600 mt-1">
                  {filteredMissions.length} missions available
                </p>
              </div>
              
              <div className="divide-y">
                {filteredMissions.map((mission) => (
                  <div key={mission.id} className="p-6 hover:bg-gray-50 transition-colors">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <h4 className="text-lg font-semibold text-gray-900">{mission.title}</h4>
                          {getStatusBadge(mission.status)}
                        </div>
                        
                        <p className="text-gray-600 mb-4 leading-relaxed">{mission.description}</p>
                        
                        <div className="flex flex-wrap gap-4 text-sm">
                          <div className="flex items-center text-green-600">
                            <Trophy className="h-4 w-4 mr-1" />
                            <span className="font-medium">{mission.reward}</span>
                          </div>
                          <div className="flex items-center text-orange-600">
                            <Calendar className="h-4 w-4 mr-1" />
                            <span>Due: {formatDate(mission.deadline)}</span>
                          </div>
                          {mission.assignedTo && (
                            <div className="flex items-center text-blue-600">
                              <User className="h-4 w-4 mr-1" />
                              <span>Assigned to: {mission.assignedTo}</span>
                            </div>
                          )}
                        </div>
                      </div>
                      
                      <div className="ml-4">
                        {mission.status === 'open' && userRole === 'student' && (
                          <button
                            onClick={() => handleJoinMission(mission)}
                            className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium"
                          >
                            Join
                          </button>
                        )}
                        {mission.status === 'in-progress' && (
                          <div className="flex items-center text-yellow-600">
                            <Clock className="h-4 w-4 mr-1" />
                            <span className="text-sm font-medium">In Progress</span>
                          </div>
                        )}
                        {mission.status === 'completed' && (
                          <div className="flex items-center text-green-600">
                            <CheckCircle className="h-4 w-4 mr-1" />
                            <span className="text-sm font-medium">Completed</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Join Mission Modal */}
      {showJoinModal && selectedMission && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-xl font-semibold mb-4">Join Mission</h3>
            <div className="mb-4">
              <h4 className="font-medium text-gray-900 mb-2">{selectedMission.title}</h4>
              <p className="text-gray-600 text-sm mb-3">{selectedMission.description}</p>
              <div className="space-y-2 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-gray-500">Reward:</span>
                  <span className="font-medium text-green-600">{selectedMission.reward}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-500">Deadline:</span>
                  <span className="font-medium text-orange-600">{formatDate(selectedMission.deadline)}</span>
                </div>
              </div>
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select your task approach:
              </label>
              <select className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500">
                <option value="">Choose your approach...</option>
                <option value="individual">Individual Research</option>
                <option value="group">Group Collaboration</option>
                <option value="hybrid">Hybrid Approach</option>
              </select>
            </div>
            <div className="flex space-x-3">
              <button
                onClick={() => setShowJoinModal(false)}
                className="flex-1 px-4 py-2 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={confirmJoinMission}
                className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
              >
                Confirm Join
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ResearchGroupRoom;