import React, { useState } from 'react';
import {
  Search,
  SlidersHorizontal,
  Bell,
  Plus,
  ArrowUpRight,
  LogOut,
  LayoutGrid,
  MessageSquare,
  Compass,
  Bookmark,
  Settings,
  Sparkles,
  Flame,
  CheckCircle2,
  X,
  BookOpen,
} from 'lucide-react';
import { CourseItem } from '../types';

interface DashboardViewProps {
  userEmail: string;
  onLogout: () => void;
}

const INITIAL_COURSES: CourseItem[] = [
  {
    id: 'c-1',
    title: 'Graphic Design',
    category: 'Visual & Brand Arts',
    badge: { label: 'Online', type: 'online' },
    startDate: '12.05.2023',
    hours: '142h',
    progress: 68,
    rating: 4.9,
    instructor: 'Elena Rostova',
    description: 'Master typography, color theory, layout grids, and brand identity systems with industry-grade Figma and Adobe suites.',
  },
  {
    id: 'c-2',
    title: 'Product Management',
    category: 'Product Strategy & Growth',
    badge: { label: 'Hybrid', type: 'hybrid' },
    startDate: '22.06.2023',
    hours: '262h',
    progress: 42,
    rating: 4.8,
    instructor: 'Marcus Chen',
    description: 'From problem discovery to product-market fit: user research, agile roadmapping, metrics, and go-to-market execution.',
  },
  {
    id: 'c-3',
    title: 'UI/UX Design',
    category: 'User Experience & Research',
    badge: { label: 'In-Demand', type: 'demand' },
    startDate: '17.07.2023',
    hours: '184h',
    progress: 85,
    rating: 5.0,
    instructor: 'Sarah Lindqvist',
    description: 'Design interactive, accessible digital experiences through heuristic evaluation, design tokens, and rapid prototyping.',
  },
];

