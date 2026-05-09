@extends('layouts.app')

{{-- หน้าจัดการข้อมูลส่วนตัวของผู้ใช้งาน --}}

@section('title', 'จัดการโปรไฟล์ - PlantoEye')
@section('header_title', 'ข้อมูลส่วนตัว (User Profile)')

@section('content')
<div class="max-w-4xl mx-auto space-y-8">
    {{-- ส่วนแสดงการแจ้งเตือนสถานะต่างๆ --}}

    @if(session('message'))
    <div x-data="{ show: true }" x-show="show" x-init="setTimeout(() => show = false, 5000)" 
         class="bg-brand-50 border border-brand-100 p-4 rounded-2xl flex items-center justify-between animate-fade-in shadow-sm">
        <div class="flex items-center gap-3 text-brand-700 font-medium">
            <i class="ph ph-check-circle text-xl"></i>
            <span>{{ session('message') }}</span>
        </div>
        <button @click="show = false" class="text-brand-400 hover:text-brand-600 transition-colors">
            <i class="ph ph-x text-lg"></i>
        </button>
    </div>
    @endif

    <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {{-- เมนูด้านข้าง: ข้อมูลพื้นฐาน --}}
        <div class="lg:col-span-1 space-y-6">
            <div class="bg-white rounded-3xl p-8 border border-slate-100 shadow-sm text-center">
                <div class="relative inline-block mb-6 group cursor-pointer" onclick="document.getElementById('profile_image_input').click()">
                    @if($user->profile_image)
                        <img src="{{ Storage::url($user->profile_image) }}" class="w-32 h-32 rounded-3xl border-4 border-slate-50 shadow-md object-cover transition-all group-hover:opacity-80">
                    @else
                        <img src="https://ui-avatars.com/api/?name={{ urlencode($user->name) }}&background=10b981&color=fff&size=120" 
                             class="w-32 h-32 rounded-3xl border-4 border-slate-50 shadow-md transition-all group-hover:opacity-80">
                    @endif
                    <div class="absolute -bottom-2 -right-2 w-10 h-10 rounded-xl bg-brand-500 text-white flex items-center justify-center border-4 border-white shadow-lg group-hover:scale-110 transition-transform">
                        <i class="ph ph-camera text-xl"></i>
                    </div>

                    @if($user->profile_image)
                    <form action="/profile/image" method="POST" class="absolute -top-2 -right-2">
                        @csrf
                        @method('DELETE')
                        <button type="submit" class="w-8 h-8 rounded-lg bg-red-500 text-white flex items-center justify-center border-2 border-white shadow-md hover:bg-red-600 transition-colors" title="ลบรูปโปรไฟล์">
                            <i class="ph ph-trash text-sm"></i>
                        </button>
                    </form>
                    @endif
                </div>
                <h3 class="text-xl font-bold text-slate-800">{{ $user->name }}</h3>
                <p class="text-sm font-semibold text-brand-600 uppercase tracking-wider mt-1">{{ $user->role }}</p>
                <div class="mt-8 pt-8 border-t border-slate-50 space-y-4 text-left">
                    <div class="flex items-center gap-3 text-slate-500 text-sm">
                        <i class="ph ph-calendar-blank text-lg"></i>
                        <span>สมาชิกตั้งแต่: {{ $user->created_at->format('d M Y') }}</span>
                    </div>
                </div>
            </div>
        </div>

        {{-- ส่วนเนื้อหาหลัก: แบบฟอร์มแก้ไขข้อมูล --}}
        <div class="lg:col-span-2 space-y-8">
            {{-- ส่วนที่ 1: ข้อมูลทั่วไป --}}
            <div class="bg-white rounded-3xl p-8 border border-slate-100 shadow-sm relative overflow-hidden">
                <div class="relative z-10">
                    <h3 class="text-xl font-bold text-slate-800 flex items-center gap-2 mb-2">
                        <i class="ph ph-user-circle text-brand-500"></i> ข้อมูลส่วนตัวพื้นฐาน
                    </h3>
                    <p class="text-slate-400 text-xs mb-8 uppercase font-bold tracking-widest">Personal Information Settings</p>
                    
                    <form action="/profile/update" id="profile_form" method="POST" enctype="multipart/form-data" class="space-y-6">
                        @csrf
                        <input type="file" name="profile_image" id="profile_image_input" class="hidden" accept="image/*" onchange="document.getElementById('profile_form').submit()">
                        @error('profile_image')
                            <div class="bg-red-50 text-red-500 p-3 rounded-xl text-xs font-medium mb-4 flex items-center gap-2">
                                <i class="ph ph-warning-circle text-lg"></i>
                                <span>{{ $message }}</span>
                            </div>
                        @enderror
                        
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div class="space-y-2">
                                <label class="text-sm font-bold text-slate-700">ชื่อ-นามสกุล</label>
                                <input type="text" name="name" value="{{ old('name', $user->name) }}" required
                                       class="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-4 focus:ring-brand-500/10 focus:border-brand-500 transition-all outline-none">
                            </div>
                            <div class="space-y-2">
                                <label class="text-sm font-bold text-slate-700">ชื่อที่ใช้แสดงผล</label>
                                <input type="text" name="display_name" value="{{ old('display_name', $user->display_name) }}"
                                       class="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-4 focus:ring-brand-500/10 focus:border-brand-500 transition-all outline-none">
                            </div>
                        </div>

                        <div class="space-y-2">
                            <label class="text-sm font-bold text-slate-700">อีเมลที่ใช้งาน</label>
                            <input type="email" name="email" value="{{ old('email', $user->email) }}" required
                                   class="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-4 focus:ring-brand-500/10 focus:border-brand-500 transition-all outline-none">
                        </div>

                        <button type="submit" class="bg-slate-800 hover:bg-slate-900 text-white font-bold py-3 px-8 rounded-xl transition-all shadow-lg shadow-slate-200">
                            บันทึกข้อมูลส่วนตัว
                        </button>
                    </form>
                </div>
                <i class="ph ph-user absolute -right-4 -bottom-4 text-[120px] text-brand-500/5 rotate-[-15deg]"></i>
            </div>

            {{-- ส่วนที่ 2: ความปลอดภัยและรหัสผ่าน --}}
            <div class="bg-white rounded-3xl p-8 border border-slate-100 shadow-sm relative overflow-hidden">
                <div class="relative z-10">
                    <h3 class="text-xl font-bold text-slate-800 flex items-center gap-2 mb-2">
                        <i class="ph ph-shield-check text-orange-500"></i> ความปลอดภัยและรหัสผ่าน
                    </h3>
                    <p class="text-slate-400 text-xs mb-8 uppercase font-bold tracking-widest">Security & Security Credentials</p>
                    
                    <form action="/profile/password" method="POST" class="space-y-6">
                        @csrf
                        <div class="space-y-2">
                            <label class="text-sm font-bold text-slate-700">รหัสผ่านปัจจุบัน</label>
                            <input type="password" name="current_password" required
                                   class="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-4 focus:ring-orange-500/10 focus:border-orange-500 transition-all outline-none"
                                   placeholder="••••••••">
                            @error('current_password') <p class="text-xs text-red-500 font-medium">{{ $message }}</p> @enderror
                        </div>

                        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div class="space-y-2">
                                <label class="text-sm font-bold text-slate-700">รหัสผ่านใหม่</label>
                                <input type="password" name="password" required
                                       class="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-4 focus:ring-orange-500/10 focus:border-orange-500 transition-all outline-none"
                                       placeholder="••••••••">
                            </div>
                            <div class="space-y-2">
                                <label class="text-sm font-bold text-slate-700">ยืนยันรหัสผ่านใหม่</label>
                                <input type="password" name="password_confirmation" required
                                       class="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-4 focus:ring-orange-500/10 focus:border-orange-500 transition-all outline-none"
                                       placeholder="••••••••">
                            </div>
                        </div>

                        <button type="submit" class="bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-3 px-8 rounded-xl transition-all">
                            เปลี่ยนรหัสผ่านใหม่
                        </button>
                    </form>
                </div>
                <i class="ph ph-lock absolute -right-4 -bottom-4 text-[120px] text-orange-500/5 rotate-[-15deg]"></i>
            </div>
        </div>
    </div>
</div>
@endsection
