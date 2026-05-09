@extends('layouts.app')

@section('title', 'ตั้งค่ากล้องวงจรปิด - IP Camera Settings')
@section('header_title', 'ตั้งค่าเซิร์ฟเวอร์ (System Settings)')

@section('content')
<div class="max-w-4xl mx-auto space-y-6">

    @if(session('success'))
        <div class="bg-green-50 border border-green-200 text-green-700 px-6 py-4 rounded-xl shadow-sm flex items-center gap-3 animate-fade-in">
            <i class="ph ph-check-circle text-2xl"></i>
            <div>
                <strong class="font-semibold block">สำเร็จ!</strong>
                <span class="text-sm">{{ session('success') }}</span>
            </div>
            <button class="ml-auto text-green-600 hover:text-green-800" onclick="this.parentElement.style.display='none'">
                <i class="ph ph-x text-lg"></i>
            </button>
        </div>
    @endif

    <div class="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div class="border-b border-slate-100 p-6 flex items-center gap-3">
            <div class="w-12 h-12 bg-slate-50 text-slate-600 rounded-full flex items-center justify-center border border-slate-100">
                <i class="ph ph-sliders text-2xl"></i>
            </div>
            <div>
                <h3 class="text-xl font-bold text-slate-800">เชื่อมต่อ IP Camera</h3>
                <p class="text-slate-500 text-sm mt-1">ตั้งค่าที่อยู่เว็บและรหัสผ่านสำหรับการเข้าถึงสตรีมวิดีโอวงจรปิด</p>
            </div>
        </div>

        <div class="p-6 md:p-8 bg-slate-50/50">
            <form action="{{ url('/settings/save') }}" method="POST" class="space-y-6">
                @csrf
                
                <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div class="col-span-1 md:col-span-2 space-y-2">
                        <label for="cameraIp" class="block text-sm font-semibold text-slate-700">Camera IP Address (ที่อยู่ IP ของกล้อง)</label>
                        <div class="relative">
                            <span class="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400">
                                <i class="ph ph-globe text-lg"></i>
                            </span>
                            <input type="text" name="cameraIp" id="cameraIp" value="{{ old('cameraIp', $settings['cameraIp'] ?? '') }}" 
                                class="pl-10 w-full rounded-xl border border-slate-200 px-4 py-3 bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-brand-500/50 focus:border-brand-500 transition-all font-sans" 
                                placeholder="เช่น 192.168.1.10">
                        </div>
                        <p class="text-xs text-slate-500 mt-1">ตัวอย่าง: 192.168.1.10 หรือโดเมนที่เปิดพอร์ตสู่ภายนอกแล้ว</p>
                    </div>

                    <div class="space-y-2">
                        <label for="username" class="block text-sm font-semibold text-slate-700">Username (ชื่อผู้ใช้กล้อง)</label>
                        <div class="relative">
                            <span class="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400">
                                <i class="ph ph-user text-lg"></i>
                            </span>
                            <input type="text" name="username" id="username" value="{{ old('username', $settings['username'] ?? '') }}" 
                                class="pl-10 w-full rounded-xl border border-slate-200 px-4 py-3 bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-brand-500/50 focus:border-brand-500 transition-all font-sans" 
                                placeholder="เช่น admin">
                        </div>
                    </div>

                    <div class="space-y-2">
                        <label for="password" class="block text-sm font-semibold text-slate-700">Password (รหัสผ่านกล้อง)</label>
                        <div class="relative">
                            <span class="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400">
                                <i class="ph ph-lock-key text-lg"></i>
                            </span>
                            <input type="password" name="password" id="password" value="{{ old('password', $settings['password'] ?? '') }}" 
                                class="pl-10 w-full rounded-xl border border-slate-200 px-4 py-3 bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-brand-500/50 focus:border-brand-500 transition-all font-sans" 
                                placeholder="รหัสผ่านเข้าดูกล้อง">
                        </div>
                    </div>
                </div>

                <div class="border-t border-slate-200 pt-6 mt-8 flex justify-end items-center gap-4">
                    <button type="button" onclick="window.location.reload();" class="px-6 py-3 rounded-xl font-medium text-slate-600 bg-white border border-slate-200 hover:bg-slate-50 transition-colors">
                        ยกเลิก
                    </button>
                    <button type="submit" class="px-6 py-3 rounded-xl font-medium text-white bg-brand-600 hover:bg-brand-700 shadow-md shadow-brand-500/20 transition-all flex items-center gap-2">
                        <i class="ph ph-floppy-disk text-lg"></i> บันทึกการตั้งค่า
                    </button>
                </div>
            </form>
        </div>
    </div>
</div>
@endsection
