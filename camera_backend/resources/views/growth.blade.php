@extends('layouts.app')

@section('title', 'การเจริญเติบโต - PlantoEye')
@section('header_title', 'ติดตามการเจริญเติบโต')

@section('styles')
<style>
    .plant-card {
        transition: all 0.18s ease;
        text-decoration: none;
    }
    .plant-card:hover {
        transform: translateY(-3px);
        box-shadow: 0 16px 40px rgba(31,78,28,0.12);
        border-color: #1F4E1C !important;
    }
    .fade-in { animation: fadeIn 0.3s ease both; }
    {{ '@' }}keyframes fadeIn {
        from { opacity: 0; transform: translateY(8px); }
        to   { opacity: 1; transform: translateY(0); }
    }
    .metric-bar-bg {
        height: 5px;
        background: #f1f5f9;
        border-radius: 99px;
        overflow: hidden;
    }
    .metric-bar-fill {
        height: 5px;
        border-radius: 99px;
        transition: width 0.6s ease;
    }
</style>
@endsection

@section('content')

{{-- Header --}}
<div class="flex items-center justify-between mb-6">
    <div>
        <h2 class="text-xl font-black text-slate-800">แปลงผักทั้งหมด</h2>
        <p class="text-xs text-slate-400 mt-0.5">คลิกที่การ์ดเพื่อดูกราฟการเจริญเติบโต</p>
    </div>
    <div class="flex items-center gap-2 bg-brand-50 text-brand-700 text-xs font-black px-3 py-2 rounded-xl border border-brand-100">
        <i class="ph ph-plant"></i> {{ $plants->count() }} แปลง
    </div>
</div>

@if($plants->isEmpty())
{{-- Empty State --}}
<div class="flex flex-col items-center justify-center py-24 text-center">
    <div class="w-20 h-20 rounded-3xl bg-slate-50 flex items-center justify-center mb-5 border-2 border-dashed border-slate-200">
        <i class="ph ph-plant text-5xl text-slate-300"></i>
    </div>
    <h3 class="font-black text-slate-500 text-lg mb-2">ยังไม่มีแปลงผัก</h3>
    <p class="text-slate-400 text-sm max-w-xs">เพิ่มแปลงผักผ่านแอป PlantoEye บนมือถือ ข้อมูลจะซิงค์มาแสดงที่นี่โดยอัตโนมัติ</p>
    <div class="mt-5 flex items-center gap-2 bg-brand-50 text-brand-600 text-xs font-bold px-4 py-2.5 rounded-xl border border-brand-100">
        <i class="ph ph-device-mobile text-base"></i> เพิ่มผ่าน PlantoEye App
    </div>
</div>

@else
{{-- ===== 4-column card grid ===== --}}
<div class="grid grid-cols-2 lg:grid-cols-4 gap-4">

    @foreach($plants as $i => $plant)
    @php
        $latest  = $plant->latestAnalysis;
        $hasData = $plant->analyses_count > 0;
        $owner   = $plant->user ? $plant->user->name : 'ไม่ระบุ';

        // 5 metrics with max reference values for bar width
        $metrics = [
            ['label' => 'ความสูง',   'val' => $latest ? $latest->plant_height           : null, 'unit' => 'ซม.', 'max' => 60,  'color' => '#1F4E1C'],
            ['label' => 'พุ่มใบ',     'val' => $latest ? $latest->canopy_width            : null, 'unit' => 'ซม.', 'max' => 40,  'color' => '#2d7129'],
            ['label' => 'กว้างใบ',    'val' => $latest ? $latest->leaf_width              : null, 'unit' => 'ซม.', 'max' => 20,  'color' => '#16a34a'],
            ['label' => 'จำนวนใบ',   'val' => $latest ? $latest->leaf_count              : null, 'unit' => 'ใบ',  'max' => 40,  'color' => '#22c55e'],
            ['label' => 'น้ำหนัก',    'val' => $latest ? $latest->fresh_weight_with_root  : null, 'unit' => 'ก.',  'max' => 200, 'color' => '#d97706'],
        ];
    @endphp

    <a href="{{ route('growth.show', $plant->id) }}"
       class="plant-card bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden block fade-in"
       style="animation-delay: {{ $i * 0.04 }}s">

        <div class="p-4">
            {{-- Header row --}}
            <div class="flex items-center gap-2.5 mb-3">
                <div class="w-8 h-8 rounded-xl bg-brand-50 text-brand-600 flex items-center justify-center shrink-0">
                    <i class="ph ph-plant text-base"></i>
                </div>
                <div class="flex-1 min-w-0">
                    <h3 class="font-black text-slate-800 text-sm leading-tight truncate">{{ $plant->name }}</h3>
                    <p class="text-[10px] text-slate-400 truncate flex items-center gap-0.5 mt-0.5">
                        <i class="ph ph-user-circle text-[10px]"></i> {{ $owner }}
                    </p>
                </div>
                <span class="shrink-0 text-[9px] font-black px-1.5 py-0.5 rounded-lg
                    {{ $hasData ? 'bg-green-50 text-green-600' : 'bg-slate-100 text-slate-400' }}">
                    {{ $plant->analyses_count }}
                </span>
            </div>

            {{-- ===== Metric bars ===== --}}
            @if($hasData && $latest)
            <div class="flex flex-col gap-2">
                @foreach($metrics as $m)
                <div>
                    <div class="flex items-center justify-between mb-1">
                        <span class="text-[9px] text-slate-500 font-bold">{{ $m['label'] }}</span>
                        <span class="text-[10px] font-black" style="color: {{ $m['color'] }}">
                            @if($m['val'] !== null)
                                {{ $m['label'] === 'จำนวนใบ' ? (int)$m['val'] : number_format((float)$m['val'], 1) }}
                                <span class="text-[8px] text-slate-400 font-normal">{{ $m['unit'] }}</span>
                            @else
                                <span class="text-slate-300">—</span>
                            @endif
                        </span>
                    </div>
                    <div class="metric-bar-bg">
                        <div class="metric-bar-fill"
                             style="width: {{ $m['val'] !== null ? min(100, ($m['val'] / $m['max']) * 100) : 0 }}%;
                                    background-color: {{ $m['color'] }}"></div>
                    </div>
                </div>
                @endforeach
            </div>

            @else
            {{-- No data --}}
            <div class="flex flex-col items-center justify-center py-4 text-center">
                <i class="ph ph-camera-slash text-2xl text-slate-200 mb-1"></i>
                <p class="text-[10px] text-slate-300 font-bold">ยังไม่มีบันทึก</p>
            </div>
            @endif

            {{-- Footer --}}
            <div class="flex items-center justify-between mt-3 pt-3 border-t border-slate-50">
                <span class="text-[9px] text-slate-400 truncate">
                    @if($latest)
                        {{ \Carbon\Carbon::parse($latest->timestamp)->locale('th')->diffForHumans() }}
                    @else
                        เพิ่งสร้าง
                    @endif
                </span>
                <span class="text-brand-500 text-[9px] font-bold flex items-center gap-0.5 shrink-0">
                    ดูกราฟ <i class="ph ph-arrow-right text-xs"></i>
                </span>
            </div>
        </div>
    </a>
    @endforeach

</div>
@endif

@endsection
