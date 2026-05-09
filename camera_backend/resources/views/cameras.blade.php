@extends('layouts.app')

@section('title', 'จัดการกล้อง | PlantoEye')

@section('header', 'จัดการกล้อง')

@section('content')
<div x-data="{ showAddModal: false }" class="pb-10">
    <div class="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
            <h2 class="text-2xl font-black text-slate-800 tracking-tight">กล้องวงจรปิดทั้งหมด</h2>
            <p class="text-sm text-slate-500 mt-1">จัดการและเพิ่มกล้องวงจรปิดสำหรับฟาร์มของคุณ</p>
        </div>
        
        <button @click="showAddModal = true" class="flex items-center gap-2 bg-brand-600 hover:bg-brand-700 text-white px-5 py-2.5 rounded-xl font-bold shadow-lg shadow-brand-600/30 transition-all active:scale-95">
            <i class="ph ph-plus-circle text-xl"></i>
            เพิ่มกล้องใหม่
        </button>
    </div>

    @if(session('success'))
    <div class="mb-6 p-4 rounded-xl bg-emerald-50 border border-emerald-100 text-emerald-700 flex items-center gap-3">
        <i class="ph-fill ph-check-circle text-xl"></i>
        <p class="font-bold text-sm">{{ session('success') }}</p>
    </div>
    @endif

    @if($errors->any())
    <div class="mb-6 p-4 rounded-xl bg-red-50 border border-red-100 text-red-700">
        <ul class="list-disc pl-5 text-sm font-bold space-y-1">
            @foreach($errors->all() as $error)
                <li>{{ $error }}</li>
            @endforeach
        </ul>
    </div>
    @endif

    <!-- Empty State -->
    @if($cameras->isEmpty())
    <div class="bg-white rounded-3xl p-12 border border-slate-100 shadow-xl shadow-slate-200/50 text-center flex flex-col items-center justify-center">
        <div class="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center mb-4">
            <i class="ph ph-video-camera-slash text-4xl text-slate-300"></i>
        </div>
        <h3 class="text-lg font-bold text-slate-700 mb-1">ยังไม่มีข้อมูลกล้อง</h3>
        <p class="text-slate-500 mb-6 text-sm">คุณสามารถเพิ่มกล้องวงจรปิดเพื่อดูภาพสดและวิเคราะห์ข้อมูลได้</p>
        <button @click="showAddModal = true" class="text-brand-600 bg-brand-50 hover:bg-brand-100 px-6 py-2 rounded-xl font-bold transition-colors">
            เพิ่มกล้องเลย
        </button>
    </div>
    @else
    <!-- Camera Grid -->
    <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        @foreach($cameras as $camera)
        <div class="bg-white rounded-[2rem] overflow-hidden border border-slate-100 shadow-xl shadow-slate-200/50 hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 group">
            <!-- Camera Header -->
            <div class="p-6 pb-4 flex items-start justify-between">
                <div class="flex items-center gap-4">
                    <div class="w-16 h-16 rounded-2xl bg-brand-50 flex items-center justify-center overflow-hidden border border-slate-100">
                        <img src="/api/camera/snapshot/{{ $camera->id }}" class="w-full h-full object-cover" onerror="this.onerror=null; this.outerHTML='<i class=\'ph ph-video-camera text-2xl text-brand-600\'></i>';" alt="Camera {{ $camera->name }}">
                    </div>
                    <div>
                        <h3 class="font-bold text-lg text-slate-800">{{ $camera->name }}</h3>
                        <div class="flex items-center gap-1.5 mt-0.5">
                            <div class="w-2 h-2 rounded-full {{ $camera->status === 'active' ? 'bg-emerald-500' : 'bg-slate-300' }}"></div>
                            <span class="text-xs font-semibold {{ $camera->status === 'active' ? 'text-emerald-600' : 'text-slate-400' }}">
                                {{ $camera->status === 'active' ? 'Online' : 'Offline' }}
                            </span>
                        </div>
                    </div>
                </div>
                
                <form action="{{ route('cameras.destroy', $camera->id) }}" method="POST" onsubmit="return confirm('คุณต้องการลบกล้องนี้ใช่หรือไม่?');">
                    @csrf
                    @method('DELETE')
                    <button type="submit" class="w-8 h-8 rounded-full bg-slate-50 hover:bg-red-50 text-slate-400 hover:text-red-500 flex items-center justify-center transition-colors">
                        <i class="ph ph-trash text-lg"></i>
                    </button>
                </form>
            </div>
            
            <!-- Camera URL / Info -->
            <div class="px-6 pb-6 flex flex-col gap-3">
                <div class="bg-slate-50 rounded-xl p-3 border border-slate-100">
                    <p class="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Stream URL</p>
                    <p class="text-xs text-slate-600 truncate">{{ $camera->stream_url ?: 'ไม่มีลิงก์เชื่อมต่อ' }}</p>
                </div>

                @if($camera->stream_url)
                <a href="/api/camera/snapshot/{{ $camera->id }}" target="_blank" class="w-full bg-brand-50 hover:bg-brand-100 text-brand-600 font-bold text-sm py-2.5 rounded-xl flex items-center justify-center gap-2 transition-colors">
                    <i class="ph ph-image text-lg"></i>
                    ดูภาพล่าสุด
                </a>
                @else
                <button disabled class="w-full bg-slate-50 text-slate-400 font-bold text-sm py-2.5 rounded-xl flex items-center justify-center gap-2 cursor-not-allowed">
                    <i class="ph ph-video-camera-slash text-lg"></i>
                    ไม่ได้ตั้งค่าลิงก์
                </button>
                @endif
            </div>
        </div>
        @endforeach
    </div>
    @endif

    <!-- Add Camera Modal -->
    <div x-show="showAddModal" x-cloak class="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto overflow-x-hidden bg-slate-900/60 backdrop-blur-sm p-4">
        <div @click.away="showAddModal = false" x-show="showAddModal" x-transition:enter="ease-out duration-300" x-transition:enter-start="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95" x-transition:enter-end="opacity-100 translate-y-0 sm:scale-100" x-transition:leave="ease-in duration-200" x-transition:leave-start="opacity-100 translate-y-0 sm:scale-100" x-transition:leave-end="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95" class="relative w-full max-w-md bg-white rounded-[2rem] shadow-2xl p-6 sm:p-8">
            
            <div class="flex items-center justify-between mb-6">
                <h3 class="text-xl font-bold text-slate-800">เพิ่มกล้องใหม่</h3>
                <button @click="showAddModal = false" class="text-slate-400 hover:text-slate-600 bg-slate-50 hover:bg-slate-100 rounded-full w-8 h-8 flex items-center justify-center transition-colors">
                    <i class="ph ph-x text-lg"></i>
                </button>
            </div>

            <form action="{{ route('cameras.store') }}" method="POST">
                @csrf
                <div class="space-y-4 mb-8">
                    <div>
                        <label class="block text-sm font-bold text-slate-700 mb-1.5 ml-1">ชื่อกล้อง</label>
                        <input type="text" name="name" required placeholder="เช่น สวนผักแปลง A" class="w-full bg-slate-50 border border-slate-200 text-slate-800 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all font-medium placeholder-slate-400">
                    </div>
                    <div>
                        <label class="block text-sm font-bold text-slate-700 mb-1.5 ml-1">Stream URL</label>
                        <input type="text" name="stream_url" placeholder="http://192.168.1.xxx/stream" class="w-full bg-slate-50 border border-slate-200 text-slate-800 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all text-sm font-mono placeholder-slate-400">
                        <p class="text-[10px] text-slate-400 mt-1.5 ml-1">ใส่ลิงก์สำหรับการดูภาพสดจากกล้อง IP Camera</p>
                    </div>
                </div>

                <div class="flex items-center justify-end gap-3">
                    <button type="button" @click="showAddModal = false" class="px-5 py-2.5 rounded-xl font-bold text-slate-500 hover:bg-slate-50 transition-colors">
                        ยกเลิก
                    </button>
                    <button type="submit" class="bg-brand-600 hover:bg-brand-700 text-white px-6 py-2.5 rounded-xl font-bold shadow-lg shadow-brand-600/30 transition-all">
                        บันทึกข้อมูล
                    </button>
                </div>
            </form>
        </div>
    </div>
</div>
@endsection
