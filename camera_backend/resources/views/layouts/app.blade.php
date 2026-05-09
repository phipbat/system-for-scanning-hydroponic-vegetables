<!DOCTYPE html>
<html lang="th">
{{-- โครงสร้างหลักของแอปพลิเคชัน (Main Layout) --}}
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>@yield('title', 'PlantoEye Dashboard')</title>
    
    <link href="https://fonts.googleapis.com/css2?family=Kanit:wght@300;400;500;600;700&display=swap" rel="stylesheet">
    
    <script defer src="https://cdn.jsdelivr.net/npm/alpinejs@3.x.x/dist/cdn.min.js"></script>
    
    <script src="https://cdn.tailwindcss.com"></script>
    
    <script>
        tailwind.config = {
            theme: {
                extend: {
                    fontFamily: {
                        sans: ['Kanit', 'sans-serif'],
                    },
                    colors: {
                        brand: {
                            50: '#f1f7f1',
                            100: '#dfecdf',
                            500: '#1F4E1C',
                            600: '#1a4218',
                            700: '#153513',
                            900: '#0d210c',
                        }
                    }
                }
            }
        }
    </script>
    
    <script src="https://unpkg.com/@phosphor-icons/web"></script>

    <link rel="stylesheet" href="{{ asset('css/app.css') }}">
    
    <style>
        html, body {
            height: 100%;
            overflow: hidden;
            margin: 0;
            padding: 0;
        }
    </style>

    @yield('styles')
