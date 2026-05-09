@extends('layouts.app')

{{-- หน้าจัดการการสนทนากับ AI (Chat Management) --}}

@section('title', 'AI Chat - PlantoEye Dashboard')

@section('styles')
<style>
    /* Custom Scrollbar for Chat */
    .chat-scroll::-webkit-scrollbar {
        width: 6px;
    }
    .chat-scroll::-webkit-scrollbar-track {
        background: transparent;
    }
    .chat-scroll::-webkit-scrollbar-thumb {
        background-color: #cbd5e1;
        border-radius: 20px;
    }
    
    .chat-session-btn {
        transition: all 0.2s ease-in-out;
    }
    .chat-session-active {
        background-color: #ffffff;
        border-left-color: #1F4E1C; /* brand-500 */
        box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.05);
        z-index: 10;
    }
</style>
@endsection

@section('content')
<div class="px-6 py-8 w-full max-w-7xl mx-auto flex flex-col h-full bg-slate-50">
    {{-- ส่วนหัวหน้าจอจัดการแชท --}}
    
    <div class="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 shrink-0">
        <div>
            <h1 class="text-3xl font-bold text-slate-800 flex items-center gap-3">
                <div class="w-12 h-12 rounded-2xl bg-brand-100 flex items-center justify-center shadow-inner">
                    <i class="ph-fill ph-robot text-brand-600 text-2xl"></i>
                </div>
                แชทบอท AI
            </h1>
            <p class="text-slate-500 mt-2 ml-1 text-sm font-medium flex items-center gap-1.5">
                <i class="ph-fill ph-devices text-slate-400"></i>
                ดูประวัติการสนทนาข้ามอุปกรณ์ของคุณ (ซิงค์จากมือถือ)
            </p>
        </div>
    </div>

    {{-- อินเตอร์เฟสส่วนการสนทนา --}}
    <div x-data="chatInterface({{ $sessions->toJson() }})" class="flex-1 flex bg-white rounded-[2.5rem] shadow-xl shadow-slate-200/50 border border-slate-100 overflow-hidden relative isolate min-h-[500px]">
        
        <template x-if="sessions.length === 0">
            <div class="absolute inset-0 z-20 bg-white/50 backdrop-blur-sm flex items-center justify-center p-10 text-center">
                <div class="bg-white p-8 rounded-3xl shadow-lg border border-slate-100 max-w-sm flex flex-col items-center animate-[bounce_2s_ease-in-out_infinite_alternate]">
                    <div class="w-20 h-20 rounded-full bg-slate-50 flex items-center justify-center mb-6 shadow-inner">
                        <i class="ph-fill ph-chat-teardrop-slash text-slate-300 text-4xl"></i>
                    </div>
                    <h3 class="text-xl font-bold text-slate-800 mb-2">ไม่มีประวัติการแชท</h3>
                    <p class="text-sm text-slate-500 leading-relaxed font-medium">
                        ยังไม่มีการสนทนาที่ถูกซิงค์มาจากแอปพลิเคชันมือถือ แชทของคุณจาก PlantoEye App จะปรากฏที่นี่โดยอัตโนมัติ
                    </p>
                </div>
            </div>
        </template>

        <template x-if="sessions.length > 0">
            <div class="flex w-full h-full relative z-10">
                {{-- แถบรายการห้องสนทนา --}}
                <div class="w-full md:w-80 lg:w-96 border-r border-slate-100 bg-slate-50/70 flex flex-col shrink-0 transition-transform duration-300 transform md:transform-none absolute md:relative inset-y-0 left-0 z-30" 
                     :class="activeSession && !showListOnMobile ? '-translate-x-full' : 'translate-x-0'">
                    
                    <div class="px-6 py-5 border-b border-slate-100 bg-white/80 backdrop-blur-md sticky top-0 z-10 flex items-center justify-between">
                        <h2 class="font-bold text-slate-800 flex items-center gap-2">
                            <i class="ph-fill ph-chats text-brand-500 text-lg"></i> การสนทนาทั้งหมด
                        </h2>
                        <span class="bg-brand-100 text-brand-700 text-[10px] font-bold px-2 py-0.5 rounded-full" x-text="sessions.length"></span>
                    </div>
                    
                    <div class="flex-1 overflow-y-auto chat-scroll p-4 space-y-2">
                        <template x-for="session in sessions" :key="session.id">
                            <button @click="selectSession(session)" 
                                    class="w-full text-left p-4 rounded-2xl border-l-[3px] border-transparent chat-session-btn"
                                    :class="activeSession?.id === session.id ? 'chat-session-active' : 'hover:bg-white/60'">
                                <div class="flex items-center justify-between mb-1.5">
                                    <h3 class="font-bold text-sm truncate pr-2 transition-colors" 
                                        :class="activeSession?.id === session.id ? 'text-brand-700' : 'text-slate-700'"
                                        x-text="session.title"></h3>
                                </div>
                                <p class="text-xs text-slate-500 truncate leading-relaxed" 
                                   :class="activeSession?.id === session.id ? 'font-medium' : ''"
                                   x-text="session.last_message || 'ไม่มีข้อความ'"></p>
                                <div class="mt-2 text-[10px] text-slate-400 font-medium flex items-center justify-end gap-1">
                                    <i class="ph-bold ph-clock"></i> <span x-text="formatDate(session.timestamp)"></span>
                                </div>
                            </button>
                        </template>
                    </div>
                </div>

                {{-- พื้นที่หลักสำหรับแสดงข้อความ --}}
                <div class="flex-1 flex flex-col relative bg-[#f8fafc]/30 h-full overflow-hidden transition-opacity duration-300"
                     :class="!activeSession && !showListOnMobile ? 'hidden md:flex' : 'flex'">
                    
                    <template x-if="!activeSession">
                        <div class="flex-1 flex flex-col items-center justify-center text-slate-400 p-8 text-center bg-white/40 backdrop-blur-sm">
                            <div class="w-32 h-32 mb-6 rounded-full bg-slate-50 flex items-center justify-center shadow-inner relative">
                                <i class="ph-fill ph-robot text-6xl text-slate-200"></i>
                                <div class="absolute -bottom-2 -right-2 w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-sm">
                                    <i class="ph-fill ph-arrow-left text-brand-500 animate-pulse"></i>
                                </div>
                            </div>
                            <h3 class="text-xl font-bold text-slate-700 mb-2">เริ่มดูประวัติการสนทนา</h3>
                            <p class="text-slate-500 font-medium">เลือกหัวข้อการสนทนาจากเมนูด้านซ้ายเพื่ออ่านข้อความและดูรูปภาพ AI</p>
                        </div>
                    </template>

                    <template x-if="activeSession">
                        <div class="flex-1 flex flex-col h-full overflow-hidden w-full absolute inset-0 bg-white">
                            {{-- ส่วนหัวของหน้าแชท --}}
                            <div class="px-4 sm:px-6 py-4 bg-white/90 backdrop-blur-xl border-b border-slate-100 flex items-center justify-between z-20 shrink-0 shadow-sm">
                                <div class="flex items-center gap-4 min-w-0">
                                    <button @click="showListOnMobile = true; activeSession = null" class="md:hidden p-2 -ml-2 text-slate-400 hover:text-slate-800 rounded-full hover:bg-slate-100 transition-colors">
                                        <i class="ph-bold ph-caret-left text-xl"></i>
                                    </button>
                                    
                                    <div class="relative">
                                        <div class="w-11 h-11 rounded-full bg-brand-50 border border-brand-100 flex items-center justify-center shrink-0 shadow-sm">
                                            <i class="ph-fill ph-robot text-brand-600 text-xl"></i>
                                        </div>
                                        <div class="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 border-2 border-white rounded-full"></div>
                                    </div>
                                    <div class="flex-1 min-w-0 pr-4">
                                        <h2 class="font-bold text-slate-800 truncate text-[15px]" x-text="activeSession.title"></h2>
                                        <p class="text-xs text-emerald-600 font-semibold flex items-center gap-1 mt-0.5">
                                            <i class="ph-fill ph-check-circle"></i> ข้อมูลซิงค์ล่าสุด
                                        </p>
                                    </div>
                                </div>
                                <div class="hidden sm:flex text-[10px] font-bold text-slate-400 bg-slate-50 px-3 py-1.5 rounded-full items-center gap-1.5 border border-slate-100">
                                   <i class="ph-bold ph-shield-check text-brand-500"></i> Read Only
                                </div>
                            </div>

                            {{-- พื้นที่แสดงข้อความสนทนา --}}
                            <div class="flex-1 overflow-y-auto px-4 sm:px-8 py-8 chat-scroll bg-slate-50/30" id="chat-messages-container">
                                <div class="space-y-8 max-w-3xl mx-auto flex flex-col pb-4">
                                    
                                    <div class="text-center font-medium text-xs text-slate-400 my-4 flex items-center justify-center gap-4">
                                        <div class="h-px bg-slate-200 flex-1 max-w-[50px]"></div>
                                        จุดเริ่มต้นการสนทนา
                                        <div class="h-px bg-slate-200 flex-1 max-w-[50px]"></div>
                                    </div>

                                    <template x-for="msg in activeSession.messages" :key="msg.id">
                                        
                                        {{-- กล่องข้อความ --}}
                                        <div class="flex w-full group" :class="msg.sender === 'user' ? 'justify-end pl-12 sm:pl-20' : 'justify-start pr-12 sm:pr-20'">
                                            
                                            {{-- แสดงรูปโปรไฟล์บอท --}}
                                            <template x-if="msg.sender === 'bot'">
                                                <div class="w-8 h-8 rounded-full bg-brand-50 border border-brand-100 flex items-center justify-center shrink-0 mr-3 mt-auto mb-1 shadow-sm">
                                                    <i class="ph-fill ph-robot text-brand-600 text-[15px]"></i>
                                                </div>
                                            </template>

                                            {{-- คอลัมน์เนื้อหาข้อความ --}}
                                            <div class="flex flex-col relative" :class="msg.sender === 'user' ? 'items-end' : 'items-start'">
                                                
                                                {{-- ชื่อผู้ส่ง (เฉพาะบอท) --}}
                                                <template x-if="msg.sender === 'bot'">
                                                    <span class="text-[11px] font-bold text-slate-400 mb-1.5 ml-1">AI Assistant</span>
                                                </template>
                                                
                                                <template x-if="msg.sender === 'user'">
                                                    <span class="text-[11px] font-bold text-slate-400 mb-1.5 mr-1">คุณ</span>
                                                </template>

                                                {{-- กล่องข้อความแชท (Bubble) --}}
                                                <div class="rounded-[1.25rem] px-5 py-3.5 shadow-sm border relative"
                                                     :class="msg.sender === 'user' 
                                                        ? 'bg-brand-500 text-white rounded-br-sm border-brand-600 shadow-brand-500/10' 
                                                        : 'bg-white text-slate-700 rounded-bl-sm border-slate-100 shadow-slate-200/50'">
                                                    
                                                    {{-- แสดงรูปภาพแนบ --}}
                                                    <template x-if="msg.image_path">
                                                        <div class="mb-3 rounded-xl overflow-hidden bg-slate-100 border border-black/5 shadow-inner">
                                                            <img :src="'/' + msg.image_path" class="max-w-full sm:max-w-xs h-auto object-cover" alt="Attached Image" loading="lazy" onerror="this.onerror=null; this.src='https://placehold.co/400x300?text=Image+Lost';">
                                                        </div>
                                                    </template>

                                                    {{-- เนื้อหาข้อความ --}}
                                                    <p class="text-[15px] leading-relaxed whitespace-pre-wrap" 
                                                       :class="msg.sender === 'user' ? 'text-white' : 'text-slate-700'" 
                                                       x-text="msg.text"></p>
                                                </div>
                                                
                                                {{-- เวลาที่ส่งข้อความ --}}
                                                <div class="mt-1.5 text-[10px] font-medium transition-opacity opacity-0 group-hover:opacity-100" 
                                                     :class="msg.sender === 'user' ? 'text-slate-400 pr-1' : 'text-slate-400 pl-1'" 
                                                     x-text="formatTime(msg.timestamp)"></div>
                                            </div>
                                        </div>
                                    </template>
                                </div>
                            </div>
                            
                            {{-- ข้อความเตือนสำหรับโหมดอ่านอย่างเดียว --}}
                            <div class="p-4 bg-slate-50 border-t border-slate-100 text-center shrink-0 z-20">
                                <div class="inline-flex items-center justify-center gap-2 bg-white px-4 py-2 rounded-full shadow-sm border border-slate-200/60">
                                    <div class="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse"></div>
                                    <p class="text-slate-500 text-xs font-semibold">
                                        กรุณาใช้งาน <span class="text-brand-600 font-bold">แอปพลิเคชันมือถือ</span> เพื่อพิมพ์ตอบแชท AI
                                    </p>
                                </div>
                            </div>
                        </div>
                    </template>
                </div>
            </div>
        </template>
    </div>