export const DashboardView: React.FC<DashboardViewProps> = ({
  userEmail,
  onLogout,
}) => {
  const [activeTab, setActiveTab] = useState<'grid' | 'messages' | 'explore' | 'bookmarks' | 'settings'>('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCourse, setSelectedCourse] = useState<CourseItem | null>(null);
  const [homeworkCount, setHomeworkCount] = useState(80);

  const filteredCourses = INITIAL_COURSES.filter(
    (c) =>
      c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="w-full max-w-6xl mx-auto rounded-[32px] overflow-hidden bg-white shadow-2xl border border-neutral-200/80 flex flex-col md:flex-row min-h-[640px] text-neutral-900 transition-all">
      {/* ==================================================== */}
      {/* 1. LEFT DARK SIDEBAR                                  */}
      {/* ==================================================== */}
      <aside className="w-full md:w-20 bg-[#111317] flex md:flex-col items-center justify-between p-4 md:py-6 text-white shrink-0 border-r border-neutral-800">
        {/* Top Logo (+) */}
        <div className="flex md:flex-col items-center gap-6">
          <div className="w-11 h-11 rounded-2xl bg-white text-neutral-950 flex items-center justify-center font-bold shadow-md hover:scale-105 transition cursor-pointer">
            <Plus className="w-6 h-6 stroke-[2.5]" />
          </div>

          {/* Navigation Icons */}
          <nav className="flex md:flex-col items-center gap-2 sm:gap-3">
            <button
              onClick={() => setActiveTab('grid')}
              className={`w-10 h-10 rounded-xl flex items-center justify-center transition cursor-pointer ${
                activeTab === 'grid'
                  ? 'bg-neutral-800 text-white'
                  : 'text-neutral-400 hover:text-white hover:bg-neutral-800/60'
              }`}
              title="Dashboard"
            >
              <LayoutGrid className="w-5 h-5" />
            </button>

            <button
              onClick={() => setActiveTab('messages')}
              className={`relative w-10 h-10 rounded-xl flex items-center justify-center transition cursor-pointer ${
                activeTab === 'messages'
                  ? 'bg-neutral-800 text-white'
                  : 'text-neutral-400 hover:text-white hover:bg-neutral-800/60'
              }`}
              title="Messages"
            >
              <MessageSquare className="w-5 h-5" />
              <span className="absolute top-2.5 right-2.5 w-2 h-2 rounded-full bg-purple-500 ring-2 ring-[#111317]" />
            </button>

            <button
              onClick={() => setActiveTab('explore')}
              className={`w-10 h-10 rounded-xl flex items-center justify-center transition cursor-pointer ${
                activeTab === 'explore'
                  ? 'bg-neutral-800 text-white'
                  : 'text-neutral-400 hover:text-white hover:bg-neutral-800/60'
              }`}
              title="Explore"
            >
              <Compass className="w-5 h-5" />
            </button>

            <button
              onClick={() => setActiveTab('bookmarks')}
              className={`w-10 h-10 rounded-xl flex items-center justify-center transition cursor-pointer ${
                activeTab === 'bookmarks'
                  ? 'bg-neutral-800 text-white'
                  : 'text-neutral-400 hover:text-white hover:bg-neutral-800/60'
              }`}
              title="Saved"
            >
              <Bookmark className="w-5 h-5" />
            </button>

            <button
              onClick={() => setActiveTab('settings')}
              className={`w-10 h-10 rounded-xl flex items-center justify-center transition cursor-pointer ${
                activeTab === 'settings'
                  ? 'bg-neutral-800 text-white'
                  : 'text-neutral-400 hover:text-white hover:bg-neutral-800/60'
              }`}
              title="Settings"
            >
              <Settings className="w-5 h-5" />
            </button>
          </nav>
        </div>

        {/* Bottom User Avatar & Logout */}
        <div className="flex md:flex-col items-center gap-3">
          <button
            onClick={onLogout}
            title="Log out back to animated login"
            className="w-10 h-10 rounded-xl text-neutral-400 hover:text-rose-400 hover:bg-neutral-800/70 flex items-center justify-center transition cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
          </button>

          <div className="relative">
            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-purple-600 to-amber-400 p-[2px]">
              <div className="w-full h-full rounded-full bg-neutral-900 flex items-center justify-center text-xs font-bold text-white uppercase">
                {userEmail.slice(0, 2) || 'AN'}
              </div>
            </div>
            <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-[#111317]" />
          </div>
        </div>
      </aside>

      {/* ==================================================== */}
      {/* 2. MAIN CONTENT AREA                                 */}
      {/* ==================================================== */}
      <main className="flex-1 p-5 sm:p-7 md:p-8 flex flex-col justify-between gap-6 overflow-y-auto">
        {/* Top Header Bar */}
        <header className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="relative w-full sm:w-80">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search..."
              className="w-full pl-10 pr-10 py-2 text-sm bg-neutral-100 hover:bg-neutral-100/80 focus:bg-white rounded-full border border-transparent focus:border-neutral-300 outline-none transition text-neutral-800 placeholder:text-neutral-400"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <div className="flex items-center gap-2.5 self-end sm:self-auto">
            <button
              onClick={() => alert('Filters: Showing all active courses')}
              className="w-9 h-9 rounded-full bg-neutral-100 hover:bg-neutral-200 text-neutral-700 flex items-center justify-center transition"
              title="Filters"
            >
              <SlidersHorizontal className="w-4 h-4" />
            </button>

            <button
              onClick={() => alert('Notifications: You have 2 new homework assignments')}
              className="relative w-9 h-9 rounded-full bg-neutral-100 hover:bg-neutral-200 text-neutral-700 flex items-center justify-center transition"
              title="Notifications"
            >
              <Bell className="w-4 h-4" />
              <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-rose-500" />
            </button>

            <button
              onClick={onLogout}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-neutral-700 bg-neutral-100 hover:bg-neutral-200 rounded-full transition"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Sign Out</span>
            </button>
          </div>
        </header>

        {/* Bento Grid Top Row (Matching Frame 00:17) */}
        <section className="grid grid-cols-1 md:grid-cols-12 gap-4">
          {/* Card 1: Purple Curriculum Banner */}
          <div
            onClick={() => setSelectedCourse(INITIAL_COURSES[0])}
            className="md:col-span-5 bg-[#603be4] text-white rounded-[26px] p-6 flex flex-col justify-between relative overflow-hidden shadow-sm hover:shadow-md transition cursor-pointer min-h-[220px]"
          >
            {/* Background glowing shapes */}
            <div className="absolute -right-6 -bottom-6 w-44 h-44 bg-purple-500 rounded-full blur-2xl opacity-60 pointer-events-none" />

            <div className="flex items-center justify-between z-10">
              <span className="inline-flex items-center gap-1.5 bg-white/20 hover:bg-white/30 backdrop-blur-md px-3 py-1 rounded-full text-xs font-medium transition">
                <span>Read more</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </span>

              <Sparkles className="w-5 h-5 text-amber-300" />
            </div>

            <div className="z-10 my-4">
              <h2 className="text-2xl sm:text-[28px] font-bold leading-tight tracking-tight">
                Curriculum is<br />going to be<br />very hot.
              </h2>
            </div>

            {/* Brain flame SVG illustration */}
            <div className="absolute right-4 bottom-4 w-28 h-28 opacity-90 pointer-events-none">
              <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-md">
                <defs>
                  <radialGradient id="brainGlow" cx="50%" cy="50%" r="50%">
                    <stop offset="0%" stopColor="#ffb84d" />
                    <stop offset="100%" stopColor="#ff4d4d" />
                  </radialGradient>
                </defs>
                <path
                  d="M 50 15 C 30 15 20 30 20 48 C 20 65 35 80 50 85 C 65 80 80 65 80 48 C 80 30 70 15 50 15 Z"
                  fill="url(#brainGlow)"
                />
                {/* Wavy brain grooves */}
                <path
                  d="M 35 32 Q 45 40 40 52 Q 35 62 48 72"
                  fill="none"
                  stroke="#7e22ce"
                  strokeWidth="4"
                  strokeLinecap="round"
                />
                <path
                  d="M 65 32 Q 55 40 60 52 Q 65 62 52 72"
                  fill="none"
                  stroke="#7e22ce"
                  strokeWidth="4"
                  strokeLinecap="round"
                />
                <path
                  d="M 50 25 L 50 78"
                  fill="none"
                  stroke="#581c87"
                  strokeWidth="3.5"
                  strokeLinecap="round"
                />
              </svg>
            </div>
          </div>

          {/* Card 2: Statistics & Homework */}
          <div className="md:col-span-4 flex flex-col gap-4">
            {/* Top Stat Box */}
            <div className="bg-[#f7f8fa] border border-neutral-200/60 rounded-[22px] p-4 flex-1 flex flex-col justify-between">
              <div className="flex items-center justify-between text-xs font-semibold text-neutral-500">
                <span>Statistics</span>
                <ArrowUpRight className="w-3.5 h-3.5 text-neutral-400" />
              </div>

              <div className="flex items-end justify-between mt-2">
                <span className="text-3xl font-extrabold text-neutral-900 tracking-tight">
                  32h
                </span>

                {/* Mini bar chart */}
                <div className="flex items-end gap-1.5 h-10 pb-1">
                  <span className="w-2.5 h-5 bg-neutral-300 rounded-sm" />
                  <span className="w-2.5 h-7 bg-neutral-300 rounded-sm" />
                  <span className="w-2.5 h-10 bg-amber-400 rounded-sm" />
                  <span className="w-2.5 h-6 bg-neutral-300 rounded-sm" />
                  <span className="w-2.5 h-9 bg-neutral-900 rounded-sm" />
                </div>
              </div>
            </div>

            {/* Bottom Homework + Action */}
            <div className="flex items-center gap-3">
              {/* Yellow Homework Card */}
              <div className="flex-1 bg-[#f9c426] text-neutral-950 rounded-[22px] p-4 flex flex-col justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-neutral-800">
                  Homework
                </span>
                <div className="flex items-center justify-between mt-1">
                  <span className="text-2xl font-black tracking-tight">
                    +{homeworkCount}%
                  </span>
                  <ArrowUpRight className="w-5 h-5 stroke-[2.5]" />
                </div>
              </div>

              {/* Plus Button */}
              <button
                onClick={() => setHomeworkCount((prev) => Math.min(100, prev + 5))}
                className="w-14 h-full min-h-[72px] bg-neutral-100 hover:bg-neutral-200 active:scale-95 border border-neutral-200 rounded-[22px] flex items-center justify-center text-neutral-800 transition cursor-pointer"
                title="Log completed study hours"
              >
                <Plus className="w-6 h-6 stroke-[2.5]" />
              </button>
            </div>
          </div>

          {/* Card 3: Dark Tutors & Promo Banner */}
          <div className="md:col-span-3 bg-[#111317] text-white rounded-[26px] p-5 flex flex-col justify-between min-h-[220px] shadow-sm">
            <div>
              <div className="flex items-center justify-between text-xs font-medium text-neutral-400 mb-2">
                <span>Until August 16</span>
                <Flame className="w-4 h-4 text-amber-400" />
              </div>
              <p className="text-sm font-medium text-neutral-200 leading-snug">
                Choose a discount curriculum. The best 17 tutors will always help you.
              </p>
            </div>

            {/* Tutor avatars row */}
            <div className="flex items-center -space-x-2 my-2">
              <div className="w-7 h-7 rounded-full bg-purple-500 border-2 border-[#111317] flex items-center justify-center text-[10px] font-bold">
                JD
              </div>
              <div className="w-7 h-7 rounded-full bg-emerald-500 border-2 border-[#111317] flex items-center justify-center text-[10px] font-bold">
                SK
              </div>
              <div className="w-7 h-7 rounded-full bg-amber-500 border-2 border-[#111317] flex items-center justify-center text-[10px] font-bold">
                AL
              </div>
              <div className="w-7 h-7 rounded-full bg-neutral-700 border-2 border-[#111317] flex items-center justify-center text-[10px] font-bold text-neutral-300">
                +14
              </div>
            </div>

            {/* Course start footer */}
            <div className="pt-3 border-t border-neutral-800 flex items-center justify-between text-xs">
              <span className="text-neutral-400">Course start</span>
              <span className="font-semibold text-neutral-100 bg-neutral-800/80 px-2 py-0.5 rounded-md">
                09/08/2023
              </span>
            </div>
          </div>
        </section>

        {/* Bottom Section: Upcoming courses: Find Your Own! */}
        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-base sm:text-lg font-bold text-neutral-900 tracking-tight">
              Upcoming courses: Find Your Own!
            </h3>
            <span className="text-xs text-neutral-500 font-medium">
              3 active sessions
            </span>
          </div>

          {/* Courses Table / Cards */}
          <div className="divide-y divide-neutral-100 border border-neutral-200/80 rounded-2xl overflow-hidden bg-white">
            {filteredCourses.map((course) => {
              const badgeColors = {
                online: 'bg-amber-100 text-amber-800 border-amber-200',
                hybrid: 'bg-yellow-100 text-yellow-900 border-yellow-200',
                demand: 'bg-purple-100 text-purple-800 border-purple-200',
              }[course.badge.type];

              return (
                <div
                  key={course.id}
                  className="flex flex-col sm:flex-row sm:items-center justify-between p-4 hover:bg-neutral-50/80 transition gap-3.5 group"
                >
                  {/* Left Course Info */}
                  <div className="flex items-center gap-3.5">
                    <div className="w-10 h-10 rounded-xl bg-neutral-100 group-hover:bg-white group-hover:shadow-sm flex items-center justify-center text-neutral-800 transition">
                      <BookOpen className="w-5 h-5 text-neutral-700" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="text-sm font-bold text-neutral-900">
                          {course.title}
                        </h4>
                        <span
                          className={`text-[11px] font-semibold px-2 py-0.5 rounded-full border ${badgeColors}`}
                        >
                          {course.badge.label}
                        </span>
                      </div>
                      <p className="text-xs text-neutral-500 mt-0.5">
                        {course.category} • Instructor: {course.instructor}
                      </p>
                    </div>
                  </div>

                  {/* Right Timing & Action */}
                  <div className="flex items-center justify-between sm:justify-end gap-6 text-xs text-neutral-600">
                    <div className="text-left sm:text-right">
                      <div className="font-semibold text-neutral-900">
                        {course.startDate}
                      </div>
                      <div className="text-neutral-400 text-[11px]">Start Date</div>
                    </div>

                    <div className="text-left sm:text-right">
                      <div className="font-semibold text-neutral-900">
                        {course.hours}
                      </div>
                      <div className="text-neutral-400 text-[11px]">Total Time</div>
                    </div>

                    <button
                      onClick={() => setSelectedCourse(course)}
                      className="px-3.5 py-1.5 rounded-full border border-neutral-300 hover:border-neutral-900 hover:bg-neutral-900 hover:text-white font-medium text-xs text-neutral-800 transition cursor-pointer"
                    >
                      View details
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      </main>

      {/* Course Details Modal */}
      {selectedCourse && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl border border-neutral-200 animate-in fade-in zoom-in-95">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-xs font-bold text-purple-600 uppercase tracking-wider">
                  Course Overview
                </span>
                <h3 className="text-xl font-bold text-neutral-900 mt-1">
                  {selectedCourse.title}
                </h3>
                <p className="text-xs text-neutral-500 mt-0.5">
                  {selectedCourse.category}
                </p>
              </div>
              <button
                onClick={() => setSelectedCourse(null)}
                className="w-8 h-8 rounded-full bg-neutral-100 hover:bg-neutral-200 text-neutral-600 flex items-center justify-center transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="my-5 p-4 rounded-2xl bg-neutral-50 border border-neutral-100 text-xs text-neutral-700 leading-relaxed">
              {selectedCourse.description}
            </div>

            <div className="grid grid-cols-3 gap-3 mb-6 text-center">
              <div className="p-3 rounded-xl bg-neutral-100">
                <div className="text-xs text-neutral-500">Duration</div>
                <div className="text-sm font-bold text-neutral-900 mt-0.5">
                  {selectedCourse.hours}
                </div>
              </div>
              <div className="p-3 rounded-xl bg-neutral-100">
                <div className="text-xs text-neutral-500">Starts On</div>
                <div className="text-sm font-bold text-neutral-900 mt-0.5">
                  {selectedCourse.startDate}
                </div>
              </div>
              <div className="p-3 rounded-xl bg-neutral-100">
                <div className="text-xs text-neutral-500">Rating</div>
                <div className="text-sm font-bold text-neutral-900 mt-0.5">
                  ★ {selectedCourse.rating || 4.9}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => {
                  alert(`Enrolled in ${selectedCourse.title}!`);
                  setSelectedCourse(null);
                }}
                className="flex-1 py-2.5 px-4 bg-neutral-900 hover:bg-neutral-800 text-white text-xs font-semibold rounded-xl flex items-center justify-center gap-2 transition"
              >
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>Continue Learning</span>
              </button>
              <button
                onClick={() => setSelectedCourse(null)}
                className="py-2.5 px-4 bg-neutral-100 hover:bg-neutral-200 text-neutral-700 text-xs font-semibold rounded-xl transition"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