</head>
<body class="text-slate-800 antialiased bg-slate-50 h-screen flex overflow-hidden" x-data="{ sidebarOpen: false }">

    <div x-show="sidebarOpen" x-transition.opacity class="fixed inset-0 z-20 bg-slate-900/50 lg:hidden" @click="sidebarOpen = false"></div>

    {{-- แถบเมนูด้านข้าง (Sidebar) --}}
    <aside :class="sidebarOpen ? 'translate-x-0' : '-translate-x-full'" class="fixed inset-y-0 left-0 z-30 w-64 m-4 mr-0 bg-white transition-transform duration-300 lg:translate-x-0 lg:static lg:inset-y-0 lg:flex lg:w-64 lg:flex-col rounded-[2.5rem] shadow-xl shadow-slate-200/50 border border-slate-100/50">
        <div class="flex items-center justify-center h-20 px-6">
            <div class="flex items-center gap-4">
                <div class="flex items-center justify-center p-1">
                    <i class="ph-fill ph-plant text-brand-600 text-[2.5rem]"></i>
                </div>
                <div>
                    <h1 class="font-bold text-lg text-slate-800 leading-tight">Planto<span class="text-brand-500">Eye</span></h1>
                    <p class="text-[10px] text-slate-500 font-medium uppercase tracking-wider">Plant Monitoring</p>
                </div>
            </div>
        </div>

        <nav class="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
            <a href="/" class="flex items-center gap-3 px-4 py-3 rounded-xl transition-all {{ Request::is('/') ? 'bg-brand-50 text-brand-500 font-black' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900' }}">
                <i class="ph {{ Request::is('/') ? 'ph-squares-four-fill' : 'ph-squares-four' }} text-xl"></i>
                <span class="text-sm">ภาพรวม</span>
            </a>

            {{-- --- ส่วนติดตามพืช --- --}}
            <div class="pt-3 pb-1">
                <p class="px-4 text-[10px] font-black text-slate-300 uppercase tracking-widest">ติดตามพืช</p>
            </div>

            <a href="/growth" class="flex items-center gap-3 px-4 py-3 rounded-xl transition-all {{ Request::is('growth*') ? 'bg-brand-50 text-brand-600 font-black' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900' }}">
                <i class="ph {{ Request::is('growth*') ? 'ph-chart-line-up-fill' : 'ph-chart-line-up' }} text-xl"></i>
                <span class="text-sm">การเจริญเติบโต</span>
            </a>




            {{-- --- ส่วนประวัติ --- --}}
            <div class="pt-3 pb-1">
                <p class="px-4 text-[10px] font-black text-slate-300 uppercase tracking-widest">ประวัติ</p>
            </div>

            <div x-data="{ open: {{ Request::is('history*') ? 'true' : 'false' }} }">
                <button @click="open = !open" class="w-full flex items-center justify-between px-4 py-3 rounded-xl transition-all {{ Request::is('history*') ? 'bg-brand-50 text-brand-600 font-black' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900' }}">
                    <div class="flex items-center gap-3">
                        <i class="ph {{ Request::is('history*') ? 'ph-file-text-fill' : 'ph-file-text' }} text-xl"></i>
                        <span class="text-sm">ประวัติการวิเคราะห์ AI</span>
                    </div>
                    <i class="ph ph-caret-down text-xs transition-transform duration-200" :class="open ? 'rotate-180' : ''"></i>
                </button>
                
                <div x-show="open" x-transition:enter="transition ease-out duration-100" x-transition:enter-start="opacity-0 transform -translate-y-2" x-transition:enter-end="opacity-100 transform translate-y-0" class="mt-1 ml-9 space-y-1">
                    <a href="/history?type=growth" class="block py-2 px-3 text-xs rounded-lg {{ Request::query('type') == 'growth' ? 'text-brand-600 font-bold bg-brand-50/50' : 'text-slate-400 hover:text-slate-700 hover:bg-slate-50' }}">
                        การเจริญเติบโต
                    </a>
                    <a href="/history?type=disease" class="block py-2 px-3 text-xs rounded-lg {{ Request::query('type') == 'disease' ? 'text-brand-600 font-bold bg-brand-50/50' : 'text-slate-400 hover:text-slate-700 hover:bg-slate-50' }}">
                        วิเคราะห์โรค
                    </a>
                    <a href="/history?type=chat" class="block py-2 px-3 text-xs rounded-lg {{ Request::query('type') == 'chat' ? 'text-brand-600 font-bold bg-brand-50/50' : 'text-slate-400 hover:text-slate-700 hover:bg-slate-50' }}">
                        แชทบอท ai
                    </a>
                </div>
            </div>

            <div class="pt-4 mt-4 border-t border-slate-50">
                <p class="px-4 text-xs font-semibold text-slate-300 uppercase tracking-widest mb-2">ระบบ</p>
                
                <a href="/cameras" class="flex items-center gap-3 px-4 py-3 rounded-xl transition-all {{ Request::is('cameras*') ? 'bg-brand-50 text-brand-600 font-black' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900' }}">
                    <i class="ph {{ Request::is('cameras*') ? 'ph-video-camera-fill' : 'ph-video-camera' }} text-xl"></i>
                    <span>จัดการกล้อง</span>
                </a>

                <a href="/profile" class="flex items-center gap-3 px-4 py-3 rounded-xl transition-all {{ Request::is('profile') ? 'bg-brand-50 text-brand-600 font-black' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900' }}">
                    <i class="ph {{ Request::is('profile') ? 'ph-user-circle-fill' : 'ph-user-circle' }} text-xl"></i>
                    <span>จัดการโปรไฟล์</span>
                </a>

            </div>
        </nav>

        <div class="p-6 mt-auto">
            <div class="bg-white/50 backdrop-blur-sm rounded-2xl p-4 border border-slate-100 mb-2">
                <div class="flex items-center gap-3">
                    <div class="w-2 h-2 rounded-full bg-brand-500 animate-pulse"></div>
                    <span class="text-[10px] font-black text-slate-400 uppercase tracking-widest">System Online</span>
                </div>
            </div>

            <form action="/logout" method="POST" id="logout-form" class="hidden">
                @csrf
            </form>
            <button onclick="document.getElementById('logout-form').submit()" class="w-full flex items-center justify-between px-5 py-3 rounded-2xl text-slate-400 hover:bg-red-50 hover:text-red-500 transition-all group">
                <div class="flex items-center gap-3">
                    <i class="ph ph-sign-out text-xl"></i>
                    <span class="text-sm font-bold">ออกจากระบบ</span>
                </div>
                <i class="ph ph-caret-right text-xs opacity-0 group-hover:opacity-100 transition-opacity"></i>
            </button>
        </div>
    </aside>

    {{-- พื้นที่เนื้อหาหลัก (Main Content) --}}
    <main class="flex-1 flex flex-col h-screen bg-transparent lg:ml-0 overflow-y-auto overflow-x-hidden" style="scroll-behavior: smooth;">
        <header class="h-20 bg-white mx-4 mt-4 mb-2 rounded-[2.5rem] flex items-center justify-between px-8 border border-slate-100/50 shadow-xl shadow-slate-200/50 transition-all shrink-0">
            <div class="flex items-center gap-4">
                <button @click="sidebarOpen = true" class="lg:hidden p-2 rounded-lg text-slate-500 hover:bg-slate-200">
                    <i class="ph ph-list text-2xl"></i>
                </button>
                <h2 class="text-xl font-black text-slate-800 hidden sm:block">@yield('header_title', 'Dashboard')</h2>
            </div>
            
            <div class="flex items-center gap-3">
                <button class="w-10 h-10 rounded-xl bg-slate-50 text-slate-400 flex items-center justify-center hover:bg-brand-50 hover:text-brand-600 transition-colors relative border border-slate-100">
                    <i class="ph ph-bell text-xl"></i>
                    <span class="absolute top-2.5 right-2.5 w-2 h-2 rounded-full bg-red-500 border-2 border-white"></span>
                </button>
                <div class="h-8 w-px bg-slate-100 mx-1"></div>
                <a href="/profile" class="flex items-center gap-3 group pl-2">
                    <div class="hidden md:block text-right">
                        <p class="text-xs font-black text-slate-800 leading-none group-hover:text-brand-600 transition-colors">{{ auth()->user()->name ?? 'ผู้ดูแลระบบ' }}</p>
                        <p class="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-1">{{ auth()->user()->role ?? 'Admin' }}</p>
                    </div>
                    @if(auth()->user()->profile_image)
                        <img src="{{ Storage::url(auth()->user()->profile_image) }}" class="w-10 h-10 rounded-xl object-cover shadow-lg shadow-slate-900/20 group-hover:scale-105 transition-transform">
                    @else
                        <div class="w-10 h-10 rounded-xl bg-slate-800 text-white flex items-center justify-center font-black text-sm shadow-lg shadow-slate-900/20 group-hover:scale-105 transition-transform">
                            {{ strtoupper(substr(auth()->user()->name ?? 'AD', 0, 2)) }}
                        </div>
                    @endif
                </a>
            </div>
        </header>

        <div class="flex-1 p-4 sm:p-6 lg:p-4 overflow-x-hidden animate-fade-in content-area-scroll">
            <div class="bg-white rounded-[2.5rem] min-h-full p-8 shadow-xl shadow-slate-200/50 border border-slate-100/50 mb-4">
                @yield('content')
            </div>
        </div>
    </main>

    @yield('scripts')
</body>
</html>