</div>

{{-- ส่วนลอจิกการทำงานของ Alpine.js --}}
<script>
    document.addEventListener('alpine:init', () => {
        Alpine.data('chatInterface', (initialSessions) => ({
            sessions: initialSessions || [],
            activeSession: null,
            showListOnMobile: true, // Used to toggle views on mobile

            init() {
                // If desktop and has sessions, auto-select first
                if (this.sessions.length > 0 && window.innerWidth >= 768) {
                    this.activeSession = this.sessions[0];
                    this.showListOnMobile = false;
                    this.scrollToBottom();
                }

                this.$watch('activeSession', (value) => {
                    if (value) {
                        this.showListOnMobile = false;
                        this.scrollToBottom();
                    }
                });

                // Re-evaluate on resize
                window.addEventListener('resize', () => {
                     if (window.innerWidth >= 768 && !this.activeSession && this.sessions.length > 0) {
                         this.activeSession = this.sessions[0];
                     }
                });
            },

            selectSession(session) {
                this.activeSession = session;
            },

            formatDate(timestamp) {
                if (!timestamp) return '';
                const date = new Date(Number(timestamp));
                // Simple format e.g., "1 เม.ย. 2026"
                return date.toLocaleDateString('th-TH', { 
                    day: 'numeric', month: 'short', year: 'numeric' 
                });
            },

            formatTime(timestamp) {
                if (!timestamp) return '';
                const date = new Date(Number(timestamp));
                return date.toLocaleTimeString('th-TH', { 
                    hour: '2-digit', minute: '2-digit' 
                });
            }
        }));
    });
</script>

{{-- ตัวช่วยเลื่อนลงไปด้านล่างอัตโนมัติ --}}
<script>
    function scrollToBottom() {
        setTimeout(() => {
            const container = document.getElementById('chat-messages-container');
            if (container) {
                // Smooth scroll to bottom
                container.scrollTo({
                    top: container.scrollHeight,
                    behavior: 'smooth'
                });
            }
        }, 150); // slight delay to allow Alpine x-for to render
    }
    
    // Attach to Alpine context
    document.addEventListener('alpine:initialized', () => {
        const component = Alpine.evaluate(document.querySelector('[x-data]'), '$data');
        if(component) {
            component.scrollToBottom = scrollToBottom;
        }
    });
</script>
@endsection
