@extends('layouts.app')

{{-- หน้าแสดงข้อมูลประวัติ (การวิเคราะห์/แชท) --}}

@section('title', 'ประวัติการวิเคราะห์ AI - PlantoEye')
@section('header_title', 'ประวัติการวิเคราะห์ (AI History)')

@section('content')
@php
    $typeLabels = [
        'growth' => ['label' => 'การเจริญเติบโต', 'icon' => 'ph-chart-line-up', 'sub' => 'ประวัติความสูง พุ่มใบ และน้ำหนักพืช'],
        'camera' => ['label' => 'ดูกล้องสด', 'icon' => 'ph-video-camera', 'sub' => 'บันทึกภาพและผลวิเคราะห์จากกล้อง'],
        'disease' => ['label' => 'วิเคราะห์โรค', 'icon' => 'ph-magnifying-glass', 'sub' => 'ประวัติการตรวจพบความผิดปกติและโรคพืช'],
        'chat' => ['label' => 'แชทบอท ai', 'icon' => 'ph-robot', 'sub' => 'ประวัติการสนทนากับผู้ช่วย AI'],
        'all' => ['label' => 'ทั้งหมด', 'icon' => 'ph-clock-counter-clockwise', 'sub' => 'บันทึกการวิเคราะห์ย้อนหลังทั้งหมด']
    ];
    $current = $typeLabels[$type] ?? $typeLabels['all'];
@endphp

