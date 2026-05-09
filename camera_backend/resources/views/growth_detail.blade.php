@extends('layouts.app')

@section('title', $plant->name . ' - การเจริญเติบโต')
@section('header_title', 'รายละเอียดการเจริญเติบโต')

@section('styles')
<style>
    .chart-card { background: #fff; border-radius: 1.5rem; border: 1px solid #f1f5f9; box-shadow: 0 2px 12px rgba(0,0,0,0.04); padding: 1.5rem; }
    .chart-wrapper { position: relative; height: 200px; }
    .stat-pill { display: flex; align-items: center; gap: 10px; padding: 12px 16px; background: #f8fafc; border-radius: 14px; }
    .tl-dot-line { position: absolute; left: 13px; top: 26px; bottom: -12px; width: 2px; background: #e2e8f0; }
    .fade-in { animation: fadeIn 0.35s ease both; }
    @keyframes fadeIn { from { opacity:0; transform:translateY(8px); } to { opacity:1; transform:translateY(0); } }
</style>
@endsection

@section('content')

{{-- Back + Header --}}
<div class="flex items-center gap-4 mb-6">
    <a href="{{ route('growth.index') }}"
       class="w-10 h-10 rounded-2xl bg-slate-100 hover:bg-slate-200 flex items-center justify-center transition-colors">
        <i class="ph ph-arrow-left text-slate-600 text-xl"></i>
    </a>
    <div class="flex-1">
        <h2 class="text-xl font-black text-slate-800">{{ $plant->name }}</h2>
        <p class="text-xs text-slate-400 mt-0.5 flex items-center gap-2">
            <span class="flex items-center gap-1"><i class="ph ph-user-circle"></i> {{ $plant->user ? $plant->user->name : 'ไม่ระบุ' }}</span>
            <span class="text-slate-200">·</span>
            <span>{{ $plant->analyses_count }} บันทึก</span>
            <span class="text-slate-200">·</span>
            <span>ข้อมูล 30 วันล่าสุด</span>
        </p>
    </div>
    @if($plant->latestAnalysis)
    <div class="text-right">
        <p class="text-[10px] text-slate-400 font-bold uppercase tracking-wider">อัปเดตล่าสุด</p>
        <p class="text-sm font-black text-brand-600">
            {{ \Carbon\Carbon::parse($plant->latestAnalysis->timestamp)->locale('th')->diffForHumans() }}
        </p>
    </div>
    @endif
</div>

@php $latest = $plant->latestAnalysis; @endphp

{{-- ====== Summary Stats Row ====== --}}
<div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 mb-6 fade-in">
    @php
        $summaryStats = [
            ['label'=>'ความสูง',     'val'=>$latest ? $latest->plant_height : null,           'unit'=>'ซม.', 'icon'=>'ph-ruler',                    'color'=>'text-brand-600', 'bg'=>'bg-brand-50'],
            ['label'=>'พุ่มใบ',       'val'=>$latest ? $latest->canopy_width : null,            'unit'=>'ซม.', 'icon'=>'ph-arrows-out-line-horizontal','color'=>'text-brand-600', 'bg'=>'bg-brand-50'],
            ['label'=>'กว้างใบ',      'val'=>$latest ? $latest->leaf_width : null,              'unit'=>'ซม.', 'icon'=>'ph-leaf',                     'color'=>'text-green-600', 'bg'=>'bg-green-50'],
            ['label'=>'จำนวนใบ',     'val'=>$latest ? $latest->leaf_count : null,              'unit'=>'ใบ',  'icon'=>'ph-list-numbers',             'color'=>'text-green-600', 'bg'=>'bg-green-50'],
            ['label'=>'น้ำหนักสด',   'val'=>$latest ? $latest->fresh_weight_with_root : null,  'unit'=>'ก.',  'icon'=>'ph-scales',                   'color'=>'text-amber-600', 'bg'=>'bg-amber-50'],
        ];
    @endphp
    @foreach($summaryStats as $s)
    <div class="{{ $s['bg'] }} rounded-2xl p-4 text-center">
        <i class="ph {{ $s['icon'] }} {{ $s['color'] }} text-xl mb-1"></i>
        <p class="font-black text-slate-800 text-lg leading-tight">
            {{ $s['val'] !== null ? number_format((float)$s['val'], $s['label']==='จำนวนใบ' ? 0 : 1) : '—' }}
            @if($s['unit'])<span class="text-xs font-bold text-slate-400 ml-0.5">{{ $s['unit'] }}</span>@endif
        </p>
        <p class="text-[10px] text-slate-500 font-bold mt-1">{{ $s['label'] }}</p>
    </div>
    @endforeach
</div>

@if($labels->isEmpty())
{{-- No chart data --}}
<div class="flex flex-col items-center justify-center py-16 text-center bg-slate-50 rounded-3xl border-2 border-dashed border-slate-200 mb-6">
    <i class="ph ph-chart-line-up text-5xl text-slate-300 mb-3"></i>
    <p class="font-bold text-slate-400">ยังไม่มีข้อมูลสำหรับกราฟ</p>
    <p class="text-sm text-slate-300 mt-1">บันทึกการเจริญเติบโตผ่านแอปมือถือเพื่อดูกราฟ</p>
</div>

@else
{{-- ====== Charts Grid ====== --}}
<div class="grid grid-cols-1 md:grid-cols-2 gap-5 mb-6">

    {{-- Chart 1: ความสูง --}}
    <div class="chart-card fade-in" style="animation-delay:0.05s">
        <div class="flex items-center justify-between mb-4">
            <div>
                <h4 class="font-black text-slate-800">ความสูงต้น</h4>
                <p class="text-[11px] text-slate-400">หน่วย: เซนติเมตร</p>
            </div>
            <div class="w-9 h-9 rounded-xl bg-brand-50 text-brand-500 flex items-center justify-center">
                <i class="ph ph-ruler text-lg"></i>
            </div>
        </div>
        <div class="chart-wrapper"><canvas id="heightChart"></canvas></div>
    </div>

    {{-- Chart 2: ความกว้างพุ่ม --}}
    <div class="chart-card fade-in" style="animation-delay:0.10s">
        <div class="flex items-center justify-between mb-4">
            <div>
                <h4 class="font-black text-slate-800">ความกว้างพุ่ม</h4>
                <p class="text-[11px] text-slate-400">หน่วย: เซนติเมตร</p>
            </div>
            <div class="w-9 h-9 rounded-xl bg-brand-50 text-brand-500 flex items-center justify-center">
                <i class="ph ph-arrows-out-line-horizontal text-lg"></i>
            </div>
        </div>
        <div class="chart-wrapper"><canvas id="canopyChart"></canvas></div>
    </div>

    {{-- Chart 3: ความกว้างใบ --}}
    <div class="chart-card fade-in" style="animation-delay:0.15s">
        <div class="flex items-center justify-between mb-4">
            <div>
                <h4 class="font-black text-slate-800">ความกว้างใบ</h4>
                <p class="text-[11px] text-slate-400">หน่วย: เซนติเมตร</p>
            </div>
            <div class="w-9 h-9 rounded-xl bg-green-50 text-green-500 flex items-center justify-center">
                <i class="ph ph-leaf text-lg"></i>
            </div>
        </div>
        <div class="chart-wrapper"><canvas id="leafWidthChart"></canvas></div>
    </div>

    {{-- Chart 4: จำนวนใบ --}}
    <div class="chart-card fade-in" style="animation-delay:0.20s">
        <div class="flex items-center justify-between mb-4">
            <div>
                <h4 class="font-black text-slate-800">จำนวนใบ</h4>
                <p class="text-[11px] text-slate-400">หน่วย: ใบ</p>
            </div>
            <div class="w-9 h-9 rounded-xl bg-green-50 text-green-500 flex items-center justify-center">
                <i class="ph ph-list-numbers text-lg"></i>
            </div>
        </div>
        <div class="chart-wrapper"><canvas id="leafCountChart"></canvas></div>
    </div>

    {{-- Chart 5: น้ำหนักสด (full width) --}}
    <div class="chart-card md:col-span-2 fade-in" style="animation-delay:0.25s">
        <div class="flex items-center justify-between mb-4">
            <div>
                <h4 class="font-black text-slate-800">น้ำหนักสดรวมราก</h4>
                <p class="text-[11px] text-slate-400">หน่วย: กรัม</p>
            </div>
            <div class="w-9 h-9 rounded-xl bg-amber-50 text-amber-500 flex items-center justify-center">
                <i class="ph ph-scales text-lg"></i>
            </div>
        </div>
        <div class="chart-wrapper" style="height:160px"><canvas id="freshWeightChart"></canvas></div>
    </div>

</div>
@endif

{{-- ====== Timeline ====== --}}
<div class="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden fade-in" style="animation-delay:0.40s">
    <div class="flex items-center justify-between px-6 py-4 border-b border-slate-50 bg-slate-50/50">
        <h3 class="font-black text-slate-800 flex items-center gap-2">
            <i class="ph ph-clock-clockwise text-brand-500"></i> ประวัติบันทึกทั้งหมด
        </h3>
        <span class="text-[11px] text-slate-400 font-bold">{{ $plant->analyses_count }} รายการ · แสดง 20 ล่าสุด</span>
    </div>

    <div class="p-6">
        @if($timeline->isEmpty())
        <div class="text-center py-10">
            <i class="ph ph-clipboard text-4xl text-slate-300 mb-3"></i>
            <p class="text-slate-400">ยังไม่มีบันทึก</p>
        </div>
        @else
        <div class="flex flex-col gap-0">
            @foreach($timeline as $ti => $entry)
            <div class="flex gap-4 relative {{ $ti < $timeline->count() - 1 ? 'pb-5' : '' }}">
                {{-- Connector Line --}}
                @if($ti < $timeline->count() - 1)
                <div class="tl-dot-line"></div>
                @endif

                {{-- Dot --}}
                <div class="w-7 h-7 rounded-full border-2 shrink-0 z-10 mt-0.5 flex items-center justify-center
                    {{ $ti === 0 ? 'bg-brand-500 border-brand-500' : 'bg-white border-slate-200' }}">
                    <i class="ph ph-camera text-[9px] {{ $ti === 0 ? 'text-white' : 'text-slate-400' }}"></i>
                </div>

                {{-- Content --}}
                <div class="flex-1 pb-1">
                    {{-- Date + Source --}}
                    <div class="flex items-center gap-2 mb-2 flex-wrap">
                        <span class="text-xs font-black text-slate-700">
                            {{ \Carbon\Carbon::parse($entry->timestamp)->format('d M Y · H:i') }}
                        </span>
                        @if($entry->source)
                        <span class="text-[9px] font-bold px-2 py-0.5 bg-slate-100 text-slate-500 rounded-lg uppercase tracking-wide">
                            {{ $entry->source }}
                        </span>
                        @endif
                        @if($ti === 0)
                        <span class="text-[9px] font-bold px-2 py-0.5 bg-brand-50 text-brand-600 rounded-lg">ล่าสุด</span>
                        @endif
                    </div>

                    {{-- Metric Chips --}}
                    <div class="flex flex-wrap gap-1.5 mb-2">
                        @if($entry->plant_height !== null)
                        <span class="text-[10px] bg-brand-50 text-brand-700 px-2 py-1 rounded-lg font-bold">
                            สูง {{ number_format($entry->plant_height, 1) }} ซม.
                        </span>
                        @endif
                        @if($entry->canopy_width !== null)
                        <span class="text-[10px] bg-slate-50 text-slate-600 px-2 py-1 rounded-lg font-bold">
                            พุ่ม {{ number_format($entry->canopy_width, 1) }} ซม.
                        </span>
                        @endif
                        @if($entry->leaf_count !== null)
                        <span class="text-[10px] bg-green-50 text-green-700 px-2 py-1 rounded-lg font-bold">
                            {{ $entry->leaf_count }} ใบ
                        </span>
                        @endif
                        @if($entry->leaf_width !== null)
                        <span class="text-[10px] bg-slate-50 text-slate-600 px-2 py-1 rounded-lg font-bold">
                            กว้างใบ {{ number_format($entry->leaf_width, 1) }} ซม.
                        </span>
                        @endif
                        @if($entry->fresh_weight_with_root !== null)
                        <span class="text-[10px] bg-amber-50 text-amber-700 px-2 py-1 rounded-lg font-bold">
                            {{ number_format($entry->fresh_weight_with_root, 1) }} ก.
                        </span>
                        @endif
                    </div>

                    {{-- Image --}}
                    @if($entry->image_path)
                    <img src="{{ asset('storage/' . $entry->image_path) }}"
                         class="w-40 h-28 object-cover rounded-2xl mb-2 border border-slate-100"
                         alt="บันทึกการเจริญเติบโต">
                    @endif

                    {{-- AI Summary --}}
                    @if($entry->diagnosis_summary)
                    <div class="bg-brand-50 rounded-xl p-3 border border-brand-100 mt-2">
                        <p class="text-[10px] font-black text-brand-700 mb-1 flex items-center gap-1">
                            <i class="ph ph-robot"></i> AI วิเคราะห์
                        </p>
                        <p class="text-xs text-slate-600 leading-relaxed">{{ $entry->diagnosis_summary }}</p>
                    </div>
                    @endif
                </div>
            </div>
            @endforeach
        </div>
        @endif
    </div>
</div>

@endsection

@section('scripts')
<script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
@if(!$labels->isEmpty())
<script>
const labels = {!! $labels->toJson() !!};

const makeChart = (id, data, label, borderColor, bgColor, unit) => {
    const el = document.getElementById(id);
    if (!el) return;
    new Chart(el, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: label,
                data: data,
                borderColor: borderColor,
                backgroundColor: bgColor,
                borderWidth: 2.5,
                tension: 0.4,
                cubicInterpolationMode: 'monotone',
                fill: true,
                pointRadius: 4,
                pointHoverRadius: 6,
                pointBackgroundColor: '#fff',
                pointBorderColor: borderColor,
                pointBorderWidth: 2,
                spanGaps: true,
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            interaction: { mode: 'index', intersect: false },
            plugins: {
                legend: { display: false },
                tooltip: {
                    callbacks: {
                        label: ctx => ctx.parsed.y !== null
                            ? (label + ': ' + ctx.parsed.y.toFixed(1) + ' ' + unit)
                            : 'ไม่มีข้อมูล'
                    }
                }
            },
            scales: {
                y: {
                    grid: { color: '#f1f5f9' },
                    ticks: { font: { size: 10 }, color: '#94a3b8' }
                },
                x: {
                    grid: { display: false },
                    ticks: { font: { size: 9 }, color: '#94a3b8', maxTicksLimit: 8 }
                }
            }
        }
    });
};

makeChart('heightChart',     {!! $plant_height_values->toJson() !!},  'ความสูง',       '#1F4E1C', 'rgba(31,78,28,0.08)',   'ซม.');
makeChart('canopyChart',     {!! $canopy_width_values->toJson() !!},  'ความกว้างพุ่ม', '#2d7129', 'rgba(45,113,41,0.08)',  'ซม.');
makeChart('leafWidthChart',  {!! $leaf_width_values->toJson() !!},    'กว้างใบ',        '#16a34a', 'rgba(22,163,74,0.08)',  'ซม.');
makeChart('leafCountChart',  {!! $leaf_count_values->toJson() !!},    'จำนวนใบ',       '#15803d', 'rgba(21,128,61,0.08)',  'ใบ');
makeChart('freshWeightChart',{!! $fresh_weight_values->toJson() !!},  'น้ำหนักสด',     '#d97706', 'rgba(217,119,6,0.08)',  'ก.');
</script>
@endif
@endsection
