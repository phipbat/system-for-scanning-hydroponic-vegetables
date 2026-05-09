@extends('layouts.app')

{{-- หน้าแสดงรายละเอียดการแชท (Chat Detail) --}}

@section('title', 'AI Chat Room - PlantoEye')

@section('styles')
<style>
    /* Custom Scrollbar for Chat Room */
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
</style>
@endsection

@section('content')
<div class="h-[calc(100vh-8rem)] min-h-[600px] flex flex-col bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden relative w-full max-w-5xl mx-auto">
    {{-- ส่วนหัวเมนูและข้อมูลคู่สนทนา --}}
    
    <div class="px-6 py-4 bg-white/90 backdrop-blur-xl border-b border-slate-100 flex items-center justify-between z-20 shrink-0">
        <div class="flex items-center gap-4">
            <a href="{{ url('/history?type=chat') }}" class="w-10 h-10 rounded-full border border-slate-200 flex items-center justify-center text-slate-500 hover:bg-slate-50 hover:text-slate-800 transition-colors">
                <i class="ph-bold ph-arrow-left text-lg"></i>
            </a>
            
            <div class="flex items-center gap-3">
                <div class="relative">
                    <div class="w-10 h-10 rounded-full bg-brand-50 flex items-center justify-center shrink-0 border border-brand-100">
                        <i class="ph-fill ph-robot text-brand-600 text-xl"></i>
                    </div>
                    <div class="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 border-2 border-white rounded-full"></div>
                </div>
                <div>
                    <h2 class="font-bold text-slate-800 text-[15px] leading-tight">{{ $session->title }}</h2>
                    <p class="text-xs text-brand-600 font-semibold mt-0.5"><i class="ph-fill ph-check-circle"></i> ปรึกษาฟาร์มไฮโดรโปนิกส์</p>
                </div>
            </div>
        </div>
        <div class="text-[10px] font-bold text-slate-400 bg-slate-50 px-3 py-1.5 rounded-full border border-slate-100 flex items-center gap-1.5">
            <i class="ph-fill ph-cloud-check text-brand-500"></i> ซิงค์ข้อมูลข้ามอุปกรณ์
        </div>
    </div>

    @if(session('error'))
    <div class="bg-red-50 text-red-600 px-6 py-2 text-xs font-bold border-b border-red-100 text-center">
        <i class="ph-fill ph-warning-circle"></i> {{ session('error') }}
    </div>
    @endif
    @error('message')
    <div class="bg-red-50 text-red-600 px-6 py-2 text-xs font-bold border-b border-red-100 text-center">
        กรุณาพิมพ์ข้อความ
    </div>
    @enderror

    {{-- พื้นที่แสดงข้อความสนทนา --}}
    <div class="flex-1 overflow-y-auto px-4 py-6 chat-scroll bg-slate-50/50" id="chat-messages-container">
        <div class="space-y-6 max-w-3xl mx-auto flex flex-col pb-4">
            
            <div class="text-center font-medium text-xs text-slate-400 my-4 flex items-center justify-center gap-4">
                <div class="h-px bg-slate-200 flex-1 max-w-[50px]"></div>
                จุดเริ่มต้นการสนทนา
                <div class="h-px bg-slate-200 flex-1 max-w-[50px]"></div>
            </div>

            @foreach($session->messages as $msg)
            <div class="flex w-full group {{ $msg->sender === 'user' ? 'justify-end pl-12' : 'justify-start pr-12' }}">
                
                @if($msg->sender === 'bot')
                <div class="w-8 h-8 rounded-full bg-brand-50 border border-brand-100 flex items-center justify-center shrink-0 mr-3 mt-auto mb-1 shadow-sm">
                    <i class="ph-fill ph-robot text-brand-600 text-[15px]"></i>
                </div>
                @endif

                <div class="flex flex-col relative {{ $msg->sender === 'user' ? 'items-end' : 'items-start' }}">
                    
                    @if($msg->sender === 'bot')
                        <span class="text-[11px] font-bold text-slate-400 mb-1.5 ml-1">AI Assistant</span>
                    @else
                        <span class="text-[11px] font-bold text-slate-400 mb-1.5 mr-1">คุณ</span>
                    @endif

                    <div class="rounded-[1.25rem] px-5 py-3.5 shadow-sm border relative {{ $msg->sender === 'user' ? 'bg-brand-500 text-white rounded-br-sm border-brand-600' : 'bg-white text-slate-700 rounded-bl-sm border-slate-100' }}">
                        
                        @if($msg->image_path)
                            <div class="mb-3 rounded-xl overflow-hidden bg-slate-100 border border-black/5">
                                <img src="{{ Str::startsWith($msg->image_path, 'http') ? $msg->image_path : asset($msg->image_path) }}" class="max-w-full sm:max-w-xs h-auto object-cover" alt="Attached Image">
                            </div>
                        @endif

                        <p class="text-[15px] leading-relaxed whitespace-pre-wrap {{ $msg->sender === 'user' ? 'text-white' : 'text-slate-700' }}">{{ $msg->text }}</p>
                    </div>
                    
                    <div class="mt-1.5 text-[10px] font-medium text-slate-400 {{ $msg->sender === 'user' ? 'pr-1' : 'pl-1' }}">
                        {{ \Carbon\Carbon::createFromTimestampMs($msg->timestamp)->locale('th')->isoFormat('HH:mm น.') }}
                    </div>
                </div>
            </div>
            @endforeach
        </div>
    </div>

    {{-- แถบพิมพ์และส่งข้อความ --}}
    <div class="px-4 py-4 bg-white border-t border-slate-100 z-20 shadow-[0_-4px_6px_-1px_rgb(0,0,0,0.02)] shrink-0">
        <form action="{{ route('history.chat.message', $session->id) }}" method="POST" class="max-w-3xl mx-auto relative flex items-end gap-3" x-data="{ isSubmitting: false }" @submit="isSubmitting = true">
            @csrf
            
            <div class="relative flex-1">
                <textarea name="message" 
                          rows="1" 
                          placeholder="พิมพ์ข้อความเพื่อสนทนากับ AI ต่อ..." 
                          required
                          class="w-full bg-slate-50 border border-slate-200 text-slate-700 text-sm rounded-2xl pl-5 pr-12 py-3.5 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all resize-none overflow-hidden"
                          oninput="this.style.height = ''; this.style.height = Math.min(this.scrollHeight, 120) + 'px'"
                          style="min-height: 48px;"></textarea>
            </div>
            
            <button type="submit" 
                    :disabled="isSubmitting"
                    class="h-12 px-5 bg-brand-500 hover:bg-brand-600 text-white rounded-2xl flex items-center justify-center transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-sm shadow-brand-500/20 shrink-0">
                <i class="ph-bold ph-paper-plane-right text-lg" x-show="!isSubmitting"></i>
                <i class="ph-bold ph-spinner animate-spin text-lg" x-show="isSubmitting" style="display: none;"></i>
            </button>
        </form>
    </div>
</div>

<script>
    // Auto-scroll to bottom of chat
    document.addEventListener('DOMContentLoaded', function() {
        const container = document.getElementById('chat-messages-container');
        if (container) {
            container.scrollTop = container.scrollHeight;
        }
    });
</script>
@endsection
