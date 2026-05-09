@extends('layouts.app')

{{-- หน้าแดชบอร์ดสรุปภาพรวมระบบ --}}
@section('content')

@section('title', 'PlantoEye Dashboard')
@section('header_title', 'ภาพรวมระบบ (Dashboard)')

@section('content')
<div class="space-y-6">
    {{-- การ์ดแสดงสถิติรวม (Stats Grid) --}}

    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7 gap-6">
        <div class="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
            <div class="flex items-center justify-between mb-2">
                <span class="text-slate-500 text-sm font-medium">การวิเคราะห์ AI ทั้งหมด</span>
                <div class="w-8 h-8 rounded-lg bg-brand-50 text-brand-500 flex items-center justify-center">
                    <i class="ph ph-brain"></i>
                </div>
            </div>
            <div class="text-2xl font-bold text-slate-800">{{ number_format($stats['total_analyses'] ?? 0) }}</div>
            <div class="text-[10px] text-brand-600 font-semibold mt-1">วันนี้: +{{ number_format($stats['today_analyses'] ?? 0) }}</div>
        </div>

        <div class="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
            <div class="flex items-center justify-between mb-2">
                <span class="text-slate-500 text-sm font-medium">จำนวนต้นที่ติดตาม</span>
                <div class="w-8 h-8 rounded-lg bg-brand-50 text-brand-500 flex items-center justify-center">
                    <i class="ph ph-leaf"></i>
                </div>
            </div>
            <div class="text-2xl font-bold text-slate-800">{{ number_format($stats['total_plants'] ?? 0) }}</div>
            <div class="text-[10px] text-slate-500 mt-1">จากกล้องทั้งหมด {{ number_format($stats['active_cameras'] ?? 0) }} ตัว</div>
        </div>

        <div class="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
            <div class="flex items-center justify-between mb-2">
                <span class="text-slate-500 text-sm font-medium">ความสูงต้นล่าสุด</span>
                <div class="w-8 h-8 rounded-lg bg-brand-50 text-brand-500 flex items-center justify-center">
                    <i class="ph ph-ruler"></i>
                </div>
            </div>
            <div class="text-2xl font-bold text-slate-800">{{ $latest_analysis && $latest_analysis->plant_height !== null ? number_format($latest_analysis->plant_height, 1) : '—' }}</div>
            <div class="text-[10px] text-slate-500 mt-1">หน่วย: ซม.</div>
        </div>

        <div class="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
            <div class="flex items-center justify-between mb-2">
                <span class="text-slate-500 text-sm font-medium">ความกว้างพุ่มล่าสุด</span>
                <div class="w-8 h-8 rounded-lg bg-brand-50 text-brand-500 flex items-center justify-center">
                    <i class="ph ph-arrows-out-line-horizontal"></i>
                </div>
            </div>
            <div class="text-2xl font-bold text-slate-800">{{ $latest_analysis && $latest_analysis->canopy_width !== null ? number_format($latest_analysis->canopy_width, 1) : '—' }}</div>
            <div class="text-[10px] text-slate-500 mt-1">หน่วย: ซม.</div>
        </div>

        <div class="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
            <div class="flex items-center justify-between mb-2">
                <span class="text-slate-500 text-sm font-medium">ความกว้างใบล่าสุด</span>
                <div class="w-8 h-8 rounded-lg bg-brand-50 text-brand-500 flex items-center justify-center">
                    <i class="ph ph-leaf"></i>
                </div>
            </div>
            <div class="text-2xl font-bold text-slate-800">{{ $latest_analysis && $latest_analysis->leaf_width !== null ? number_format($latest_analysis->leaf_width, 1) : '—' }}</div>
            <div class="text-[10px] text-slate-500 mt-1">หน่วย: ซม.</div>
        </div>

        <div class="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
            <div class="flex items-center justify-between mb-2">
                <span class="text-slate-500 text-sm font-medium">จำนวนใบล่าสุด</span>
                <div class="w-8 h-8 rounded-lg bg-brand-50 text-brand-500 flex items-center justify-center">
                    <i class="ph ph-list-numbers"></i>
                </div>
            </div>
            <div class="text-2xl font-bold text-slate-800">{{ $latest_analysis && $latest_analysis->leaf_count !== null ? number_format($latest_analysis->leaf_count) : '—' }}</div>
            <div class="text-[10px] text-slate-500 mt-1">หน่วย: ใบ</div>
        </div>

        <div class="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
            <div class="flex items-center justify-between mb-2">
                <span class="text-slate-500 text-sm font-medium">น้ำหนักสดรวมรากล่าสุด</span>
                <div class="w-8 h-8 rounded-lg bg-brand-50 text-brand-500 flex items-center justify-center">
                    <i class="ph ph-scales"></i>
                </div>
            </div>
            <div class="text-2xl font-bold text-slate-800">{{ $latest_analysis && $latest_analysis->fresh_weight_with_root !== null ? number_format($latest_analysis->fresh_weight_with_root, 1) : '—' }}</div>
            <div class="text-[10px] text-slate-500 mt-1">หน่วย: กรัม</div>
        </div>
    </div>

    {{-- ส่วนแสดงการวิเคราะห์รายต้นและการบำรุงรักษา --}}
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div class="lg:col-span-2 bg-white border border-slate-100 rounded-2xl overflow-hidden shadow-sm">
            <div class="p-6 border-b border-slate-50 flex justify-between items-center bg-slate-50/50">
                <h3 class="font-bold text-slate-800 flex items-center gap-2">
                    <i class="ph ph-clock-counter-clockwise text-brand-500"></i> การวิเคราะห์ล่าสุด
                </h3>
                <a href="/history" class="text-xs font-semibold text-brand-600 hover:underline">ดูทั้งหมด</a>
            </div>
            
            <div class="p-6">
                @if($latest_analysis)
                <div class="flex gap-6 items-center">
                    <div class="w-40 h-28 bg-slate-100 rounded-xl overflow-hidden shrink-0 border border-slate-200">
                        @if($latest_analysis->image_path)
                            <img src="{{ Str::startsWith($latest_analysis->image_path, 'http') ? $latest_analysis->image_path : Storage::url($latest_analysis->image_path) }}" class="w-full h-full object-cover">
                        @else
                            <div class="w-full h-full flex items-center justify-center text-slate-300">
                                <i class="ph ph-image text-3xl"></i>
                            </div>
                        @endif
                    </div>
                    <div class="flex-1">
                        <div class="flex items-center gap-2 mb-1">
                            <span class="px-2 py-0.5 bg-brand-50 text-brand-600 text-[10px] font-bold rounded uppercase">{{ $latest_analysis->identified_species ?? 'Unknown Species' }}</span>
                            <span class="px-2 py-0.5 {{ $latest_analysis->severity == 'High' ? 'bg-red-50 text-red-600' : 'bg-brand-50 text-brand-600' }} text-[10px] font-bold rounded uppercase">{{ $latest_analysis->severity }}</span>
                        </div>
                        <h4 class="font-bold text-slate-800">{{ $latest_analysis->diagnosis_summary }}</h4>
                        <p class="text-sm text-slate-500 mt-1 line-clamp-2">{{ $latest_analysis->diagnosis_details }}</p>
                        <div class="mt-3 text-[10px] text-slate-400 flex items-center gap-2">
                            <i class="ph ph-calendar"></i> {{ \Carbon\Carbon::parse($latest_analysis->timestamp)->locale('th')->diffForHumans() }}
                        </div>
                    </div>
                </div>
                @else
                <div class="text-center py-10">
                    <i class="ph ph-folder-open text-4xl text-slate-200 mb-2"></i>
                    <p class="text-slate-400">ยังไม่มีข้อมูลการวิเคราะห์</p>
                </div>
                @endif
            </div>
        </div>

        <div class="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm flex flex-col">
            <h3 class="font-bold text-slate-800 mb-4">การบำรุงรักษา</h3>
            <div class="space-y-4 flex-1">
                <div class="flex gap-4">
                <div class="flex gap-4">
                    <div class="w-10 h-10 rounded-xl bg-brand-50 text-brand-600 flex items-center justify-center shrink-0">
                        <i class="ph ph-database text-xl"></i>
                    </div>
                    <div>
                        <p class="text-sm font-bold text-slate-800">ไม่มีข้อมูล</p>
                        <p class="text-xs text-slate-500">รอการตรวจสอบถัดไป</p>
                    </div>
                </div>
                <div class="flex gap-4">
                    <div class="w-10 h-10 rounded-xl bg-brand-50 text-brand-600 flex items-center justify-center shrink-0">
                        <i class="ph ph-database text-xl"></i>
                    </div>
                    <div>
                        <p class="text-sm font-bold text-slate-800">—</p>
                        <p class="text-xs text-slate-500">—</p>
                    </div>
                </div>
            </div>
            <button class="w-full mt-6 py-3 bg-slate-50 hover:bg-slate-100 text-slate-700 font-bold rounded-xl border border-slate-200 text-sm transition-all">
                บันทึกการบำรุงรักษา
            </button>
        </div>
    </div>
</div>
@endsection