<div class="space-y-6">
    <div class="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
            <h3 class="text-xl font-bold text-slate-800 flex items-center gap-2">
                <i class="ph {{ $current['icon'] }} text-brand-500"></i> {{ $current['label'] }}
            </h3>
            <p class="text-slate-500 mt-1 text-sm">{{ $current['sub'] }}</p>
        </div>
        <div class="flex gap-2">
            <button class="px-4 py-2 bg-slate-50 border border-slate-100 rounded-xl text-sm font-medium text-slate-600 hover:bg-slate-100 transition-all">
                <i class="ph ph-funnel mr-1"></i> ตัวกรอง
            </button>
        </div>
    </div>

    @if($type === 'chat')
    {{-- ตารางแสดงประวัติการแชทกับ AI --}}
    <div class="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div class="overflow-x-auto">
            <table class="w-full text-left border-collapse">
                <thead>
                    <tr class="bg-slate-50/50 border-b border-slate-100">
                        <th class="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider w-16 text-center">ไอคอน</th>
                        <th class="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">หัวข้อการสนทนา</th>
                        <th class="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">ข้อความล่าสุด</th>
                        <th class="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">วันเวลา</th>
                        <th class="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider text-right">ดำเนินการ</th>
                    </tr>
                </thead>
                <tbody class="divide-y divide-slate-50">
                    @forelse($history as $item)
                    <tr class="hover:bg-slate-50/50 transition-colors">
                        <td class="px-6 py-4">
                            <div class="w-10 h-10 bg-brand-50 rounded-xl flex items-center justify-center mx-auto text-brand-600">
                                <i class="ph-fill ph-robot text-xl"></i>
                            </div>
                        </td>
                        <td class="px-6 py-4">
                            <div class="text-sm font-bold text-slate-800">{{ $item->title }}</div>
                            <div class="text-[10px] text-brand-600 font-semibold uppercase">ID: {{ Str::limit($item->id, 15) }}</div>
                        </td>
                        <td class="px-6 py-4">
                            <div class="text-sm text-slate-600 font-medium truncate max-w-sm">{{ Str::limit($item->last_message, 50, '...') ?: 'ไม่มีข้อความ' }}</div>
                        </td>
                        <td class="px-6 py-4">
                            <div class="text-sm font-medium text-slate-700">{{ \Carbon\Carbon::createFromTimestampMs($item->timestamp)->locale('th')->isoFormat('D MMM YYYY') }}</div>
                            <div class="text-xs text-slate-400">{{ \Carbon\Carbon::createFromTimestampMs($item->timestamp)->locale('th')->isoFormat('HH:mm') }} น.</div>
                        </td>
                        <td class="px-6 py-4 text-right">
                            <div class="flex items-center justify-end gap-2">
                                <a href="{{ route('history.chat.show', $item->id) }}" class="w-8 h-8 rounded-lg text-slate-400 hover:bg-brand-50 hover:text-brand-600 transition-all flex items-center justify-center">
                                    <i class="ph ph-eye text-lg"></i>
                                </a>
                                <form action="{{ route('history.chat.destroy', $item->id) }}" method="POST" class="inline-block" onsubmit="return confirm('ยืนยันการลบประวัติแชทนี้ใช่หรือไม่?');">
                                    @csrf
                                    @method('DELETE')
                                    <button type="submit" class="w-8 h-8 rounded-lg text-slate-400 hover:bg-red-50 hover:text-red-600 transition-all flex items-center justify-center">
                                        <i class="ph ph-trash text-lg"></i>
                                    </button>
                                </form>
                            </div>
                        </td>
                    </tr>
                    @empty
                    <tr>
                        <td colspan="5" class="px-6 py-20 text-center">
                            <i class="ph ph-chat-teardrop-slash text-5xl text-slate-200 mb-2"></i>
                            <p class="text-slate-400 font-medium">ยังไม่มีประวัติการสนทนากับ AI</p>
                        </td>
                    </tr>
                    @endforelse
                </tbody>
            </table>
        </div>
        
        @if($history && method_exists($history, 'hasPages') && $history->hasPages())
        <div class="p-6 border-t border-slate-50 bg-slate-50/30">
            {{ $history->links() }}
        </div>
        @endif
    </div>
    @else
    {{-- ตารางแสดงประวัติผลการวิเคราะห์พืช --}}
    <div class="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div class="overflow-x-auto">
            <table class="w-full text-left border-collapse">
                <thead>
                    <tr class="bg-slate-50/50 border-b border-slate-100">
                        <th class="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider text-center">รูปภาพ</th>
                        <th class="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">วัน-เวลา</th>
                        <th class="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">พืช / ชนิด</th>
                        @if($type === 'growth')
                        <th class="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">ตัวชี้วัด (Metrics)</th>
                        @else
                        <th class="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">ผลการวินิจฉัย</th>
                        @endif
                        <th class="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">ความรุนแรง</th>
                        <th class="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">ความเชื่อมั่น</th>
                        <th class="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider text-right">จัดการ</th>
                    </tr>
                </thead>
                <tbody class="divide-y divide-slate-50">
                    @forelse($history as $item)
                    <tr class="hover:bg-slate-50/50 transition-colors">
                        <td class="px-6 py-4">
                            <div class="w-16 h-12 bg-slate-100 rounded-lg overflow-hidden mx-auto border border-slate-200">
                                @if($item->image_path)
                                    <img src="{{ Str::startsWith($item->image_path, 'http') ? $item->image_path : Storage::url($item->image_path) }}" class="w-full h-full object-cover">
                                @else
                                    <div class="w-full h-full flex items-center justify-center text-slate-300">
                                        <i class="ph ph-image"></i>
                                    </div>
                                @endif
                            </div>
                        </td>
                        <td class="px-6 py-4">
                            <div class="text-sm font-medium text-slate-700">{{ \Carbon\Carbon::parse($item->timestamp)->locale('th')->isoFormat('D MMM YYYY') }}</div>
                            <div class="text-xs text-slate-400">{{ \Carbon\Carbon::parse($item->timestamp)->locale('th')->isoFormat('HH:mm') }} น.</div>
                        </td>
                        <td class="px-6 py-4">
                            <div class="text-sm font-bold text-slate-800">{{ $item->plant_name }}</div>
                            <div class="text-[10px] text-brand-600 font-semibold uppercase">{{ $item->identified_species ?? 'N/A' }}</div>
                        </td>
                        <td class="px-6 py-4">
                            @if($type === 'growth')
                                <div class="flex flex-wrap gap-1">
                                    @if($item->plant_height) <span class="px-1.5 py-0.5 bg-green-50 text-green-700 text-[10px] font-bold rounded">H: {{ $item->plant_height }}ซม.</span> @endif
                                    @if($item->leaf_count) <span class="px-1.5 py-0.5 bg-blue-50 text-blue-700 text-[10px] font-bold rounded">L: {{ $item->leaf_count }}ใบ</span> @endif
                                    @if($item->fresh_weight_with_root) <span class="px-1.5 py-0.5 bg-amber-50 text-amber-700 text-[10px] font-bold rounded">W: {{ $item->fresh_weight_with_root }}ก.</span> @endif
                                </div>
                            @else
                                <div class="text-sm text-slate-600 font-medium">{{ Str::limit($item->diagnosis_summary, 40) }}</div>
                                <div class="text-[10px] text-slate-400 truncate max-w-[150px]">{{ $item->health_status }}</div>
                            @endif
                        </td>
                        <td class="px-6 py-4">
                            @php
                                $severityMap = [
                                    'High' => 'bg-red-50 text-red-600 border-red-100',
                                    'Medium' => 'bg-orange-50 text-orange-600 border-orange-100',
                                    'Normal' => 'bg-slate-50 text-slate-500 border-slate-100',
                                ];
                                $severityClass = $severityMap[$item->severity] ?? 'bg-green-50 text-green-600 border-green-100';
                            @endphp
                            <span class="px-2.5 py-1 {{ $severityClass }} border text-[10px] font-bold rounded-lg uppercase">
                                {{ $item->severity }}
                            </span>
                        </td>
                        <td class="px-6 py-4">
                            <div class="w-full bg-slate-100 rounded-full h-1.5 max-w-[60px] mb-1">
                                <div class="bg-brand-500 h-1.5 rounded-full" style="width: {{ $item->confidence }}%"></div>
                            </div>
                            <div class="text-[10px] text-slate-400 font-bold">{{ $item->confidence }}%</div>
                        </td>
                        <td class="px-6 py-4 text-right">
                            <div class="flex items-center justify-end gap-2">
                                <button class="w-8 h-8 rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-all flex items-center justify-center">
                                    <i class="ph ph-eye text-lg"></i>
                                </button>
                                <form action="{{ route('history.analysis.destroy', $item->id) }}" method="POST" class="inline-block" onsubmit="return confirm('ยืนยันการลบประวัติการวิเคราะห์นี้ใช่หรือไม่?');">
                                    @csrf
                                    @method('DELETE')
                                    <button type="submit" class="w-8 h-8 rounded-lg text-slate-400 hover:bg-red-50 hover:text-red-600 transition-all flex items-center justify-center">
                                        <i class="ph ph-trash text-lg"></i>
                                    </button>
                                </form>
                            </div>
                        </td>
                    </tr>
                    @empty
                    <tr>
                        <td colspan="7" class="px-6 py-20 text-center">
                            <i class="ph ph-folder-open text-5xl text-slate-200 mb-2"></i>
                            <p class="text-slate-400 font-medium">ไม่พบรายการวิเคราะห์ในหมวดหมู่นี้</p>
                        </td>
                    </tr>
                    @endforelse
                </tbody>
            </table>
        </div>
        
        @if($history && method_exists($history, 'hasPages') && $history->hasPages())
        <div class="p-6 border-t border-slate-50 bg-slate-50/30">
            {{ $history->links() }}
        </div>
        @endif
    </div>
    @endif
</div>
@endsection
